---
title: strlen()
---

# strlen()

```c:no-line-numbers
/* Return the length of the null-terminated string STR.  Scan for
   the null terminator quickly by testing four bytes at a time.  */
size_t
__strlen (const char *str)
{
  /* Align pointer to sizeof op_t.  */
  const uintptr_t s_int = (uintptr_t) str;
  const op_t *word_ptr = (const op_t*) PTR_ALIGN_DOWN (str, sizeof (op_t)); // sizeof (op_t) = 8

  op_t word = *word_ptr;
  find_t mask = shift_find (find_zero_all (word), s_int);
  if (mask != 0)
    return index_first (mask);

  do
    word = *++word_ptr;
  while (! has_zero (word));

  return ((const char *) word_ptr) + index_first_zero (word) - str;
}
```

---

其中主要数据类型定义:
```c:no-line-numbers
typedef long int  intptr_t;
typedef unsigned long int  uintptr_t;
```
```c:no-line-numbers
// 定义了一个无符号长整型的别名op_t, __may_alias__属性允许此类型的指针与其他类型的指针指向同一内存地址, 
// 而不会触发严格别名规则导致的未定义行为, 绕过限制.
typedef unsigned long int __attribute__ ((__may_alias__)) op_t;
```
> `op_t`是处理器能直接操作的最大标量数据长度, 即机器的字长. 在`memcpy`、`strlen`等函数中, 常以字长`op_t`作为单位批量读写内存以提升性能.

---

第一部分分析:

```c:no-line-numbers
/* Align a value by rounding down to closest size.
   e.g. Using size of 4096, we get this behavior:
	{4095, 4096, 4097} = {0, 4096, 4096}.  */
#define ALIGN_DOWN(base, size)	((base) & -((__typeof__ (base)) (size)))
// 此处`size`为`op_t`类型的长度: 8字节; `base`为基地址指针, 类型已转换为`uinptr_t`. 
// 将`size`转换为与`base`相同类型, 然后令`base`和`size`的补码按位与, 
// 因为`size`一定是2的整数次方大小, 所以此操作等价于 `base%size`

/* Same as ALIGN_DOWN(), but automatically casts when base is a pointer.  */
#define PTR_ALIGN_DOWN(base, size) \
  ((__typeof__ (base)) ALIGN_DOWN ((uintptr_t) (base), (size)))
// 返回原指针类型
```
> `__typeof__`是gcc和clang编译器支持的扩展关键字, 可在**编译**时推导变量类型(保留const、volatile等修饰), 广泛用于需要动态类型推导的场景, 如宏定义和泛型编程.

```c:no-line-numbers
/* Setup an word with each byte being c_in.  For instance, on a 64 bits
   machine with input as 0xce the functions returns 0xcececececececece.  */
static __always_inline op_t
repeat_bytes (unsigned char ch)
{
  return ((op_t)-1 / 0xff) * ch;
  // (op_t)-1 = 0xffffffffffffffff
  // (op_t)-1 / 0xff = 0x0101010101010101
  // (op_t)-1 / 0xff * ch = 0xch_ch_ch_ch_ch_ch_ch_ch
}
```
```c:no-line-numbers
/* The function return a byte mask.  */
typedef op_t find_t;

/* This function returns non-zero if any byte in X is zero.
   More specifically, at least one bit set within the least significant
   byte that was zero; other bytes within the word are indeterminate.  */
static __always_inline find_t
find_zero_low (op_t x)
{
  /* This expression comes from
       https://graphics.stanford.edu/~seander/bithacks.html#ZeroInWord
     Subtracting 1 sets 0x80 in a byte that was 0; anding ~x clears
     0x80 in a byte that was >= 128; anding 0x80 isolates that test bit.  */
  op_t lsb = repeat_bytes (0x01);
  op_t msb = repeat_bytes (0x80);
  return (x - lsb) & ~x & msb;
  // 该函数与下面find_zero_all函数不同之处在于:
  // 该函数只能确定第一个非零字节, 然后将其设置为 0x80.
  // (因为 x - lsb 可能导致非零字节借位)
}

/* This function returns at least one bit set within every byte of X that
   is zero.  The result is exact in that, unlike find_zero_low, all bytes
   are determinate.  This is usually used for finding the index of the
   most significant byte that was zero.  */
static __always_inline find_t
find_zero_all (op_t x)
{
  /* For each byte, find not-zero by
     (0) And 0x7f so that we cannot carry between bytes,
     (1) Add 0x7f so that non-zero carries into 0x80,
     (2) Or in the original byte (which might have had 0x80 set).
     Then invert and mask such that 0x80 is set iff that byte was zero.  */
  op_t m = repeat_bytes (0x7f);
  return ~(((x & m) + m) | x | m);
  // x & m: 屏蔽每个字节的最高位, 防止最高位进位
  // (x & m) + m: 若某字节低7位非零, 则加法会进位到该字节最高位
  // ((x & m) + m) | x: 所有非零字节最高位都会设置为1
  // ((x & m) + m) | x | m: 所有字节的低7位也都设置为1
  // ~(((x & m) + m) | x | m): 所有非零字节都设置为 0x00, 所有零字节都设置为 0x80
}
```
```c:no-line-numbers
/* Return the mask WORD shifted based on S_INT address value, to ignore
   values not presented in the aligned word read.  */
static __always_inline find_t
shift_find (find_t word, uintptr_t s)
{
  if (__BYTE_ORDER == __LITTLE_ENDIAN) // 小端机器
    return word >> (CHAR_BIT * (s % sizeof (op_t))); // CHAR_BIT=8
  else
    return word << (CHAR_BIT * (s % sizeof (op_t)));
}
```

