---
title: Rust函数式编程
order: 5
---

# Rust进阶

## Rust闭包

Rust闭包是实现了以下三个特征之一的变量类型: \
FnOnce / FnMut / Fn. \
其标准库定义如下:
```rust:no-line-numbers
pub trait FnOnce<Args> {
  type Output;
  fn call_once(self, args: Args) -> Self::Output; // 消耗闭包本身所有权, 只能调用一次.
}

pub trait FnMut<Args>: FnOnce<Args> {
  fn call_mut(&mut self, args: Args) -> Self::Output;
}

pub trait Fn<Args>: FnMut<Args> {
  fn call(&self, args: Args) -> Self::Output;
}
```

### Rust闭包的本质

闭包(closure)本质上是一个匿名的结构体(anonymous struct), 它捕获的环境变量(即闭包中使用的外部变量)会被存储为这个结构体的字段.

例如: 
```rust:no-line-numbers
let x = 10;
let closure = || println!("x is {}", x);
closure(); // 相当于调用了 closure.call()
```
其内部结构类似于:
```rust:no-line-numbers
struct GeneratedClosure { // 匿名结构体
  x: i32,
}
impl GeneratedClosure {
  fn call(&self) {
    println!("x is {}", self.x);
  }
}
```
当然, 实际的实现细节是由编译器处理的.

### 变量捕获

闭包能够捕获其作用域中的变量, **且只有实际使用到的变量才会被捕获**. 具体捕获方式(不可变引用、可变引用或所有权)**取决于闭包内部的实现(对捕获变量的使用方式), 而非闭包变量本身的类型**, 除非使用move关键字才会强制使用 所有权捕获方式 捕获所有**实际使用到的**变量.

**eg:**
- 不可变引用捕获:
  ```rust:no-line-numbers
  fn fn_once<F>(func: F)
  where
    F: FnOnce(usize) -> bool, // 闭包默认没有实现 Copy
  {
    println!("{}", func(3));
  }
  fn main() {
    let x = vec![1, 2, 3];
    fn_once(|z|{z == x.len()}); // 以不可变引用方式捕获变量x
    println!("{}", x[1]); // 可以正常使用变量x
  }
  ```

- 可变引用捕获:
  ```rust:no-line-numbers
  let mut x = 10;
  let mut closure = || { // closure 的类型推断为 impl FnMut()
    x += 1; // 修改 x，通过可变引用捕获
    println!("x is {}", x);
  };
  closure(); // 可以多次调用
  ```
  **注意**, 同一般的结构体变量一样, 若要修改字段(捕获的变量)的值, 绑定到的变量名需要使用mut修饰. \
  若写成下面这样:
  ```rust:no-line-numbers
  let mut x = 10;
  let closure = || { // closure 的类型仍推断为 impl FnMut()
    x += 1;
    println!("x is {}", x);
  };
  closure(); // Err: cannot mutate immutable variable `closure`
  ```
  则会由于closure为不可变变量, 而无法调用方法 `call_mut(&mut self, args: Args)`

- 所有权捕获
  ```rust:no-line-numbers
  let s = String::from("hello");
  // 闭包内部移动了 s, closure 的类型推断为 impl FnOnce()
  let closure = || {
    let owned_s = s; // 将 s 移动到闭包内部
  };
  // println!("{}", s); // Err: borrow of moved value: `s`. 因为 s 的所有权已经被移动到闭包中.
  ```
  **注意, 使用move不会因此使闭包的类型被推断为**`impl FnOnce`, **只有当闭包的调用函数中实际消耗(移动)了变量的所有权时才会推断为**`impl FnOnce`.
  ```rust:no-line-numbers
  let s = String::from("hello");
  let closure = move || { // 注意, closure 的类型推断为 impl Fn()
    println!("s: {}", &s);
    println!("s: {}", s); // 这样也可以, 因为 pringln! 会自动使用 s 的引用
  };
  closure();
  closure(); // ok
  // println!("{}", s); // Err: borrow of moved value: `s`. 因为 s 的所有权已经被移动到闭包中.
  ```

**总之, 闭包对变量的捕获方式与其实现的特性类型没有直接决定关系, 二者均由被捕获变量的实际使用方式决定.**

### 返回闭包

- 由于不知道闭包具体类型, 而`Fn(u32) -> u32`是一个特征, 编译器报错: 
  ```
  fn factory<T>() -> Fn(u32) -> u32 {
    |                ^^^^^^^^^^^^^^ doesn't have a size known at compile-time
  ```

- 不能返回不同的闭包类型:
  ```rust:no-line-numbers
  fn factory(x:u32) -> impl Fn(u32) -> u32 {
      let num = 5;
      if x > 1 {
          move |x| x + num
      } else {
          move |x| x - num
      }
  }
  ```
  ```
  error[E0308]: `if` and `else` have incompatible types
    |
    | /     if x > 1{
    | |         move |x| x + num
    | |         ---------------- expected because of this
    | |     } else {
    | |         move |x| x - num
    | |         ^^^^^^^^^^^^^^^^ expected closure, found a different closure
    | |     }
    | |_____- `if` and `else` have incompatible types
    |
  ```

