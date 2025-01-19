---
title: HashMap<K, V>
order: 3
---

### 创建HashMap\<K, V\>

1. 显示指明类型
    ```rust:no-line-numbers
    let mut gems: HashMap<&str, u32> = HashMap::new();
    ```
    或
    ```rust:no-line-numbers
    let mut gems = HashMap::<&str, u32>::new();
    ```
2. 隐式推断类型
    ```rust:no-line-numbers
    let mut gems = HashMap::new();
    println!("{:?}", gems);
    gems.insert("红宝石", 1);
    gems.insert("蓝宝石", 2);
    ```

由于HashMap\<T\>没有包含在prelude中, 需手动引入当前作用域: `use std::collections::HashMap;`

同Vec一样, 如果预先知道要存储的KV对个数, 可以使用 `HashMap::with_capacity(capacity)` 创建指定大小的 HashMap\<T\>, 以避免频繁的内存分配和数据拷贝迁移, 提升性能.

### Vec\<T> 转换为 HashMap\<K, V>

Eg:
```rust:no-line-numbers
use std::collections::HashMap;
let teams_list = vec![ // Vec<(String, u32)>
  ("中国队".to_string(), 100 as u32),
  ("美国队".to_string(), 200),
  ("英国队".to_string(), 50),
];
```
#### 方案一: 逐个遍历Vec\<T>元素, 使用.insert()插入HashMap\<K, V>

```rust:no-line-numbers
let mut teams_map = HashMap::new();
for team in &teams_list {
    teams_map.insert(&team.0, team.1);
}
```

#### 方案二: 使用特征方法Iterator::collect()自动收集

```rust:no-line-numbers
let teams_map: HashMap<_, _> = teams_list.into_iter().collect(); // _ 为类型占位符
```
以上代码使用`into_iter`方法将列表转为迭代器, 接着通过`collect`进行收集.
需要注意的是, 虽然`collect`是`Iterator`中定义的方法, 但`Iterator`是特征, `collect`在此处调用的内部实现细节实际由`HashMap<K, V>`提供.

**collect 方法源码分析:**

首先看`into_iter`在此处的实现:
```rust:no-line-numbers
impl<T, A: Allocator> IntoIterator for Vec<T, A> {
  type Item = T;
  type IntoIter = IntoIter<T, A>;
  fn into_iter(self) -> Self::IntoIter {
    // ...
  }
}
```
其中`type Item`的实际类型推断为`(String, u32)`, \
所以`into_iter()`的实际返回值为`IntoIter<(String, u32), A>`. (A=Global, 以下忽略)

`IntoIter`是一个实现了`Iterator`特征的迭代器:
```rust:no-line-numbers
impl<T, A: Allocator> Iterator for IntoIter<T, A> {
    type Item = T;
    // ...
}
```

在`IntoIterator`特征的定义文件中, 自动为所有实现了`Iterator`特征的类型实现了`IntoIterator`特征:
```rust:no-line-numbers
// 特征的条件实现
impl<I: Iterator> IntoIterator for I {
    type Item = I::Item;
    type IntoIter = I;
    fn into_iter(self) -> I {
        self
    }
}
```

`collect`是一个特征方法, 其定义如下: 
```rust:no-line-numbers
pub trait Iterator {
  type Item;
  fn collect<B: FromIterator<Self::Item>>(self) -> B
  where
      Self: Sized,
  {
      FromIterator::from_iter(self)
  }
}
```
其中`FromIterator::from_iter`的定义如下:
```rust:no-line-numbers
pub trait FromIterator<A>: Sized {
  // 根据实参可知此处iter实际类型为IntoIter<(String, u32)>
  // FromIterator::from_iter(self)相当于<具体实例 as FromIterator>::from_iter(self), 实际调用哪个具体实现还需要Self的类型信息, 而Self类型的推断依据是返回值相关上下文, 即泛型B的实际类型. (注意self只是iter的实参, 不依据此进行推断)
  fn from_iter<T: IntoIterator<Item = A>>(iter: T) -> Self; 
}
```

由于`collect`实际支持生成多种类型的目标集合, 因此我们需要通过类型标注`HashMap<_, _>`来帮助编译器推断其中泛型参数B的实际类型.
上述定义中泛型B要求实现特征约束`FromIterator<(String, u32)>`, 而`HashMap<K, V>`确实实现了满足该条件的特征:
```rust:no-line-numbers
impl<K, V, S> FromIterator<(K, V)> for HashMap<K, V, S>
where
    K: Eq + Hash,
    S: BuildHasher + Default,
{
    fn from_iter<T: IntoIterator<Item = (K, V)>>(iter: T) -> HashMap<K, V, S> {
        let mut map = HashMap::with_hasher(Default::default());
        map.extend(iter);
        map
    }
}
```