---
title: vec<T>
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

### 可变与不可变

```rust::no-line-numbers
	let v = Vec::new(); // 绑定所有权时可变与不可变是数据本身的属性, 数据所有者规定数据不可变
	let v = &mut v; // Err: cannot borrow `v` as mutable, as it is not declared as mutable
	v.push(1); // Err: cannot borrow `v` as mutable, as it is not declared as mutable
```

```rust::no-line-numbers
	let mut v = Vec::new(); // 数据所有者规定数据不可变
	let v = &mut v; // 绑定引用时可变与不可变是引用变量本身的属性, 这里引用本身的绑定不可变, 对其引用的数据能进行可变操作.
	v.push(1); // OK
```

### 通过Wrapper给外部类型实现外部Trait

以Vec\<String\>为例:
```rust:no-line-numbers
use std::fmt;
use std::ops::Deref;

struct Wrapper(Vec<String>);
impl fmt::Display for Wrapper {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "[{}]", self.join(", "))
  }
}
impl Deref for Wrapper {
  // Rust可以为实现了Deref的类型自动解引用, 简化使用
  type Target = Vec<String>;
  fn deref(&self) -> &Vec<String> {
    &self.0
  }
}

fn main() {
  let w = Wrapper(vec![String::from("hello"), String::from("world")]);
  println!("w = {}", w);
}
```

