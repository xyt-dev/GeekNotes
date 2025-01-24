---
title: HashMap<K, V>
order: 3
---

## 创建HashMap\<K, V\>

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

由于HashMap\<K, V\>没有包含在prelude中, 需手动引入当前作用域:\
`use std::collections::HashMap;`

同 Vec\<T> 一样, 如果预先知道要存储的 KV 对个数, 可以使用 `HashMap::with_capacity(capacity)` 创建指定大小的 HashMap\<K, V\>, 以避免频繁的内存分配和数据拷贝迁移, 提升性能.

## Vec\<T> 转换为 HashMap\<K, V>

Eg:
```rust:no-line-numbers
use std::collections::HashMap;
let teams_list = vec![ // Vec<(String, u32)>
  ("中国队".to_string(), 100 as u32),
  ("美国队".to_string(), 200),
  ("英国队".to_string(), 50),
];
```
### 方案一: 逐个遍历Vec\<T>元素, 使用.insert()插入HashMap\<K, V>

```rust:no-line-numbers
let mut teams_map = HashMap::new();
for team in &teams_list {
    teams_map.insert(&team.0, team.1);
}
```

### 方案二: 使用特征方法Iterator::collect()自动收集

```rust:no-line-numbers
let teams_map: HashMap<_, _> = teams_list.into_iter().collect(); // _ 为类型占位符
```
以上代码使用 `into_iter` 方法将列表转为迭代器, 接着通过 `collect` 进行收集.\
需要注意的是, 虽然 `collect` 是 `Iterator` 中定义的方法, 但 `Iterator` 是特征, `collect`在此处调用的内部实现细节实际由 `HashMap<K, V>` 提供.

### **collect 方法的调用分析:**

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

然后调用`collect`, `collect`是一个特征方法, 其定义如下: 
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
  fn from_iter<T: IntoIterator<Item = A>>(iter: T) -> Self; 
}
```
**FromIterator\::from_iter(self)实质为\<Self as FromIterator>::from_iter(self), 
实际调用哪个具体实现还需要Self的类型信息, 而此处Self类型的推断依据只有返回值类型的上下文, 即泛型B的实际类型. 
(注意self是iter的实参, 而iter的类型注解是泛型T而非Self, 实际调用哪个实现与其无关).**

由于很多类型都实现了Iterator特征及collect方法, 所以调用代码中显式使用了`HashMap<_, _>`类型注解来明确调用的具体实现类型, 事实上`HashMap<K, V>`也的确实现了该特征:
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
而其中泛型的具体类型可由iter的实参类型推导. <br />
根据前面分析已知, 此处传入iter的实参为IntoIter<(String, u32)>. 

`IntoIter`是一个实现了`Iterator`特征的迭代器:
```rust:no-line-numbers
impl<T, A: Allocator> Iterator for IntoIter<T, A> {
    type Item = T;
    // ...
}
```

在`IntoIterator`特征的定义文件中, 所有实现了`Iterator`特征的类型自动实现了`IntoIterator`特征:
```rust:no-line-numbers
impl<I: Iterator> IntoIterator for I { // 特征的条件实现
    type Item = I::Item;
    type IntoIter = I;
    fn into_iter(self) -> I {
        self
    }
}
```

所以`T: IntoIterator\<Item = (K, V)>`中的(K, V)推导为(String, u32).

**需要特别注意的是:** \
如果特征方法没有默认实现, 一般不能直接通过`Trait::method()`调用.
(Err: cannot call associated function on trait without specifying the corresponding `impl` type)\
上述分析中的代码之所以能使用`FromIterator::from_iter(self)`, 是因为其定义
```rust:no-line-numbers
pub trait FromIterator<A>: Sized {
  fn from_iter<T: IntoIterator<Item = A>>(iter: T) -> Self; 
}
```
中返回值是Self. 于是只要明确了实际的返回值类型(HashMap\<_, _>), 就相当于指明了其调用的具体实现类型.\
举个简单例子:

```rust:no-line-numbers
trait Slime {
  fn produce() -> Self;
}
impl Slime for BlueSlime {
  fn produce() -> Self {	
    BlueSlime
  }
}
impl Slime for GreenSlime {
  fn produce() -> Self {	
    GreenSlime
  }
}

let slime = Slime::produce(); // Err: cannot call associated function on trait without specifying the corresponding `impl` type
let slime: BlueSlime = Slime::produce(); // OK
```

## 查询、遍历和更新 HashMap\<K, V>

### 查询元素

HashMap\<K, V>通过`get`方法获取元素(Option<**&V**>)\
`get`方法定义如下:
```rust:no-line-numbers
pub fn get<Q: ?Sized>(&self, k: &Q) -> Option<&V>
where
  K: Borrow<Q>,
  Q: Hash + Eq,
{
  self.base.get(k)
}
```
**`K: Borrow<Q>` 表示K必须能够被借用为Q类型**.\
在之前的例子中, 已知K为String, 而String实现了Borrow\<str>和Borrow\<String>, 即String可以被借用为&str和&String, 所以推出Q可以是str或String, k的实参类型可以是&str或&String.\
eg.
```rust:no-line-numbers
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10 as u32);
scores.insert(String::from("Yellow"), 50);

