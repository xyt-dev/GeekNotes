---
title: Vec<T>
order: 2
---

## 创建Vec\<T\>

1. 显示指明类型
    ```rust:no-line-numbers
    let mut v: Vec<u32> = Vec::new();
    ```
    或
    ```rust:no-line-numbers
    let mut v = Vec::<u32>::new();
    ```
2. 隐式推断类型
    ```rust:no-line-numbers
    let mut v = Vec::new(); // 根据上下文推断出v是Vec<u32>
    println!("{:?}", v);
    v.push(666 as u32);
    ```
使用 `vec![]` 宏创建Vec\<T\>同理, 但可以同时赋初值.

## 下标索引与.get()方法

Vec\<T\> 的下标索引是通过 Trait Index\<T\> 重载'[ ]'运算符来实现的. \
Trait Index 定义:
```rust:no-line-numbers
pub trait Index<T> {
    type Output: ?Sized;
    fn index(&self, index: T) -> &Self::Output;
}
```
使用'[]'访问时如果下标越界, 会触发panic(); 而使用.get()返回的是Option\<T\>.

> Sized是一个Marker Trait, 它是特殊的内置的Trait(内置的标记Trait还有Send和Syn c). 标记Trait没有方法, 只用来说明属性; 而且这几种内置的标记Trait不能进行impl, 它们在编译时用来提供必要的信息.
> 
> 如果一个类型实现了 Sized，那么它的内存大小在编译时是固定的;
> 否则该类型为动态大小类型(DST), 其大小在编译时是未知的.
>
> 对于一个struct, 如果其所有数据字段都是Sized(如u8等基本类型), 则该struct为Sized;
> 如果其存在动态大小字段, 如\[u8\]和dyn Trait, 则该struct为动态大小的(?Sized).
>
> 此外, 泛型T默认也为Sized, 如果要说明其为动态大小类型, 需显式声明 ?Sized 特征约束.

## Vec遍历

Vec\<T\>实现了`IntoIterator Trait`, 实现了IntoIterator特征的类型在使用for in语句时会自动调用into_iter().
Vec\<T\> 在通过Iterator.next()迭代时每次访问都会触发数组边界检查, 更加安全高效. \
eg:
```rust:no-line-numbers
let mut v = vec![1, 2, 3];
for i in &mut v { // 修改元素需要 mut
  *i += 10
}
```
> **注意: Trait对于类型T, &T, &mut T的实现是完全独立的; 这里&Vec\<T\>和&mut Vec\<T\>调用into_iter()返回的iterator实例类型不同(返回的分别是std\::slice\::Iter\<T\>和std\::slice\::IterMut\<T\>类型).**


## 通过Wrapper(newType)给外部类型实现外部Trait

