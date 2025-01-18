---
title: HashMap<T>
order: 3
---

### 创建HashMap\<T\>

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