let team_name = String::from("Blue");
let score = scores.get(&team_name); // 自动推断出score的类型为Option<&u32>
```
此例中, 如果想获取数值类型的score, 可使用以下方法:
```rust:no-line-numbers
let score: u32 = scores.get(&team_name).copied().unwrap_or(0);
```
其中的方法: \
.copied() 将Option\<&u32>转换为Option\<u32>.\
.unwrap_or(0) 解包Option\<u32>, 如果不存在则返回默认值0, 安全地获取值.

### 遍历元素

eg:
```rust:no-line-numbers
use std::collections::HashMap;
let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);
for (key, value) in &scores {
    println!("{}: {}", key, value);
}
```

[与Vec\<T>的遍历原理相同](./vec.md#vec遍历) \
示例中执行 for in 语句时会隐式调用 `&scores.into_iter()`, 其返回一个遍历元素为 `(&K, &V)` 的迭代器, 然后使用该迭代器进行遍历.

**scores.into_iter()会消耗原集合scores(move集合的所有权); &scores.into_iter()和&mut scores.into_iter()不会消耗原集合(实际调用的是iter()), 但二者返回的迭代器类型不同(见[Vec\<T>的遍历](./vec.md#vec遍历)).** \
**以上三种情况into_iter()的具体实现如下:**

```rust:no-line-numbers
pub trait IntoIterator {
    type Item;
    type IntoIter: Iterator<Item = Self::Item>;
    fn into_iter(self) -> Self::IntoIter;
}

impl<K, V> IntoIterator for HashMap<K, V> {
    type Item = (K, V);
    type IntoIter = IntoIter<K, V>;
    fn into_iter(self) -> Self::IntoIter {
        // 消耗 self，返回一个产生 (K, V) 的迭代器
        self.base.into_iter()
    }
}

impl<'a, K, V> IntoIterator for &'a HashMap<K, V> {
    type Item = (&'a K, &'a V);
    type IntoIter = Iter<'a, K, V>;
    fn into_iter(self) -> Self::IntoIter {
        // 返回一个产生 (&K, &V) 的迭代器
        self.iter()
    }
}

impl<'a, K, V> IntoIterator for &'a mut HashMap<K, V> {
    type Item = (&'a K, &'a mut V);
    type IntoIter = IterMut<'a, K, V>;
    fn into_iter(self) -> Self::IntoIter {
        // 返回一个产生 (&K, &mut V) 的迭代器
        self.iter_mut()
    }
}
```
理解三种实现之间的区别.

### 更新元素

eg:
```rust:no-line-numbers
let mut scores = HashMap::new();
scores.insert("Blue", 10);
// 覆盖已有的值
let old = scores.insert("Blue", 20);
assert_eq!(old, Some(10));
// 查询新插入的值
let new = scores.get("Blue");
assert_eq!(new, Some(&20));
// 查询Yellow对应的值，若不存在则插入新值
let v = scores.entry("Yellow").or_insert(5);
assert_eq!(*v, 5); // 不存在，插入5
// 查询Yellow对应的值，若不存在则插入新值
let v = scores.entry("Yellow").or_insert(50);
assert_eq!(*v, 5); // 已经存在，因此50没有插入

let text = "hello world wonderful world";
let mut map = HashMap::new();
// 根据空格来切分字符串, 统计单词出现次数
for word in text.split_whitespace() {
    let count = map.entry(word).or_insert(0);
    *count += 1;
}
```

以上方法的定义:

```rust:no-line-numbers
impl<K, V> HashMap<K, V, RandomState> { 
  pub fn new() -> HashMap<K, V, RandomState> {
    Default::default() // 相当于 <Self as Default>::default()
  }

  pub fn insert(&mut self, k: K, v: V) -> Option<V> {
    self.base.insert(k, v)
  }

  pub fn get<Q: ?Sized>(&self, k: &Q) -> Option<&V>
  where
    K: Borrow<Q>, // 分析见上文 "#查询元素"
    Q: Hash + Eq,
  {
    self.base.get(k)
  }

  pub fn entry(&mut self, key: K) -> Entry<'_, K, V> {
    map_entry(self.base.rustc_entry(key))
    // key存在返回 Entry::Occupied(OccupiedEntry<'a, K, V>)
    // key不存在返回 Entry::Vacant(VacantEntry<'a, K, V>)
  }
}

pub enum Entry<'a, K: 'a, V: 'a> {
  Occupied(OccupiedEntry<'a, K, V>),
  Vacant(VacantEntry<'a, K, V>),
}

impl<'a, K, V> Entry<'a, K, V> {
  pub fn or_insert(self, default: V) -> &'a mut V {
    match self {
      Occupied(entry) => entry.into_mut(),
      Vacant(entry) => entry.insert(default),
    }
  }
}
```
`or_insert` 方法返回了 `&mut V` 引用，因此可以通过该可变引用直接修改 map 中对应的值.

HashMap中Key的映射基于哈希, RandomState是Rust默认哈希算法的状态管理器, 为每个HashMap实例生成一个随机种子.