以Vec\<String\>为例:
```rust:no-line-numbers
use std::fmt;
use std::ops::{Deref, DerefMut};

struct Wrapper(Vec<String>);
impl fmt::Display for Wrapper {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "[{}]", self.join(", "))
  }
}
// Rust可以为实现了Deref的类型自动解引用, 简化使用
impl Deref for Wrapper {
  type Target = Vec<String>;
  fn deref(&self) -> &Self::Target {
    &self.0
  }
}
// DerefMut: Deref
impl DerefMut for Wrapper {
  fn deref_mut(&mut self) -> &mut Self::Target {
    &mut self.0
  }
}
fn main() {
  let mut w = Wrapper(vec![String::from("hello"), String::from("world")]);
  w.push(String::from("wow"));
  println!("w = {}", w);
}
```
点运算符调用行为见: ['.'运算符的行为](引用与解引用相关问题.md#运算符的行为)

## Vec\<T\>的标准库定义

  ```rust:no-line-numbers
  pub struct Vec<T, A: Allocator = Global> { // <参数: 约束 = 默认值>
      buf: RawVec<T, A>,
      len: usize,
  }
  ```
  Vec\<T\>的底层是一个堆上分配的可变长度数组(capacity变化时需reallocate内存), 其中元素在内存中连续存放且对齐, 不支持编译期大小不确定的元素, 同时T也默认具有Sized(标记特征)约束, 所以使用Vec需保证元素类型T为编译期确定的静态大小类型.

  > Global 是Rust标准库提供的 全局可调用(Global的含义)的 堆内存分配器, 用于给需要动态内存分配的类型(如Vec、Box、String)提供默认堆内存分配器, 在堆上分配连续内存. \
  > 其底层内存分配函数定义如下: 
  > ```rust:no-line-numbers
  > extern 'Rust' {
  >   fn __rust_alloc(size: usize, align: usize) -> *mut u8;
  >   // ...
  > }
  > ```

## 存储不同类型的元素

### 方案一: 使用枚举类型

eg:
```rust:no-line-numbers
#[derive(Debug)]
enum IpAddr {
    V4(String),
    V6(String)
}
fn main() {
    let v = vec![
        IpAddr::V4("127.0.0.1".to_string()),
        IpAddr::V6("::1".to_string())
    ];
    for ip in v {
        show_addr(ip)
    }
}
fn show_addr(ip: IpAddr) {
    println!("{:?}",ip);
}
```

### 方案二: 使用dyn Trait

eg:
```rust:no-line-numbers
trait IpAddr {
    fn display(&self);
}
struct V4(String);
impl IpAddr for V4 {
    fn display(&self) {
        println!("ipv4: {:?}",self.0)
    }
}
struct V6(String);
impl IpAddr for V6 {
    fn display(&self) {
        println!("ipv6: {:?}",self.0)
    }
}
fn main() {
    let v: Vec<Box<dyn IpAddr>> = vec![
        Box::new(V4("127.0.0.1".to_string())),
        Box::new(V6("::1".to_string())),
    ];
    for ip in v {
        ip.display();
    }
}
```

> struct Box 定义:
> ```rust:no-line-numbers
> pub struct Box<
>   T: ?Sized,
>   A: Allocator = Global,
>>(Unique<T>, A);
> ```
> 其中 struct Unique\<T\> 的定义:
> ```rust:no-line-numbers
> pub struct Unique<T: ?Sized> {
>    pointer: NonNull<T>,
>    _marker: PhantomData<T>, // Zero-Sized Type, 用于为编译提供信息
> }
> ```
> Unique\<T\>内部是一个非空**裸指针(*const)**, 其拥有其指向内存的所有权. (裸指针包含一个地址字段, 对于动态大小类型还包括一个记录内存大小的字段, 对于特征对象还包含虚表的地址的字段)
>
> Box\::\<T\>\::new(T)获取一个变量的所有权, 将其栈上的数据逐字节拷贝到堆上, 同时拥有该片堆内存的所有权(非Copy类型变量原栈上的内存释放掉); 变量的引用字段引用的数据不会拷贝, 如果其中引用指向的是栈上的数据，必须确保引用的生命周期足够长.

## Vector 常用方法

```rust:no-line-numbers
let mut v = Vec::with_capacity(10); // 以指定的capacity初始化
v.extend([1, 2, 3]); // 附加数据到 v
v.reserve(100);      // 调整 v 的容量，至少要有 100 的容量
v.shrink_to_fit();   // 释放剩余的容量，一般情况下，不会主动去释放容量
println!("Vector 长度是: {}, 容量是: {}", v.len(), v.capacity());

let mut v =  vec![1, 2];
assert!(!v.is_empty());         // 检查 v 是否为空
v.insert(2, 3);                 // 在指定索引插入数据，索引值不能大于 v 的长度， v: [1, 2, 3] 
assert_eq!(v.remove(1), 2);     // 移除指定位置的元素并返回, v: [1, 3]
assert_eq!(v.pop(), Some(3));   // 删除并返回 v 尾部的元素，v: [1]
assert_eq!(v.pop(), Some(1));   // v: []
assert_eq!(v.pop(), None);      // 记得 pop 方法返回的是 Option 枚举值
v.clear();                      // 清空 v, v: []

let mut v1 = [11, 22].to_vec(); // append 操作会导致 v1 清空数据，增加可变声明
v.append(&mut v1);              // 将 v1 中的所有元素附加到 v 中, v1: []
v.truncate(1);                  // 截断到指定长度，多余的元素被删除, v: [11]
v.retain(|x| *x > 10);          // 保留满足条件的元素，即删除不满足条件的元素

let mut v = vec![11, 22, 33, 44, 55];
// 删除指定范围的元素，同时获取被删除元素的迭代器, v: [11, 55], m: [22, 33, 44]
let mut m: Vec<_> = v.drain(1..=3).collect();    
let v2 = m.split_off(1);        // 指定索引处切分成两个 vec, m: [22], v2: [33, 44]

let v = vec![11, 22, 33, 44, 55];
let slice = &v[1..=3];          // 可以像数组切片的方式获取 vec 的部分元素
assert_eq!(slice, &[22, 33, 44]);
```

### 排序

Vec\<T\>实现了两种排序算法, 分别为稳定的排序sort和sort_by, 以及非稳定排序sort_unstable和sort_unstable_by.
总体而言，非稳定排序的算法的速度会优于稳定排序算法，同时，稳定排序还会额外分配原数组一半的空间. \
eg:
```rust:no-line-numbers
let mut v = vec![1, 5, 10, 2, 15];    
v.sort_unstable();    
assert_eq!(v, vec![1, 2, 5, 10, 15]);
```

T为浮点数时的排序: \
在浮点数当中, 存在一个NAN的值, 这个值无法与其他的浮点数进行对比, 因此浮点数类型并没有实现全数值可比较的 Trait Ord (返回值为 `Ordering` ), 而是实现了部分可比较的 Trait PartialOrd (返回值为 `Option<Ordering>` ).
但如果确定不包含NAN值, 就可以使用partial_cmp来作为大小判断的依据:

```rust:no-line-numbers
let mut vec = vec![1.0, 5.6, 10.3, 2.0, 15f32];    
vec.sort_unstable_by(|a, b| a.partial_cmp(b).unwrap()); // NAN 会触发 panic
assert_eq!(vec, vec![1.0, 2.0, 5.6, 10.3, 15f32]);
```

T为结构体时的排序同理; 但另外也可以通过derive自动为结构体实现cmp()所需特征: \
`#[derive(Debug, Ord, PartialEq, PartialOrd)]`
