---
title: Rust进阶
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

闭包能够捕获其作用域中的变量, **且只有实际使用到的变量才会被捕获**. 具体捕获方式(不可变引用、可变引用或所有权)**取决于闭包内部的实现(对捕获变量的使用方式), 而非闭包变量本身的类型**, 除非使用move关键字才会强制使用 所有权捕获方式 捕获所有使用到的变量.

eg:
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
  则会由于closure为不可变变量, 无法调用方法 `call_mut(&mut self, args: Args)`

- 所有权捕获
  ```rust:no-line-numbers
  fn main() {
    let s = String::from("hello");
    // 闭包内部移动了 s, closure 的类型推断为 impl FnOnce()
    let closure = || {
      let owned_s = s; // 将 s 移动到闭包内部
    };
    // println!("{}", s); // Err: borrow of moved value: `s`. 因为 s 的所有权已经被移动到闭包中.
  }
  ```
  **注意, 使用move不会因此使闭包的类型被推断为**`impl FnOnce`, **只有当闭包的调用函数中实际消耗(移动)了变量的所有权时才会推断为**`impl FnOnce`.
  ```rust:no-line-numbers
  let s = String::from("hello");
  let closure = move || { // ! closure 的类型推断为 impl Fn()
    println!("s: {}", &s);
    println!("s: {}", s); // 这样也可以, 因为 pringln! 会自动使用 s 的引用
  };
  closure();
  closure(); // ok
  // println!("{}", s); // Err: borrow of moved value: `s`. 因为 s 的所有权已经被移动到闭包中.
  ```