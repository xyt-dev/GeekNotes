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

### 下标索引与.get()方法

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

### Vec遍历

Vec\<T\>实现了IntoIterator Trait, 实现了IntoIterator特征的类型在使用for in语句时会自动调用into_iter().
Vec\<T\> 在通过Iterator.next()迭代时每次访问都会触发数组边界检查, 更加安全高效. \
eg:
```rust:no-line-numbers
let mut v = vec![1, 2, 3];
for i in &mut v { // 修改元素需要 mut
  *i += 10
}
```
> **注意: Trait对于类型T, &T, &mut T的实现是完全独立的; 这里&Vec\<T\>和&mut Vec\<T\>调用into_iter()返回的iterator实例类型不同(返回的分别是std\::slice\::Iter\<T\>和std\::slice\::IterMut\<T\>类型).**


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


### Vec\<T\>的标准库定义

  ```rust:no-line-numbers
  pub struct Vec<T, A: Allocator = Global> { // <参数: 约束 = 默认值>
      buf: RawVec<T, A>,
      len: usize,
  }
  ```
  Vec\<T\>的底层是一个堆上分配的可变长度数组(capacity变化时需reallocate内存), 其中元素在内存中连续存放且对齐, 不支持编译期大小不确定的元素, 同时T也默认具有Sized(标记特征)约束, 所以使用Vec需保证T为编译期确定的静态大小类型.

  > Global 是Rust标准库提供的 全局可调用(Global的含义)的 堆内存分配器, 用于给需要动态内存分配的类型(如Vec、Box、String)提供默认堆内存分配器, 在堆上分配连续内存. \
  > 其底层内存分配函数定义如下: 
  > ```rust:no-line-numbers
  > extern 'Rust' {
  >   fn __rust_alloc(size: usize, align: usize) -> *mut u8;
  >   // ...
  > }
  > ```