```c:no-line-numbers
static __always_inline int
ctz (find_t c)
{
  if (sizeof (find_t) == sizeof (unsigned long))
    return __builtin_ctzl (c);
  else
    return __builtin_ctzll (c);
}

/* A subroutine for the index_zero functions.  Given a test word C, return
   the (memory order) index of the first byte (in memory order) that is
   non-zero.  */
static __always_inline unsigned int
index_first (find_t c)
{
  int r; // 返回第一个非零位的位偏移
  if (__BYTE_ORDER == __LITTLE_ENDIAN)
    r = ctz (c); // count trailing zero (从小端第一位开始数)
  else
    r = clz (c); // count leading zero (从大端第一位开始数)
  return r / CHAR_BIT; // 转换为第一个非零字节的偏移 
}
```
以上代码使用编译器内置函数(__builtin_ctzl、__builtin_ctzll)直接生成硬件指令(如BSF、TZCNT), 避免手动位操作.

综上:
```c:no-line-numbers
/* Align pointer to sizeof op_t.  */
const uintptr_t s_int = (uintptr_t) str;
const op_t *word_ptr = (const op_t*) PTR_ALIGN_DOWN (str, sizeof (op_t)); // sizeof (op_t) = 8

op_t word = *word_ptr;
find_t mask = shift_find (find_zero_all (word), s_int);
```
首先将指针`str`向低地址对齐, 得到指针`op_t *word_ptr`. \
然后令`word`为`word_ptr`指向的第一个字的数据. \
设指针`str`距低地址方向对齐位置偏移k个字节, 则在函数`shift_find`中要将`find_zero_all(word)`的计算结果略去小端的k个字节, 这样才是`word_ptr`指向的第一个字中包含于`str`所指向内存的检测结果. \
然后将该结果作为掩码`mask`, 若`mask`不为0, 则说明第一个字中存在零字符, 将`mask`传入函数`index_first`即可计算出`mask`中非零字节从小端出发的偏移量, 对应从`str`指向的第一个字节开始的偏移量, 该偏移量对应于`str`指向字符串中字符数量, 不包含零字符.

---

第二部分分析:

```c:no-line-numbers
has_zero (op_t x)
{
  return find_zero_low (x) != 0;
}
```
```c:no-line-numbers
/* Given a word X that is known to contain a zero byte, return the index of
   the first such within the word in memory order.  */
static __always_inline unsigned int
index_first_zero (op_t x)
{
  if (__BYTE_ORDER == __LITTLE_ENDIAN)
    x = find_zero_low (x);
  else
    x = find_zero_all (x);
  return index_first (x);
}
```

综上:
```c:no-line-numbers
do
  word = *++word_ptr;
while (! has_zero (word));

return ((const char *) word_ptr) + index_first_zero (word) - str;
```
若`word_ptr`指向的第一个字中不包含`str`中的零字符, 则依次向后检测, 每次循环能够检测一个字中是否存在零字符, 而非逐个字节检测, 这充分利用了处理器的操作位数, 极大提高了查找效率. \
最后返回零字符所在字节地址与`str`所指向的第一字节地址的差值, 即为字符串长度, 该长度不包含零字符.