- 最好的方法:
  ```rust:no-line-numbers
  fn factory(x:u32) -> Box<dyn Fn(u32) -> u32> {
      let num = 5;
      if x > 1 {
          Box::new(move |x| x + num)
      } else {
          Box::new(move |x| x - num)
      }
  }
  ```

### 借用周期问题

Rust中函数只要不返回引用(或包含引用的)类型, 就无需显式标注借用周期. \
普通(且安全)的函数返回的引用只可能来自其参数(以及全局static变量), 之所以需要标注借用周期, 是因为函数内逻辑可能十分复杂且不确定, 无法在编译期判断返回引用的借用周期来自哪个参数. \
但对于闭包来说, 其返回的引用既可能来自其参数又可能来自其所在环境, 而且闭包不支持显式标注借用周期, 解决该问题较麻烦, 所以一般不要让闭包返回引用类型.

## Rust迭代器

Rust迭代器即实现了`Iterator Trait`的类型:
```rust:no-line-numbers
pub trait Iterator {
  type Item; // 关联类型

  fn next(&mut self) -> Option<Self::Item>;
}
```

### For循环与迭代器

对于:
```rust:no-line-numbers
for element in arr {
  // ...
}
```
编译器会自动将其转换为类似如下代码:
```rust:no-line-numbers
let mut iter = arr.into_iter(); 
while let Some(element) = iter.next() {
  // ...
}
```
> while let 语句:
> ```rust:no-line-numbers
> while let PATTERN = EXPRESSION {
>   // 当 EXPRESSION 返回的值能够模式匹配 PATTERN 时, while let 循环继续执行, 同时将匹配到的值绑定到模式中的变量.
>   // 当无法匹配时, 循环终止, 相当于 break.
> }
> ```
> 
注意如果手动调用`next`迭代, 则`iter`必须要用`mut`修饰, 因为调用`next`方法要传入可变借用, 需改变迭代器中的状态数据(如当前遍历位置等); 但使用`for in`语句则可以不加`mut`修饰, 因为编译器会先自动进行转换, 如: 
```rust:no-line-numbers
let mut _iter = iter;
```

#### into_iter, iter, iter_mut

还要注意, `into_iter()`会消耗调用者的所有权, 其函数签名为:
```rust:no-line-numbers
fn into_iter(self) -> Self::IntoIter
```
如果不想要消耗所有权, 可以在`for in`语句中使用变量的引用, 如:
```rust:no-line-numbers
for element in &arr { // 或 &mut arr
  // ...
}
```
以数组的引用为例, 其`IntoIterator`特征实现如下:
```rust:no-line-numbers
impl<'a, T, const N: usize> IntoIterator for &'a [T; N] {
    type Item = &'a T;
    type IntoIter = Iter<'a, T>;

    fn into_iter(self) -> Iter<'a, T> {
        self.iter()
    }
}
impl<'a, T, const N: usize> IntoIterator for &'a mut [T; N] {
    type Item = &'a mut T;
    type IntoIter = IterMut<'a, T>;

    fn into_iter(self) -> IterMut<'a, T> {
        self.iter_mut()
    }
}
```
或者也可以手动调用`iter() / iter_mut()`, 如:
```rust:no-line-numbers
for element in arr.iter() { // 或 arr.iter_mut()
  // ...
}
```
而`iter()`和`iter_mut()`, 都是传入原变量的引用, 不会消耗其所有权.

> into_ 之类的都是拿走所有权, _mut 之类的都是可变借用, 剩下的就是不可变借用. -- Rust语言圣经

调用`next`方法的返回值: 
- 对于`iter()` 方法实现的迭代器，调用 `next` 方法返回的类型是 `Some(&T)`.
- 对于 `iter_mut()` 方法实现的迭代器，调用 `next` 方法返回的类型是 `Some(&mut T)`.
- 而对于 `into_iter()` 得到的迭代器, 若获取到的是原集合的所有权, 则调用 `next` 方法返回的类型是 `Some(T)`.

### 适配器

#### 消费者适配器

消费者是迭代器上的方法, 它会消费掉迭代器中的元素, 然后返回其对应类型的值, 这些消费者都有一个共同的特点; 在它们的定义中, 都依赖 `next` 方法来消费元素.

只要迭代器上的某个方法 `A` 在其内部调用了 `next` 方法，那么 `A` 就被称为消费者适配器: `next` 方法会消耗掉迭代器上的元素, 所以方法 `A` 的调用也会消耗掉迭代器上的元素.

**注意: 以上说法中的"消费"只是指调用这些方法后，迭代器内部的状态会推进，直到没有更多的元素可供迭代，而不是说一定会获取每个元素的所有权.**

#### 迭代器适配器

迭代器适配器, 顾名思义, 会返回一个新的迭代器，这是实现链式方法调用的关键, 例如: `v.iter().map().filter()...`. \
与消费者适配器不同，迭代器适配器是惰性的(即不会主动调用`next`方法), 这需要一个消费者适配器来收尾，最终将迭代器转换成一个具体变量.
eg:
```rust:no-line-numbers
let v1: Vec<u32> = vec![1, 2, 3];
let v2: Vec<_> = v1.iter().map(|x| x + 1).collect();
assert_eq!(v2, vec![2, 3, 4]); // ok
```
