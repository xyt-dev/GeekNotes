---
title: vec<T>
order: 2
---

### 创建Vec\<T\>

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

### 通过Wrapper给外部类型实现外部Trait

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

> **当实例调用一个方法时, 编译器会按照以下顺序查找方法:**
> 1. 检查类型本身是否实现了该方法, 优先调用
> 2. 如果类型本身没有实现该方法, 则编译器尝试解引用(通过Deref或DerefMut), 此过程不断进行直到找到对应方法或无法继续解引用
> 3. 如果解引用无法找到方法, 编译器会尝试引用(通过&或&mut), 此过程此过程不断进行直到找到对应方法或无法继续引用