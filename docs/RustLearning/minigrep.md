---
title: minigrep
order: 4
---

# minigrep

## minigrep v1.0

### main.rs

```rust:no-line-numbers
use std::{env, process};

use minigrep::Config;

fn main() {
  let args: Vec<String> = env::args().collect();
  let config = Config::build(&args).unwrap_or_else(|err| {
    // 将错误信息输出到 stderr 使用 eprintln!()
    eprintln!("Problem parsing arguments: {err}.");
    process::exit(1);
  });

  println!("================================================");
  println!("Query: \"{}\"", config.query);
  println!("Searching in file: \"{}\"", config.file_path);
  println!("Case sensitivity: {}", config.ignore_case);
  println!("================================================\n");

  if let Err(e) = minigrep::run(config) {
    eprintln!("Application err: {e}");
    process::exit(1);
  }
}
```

### lib.rs

```rust:no-line-numbers
use std::{env, error::Error, fs};

pub fn run(config: Config) -> Result<(), Box<dyn Error>> {
  /* deepseek: 为了让 OtherError 能够通过 ? 自动转换为 Box<dyn Error>, 
  OtherError 需要实现 std::error::Error trait 从而能够被 dyn Error 变量绑定, 
  而且 Rust 标准库已经为所有实现了 Error 的类型提供了 From 实现，以将其转换为 Box<dyn Error> 
  即 from() 可将 OtherError 直接转换为 Box<dyn Error> */
  let content = fs::read_to_string(config.file_path)?;

  let results = if config.ignore_case {
    search_case_insensitive(&config.query, &content)
  } else {
    search(&config.query, &content)
  };
  for line in results {
    println!("{line}");
  }
  Ok(())
}

pub struct Config {
  pub query: String,
  pub file_path: String,
  pub ignore_case: bool,
}

impl Config {
  pub fn build(args: &[String]) -> Result<Config, &'static str> {
    if args.len() < 3 { 
      return Err("not enough arguments.");
    }
    let query = args[1].clone();
    let file_path = args[2].clone();
    /* env::var 返回 Result<String, VarError>
    is_ok 方法用于检查是否有值，有就返回 true，没有则返回 false */
    let ignore_case = env::var("IGNORE_CASE").is_ok();
    Ok( Config {query, file_path, ignore_case} )
  }
}

pub fn search<'a>(query: &str, content: &'a str) -> Vec<&'a str> {
  // 传入的 query 和 contents 是 &String, 但能被自动 deref 为 &str.
  // 原理是 如果类型 T 实现了 Deref<Target = U>，那么 &T 可以自动转换为 &U
  /* 其标准库实现如下:
    impl std::ops::Deref for String {
        type Target = str; // 注意：Target 是 str，不是 &str
        fn deref(&self) -> &str {
            &self[..] // 返回一个 &str
        }
    } 
  */
  let mut results = Vec::new();
  for line in content.lines() {
    /* contents.lines() 返回一个迭代器, 该迭代器生成 contents 中每一行的切片. 
    这些切片是对原始字符串 contents 的引用, 而不是新的字符串. */
    if line.contains(query) {
      results.push(line);
    }
  }
  results
}

pub fn search_case_insensitive<'a>(query: &str, content: &'a str) -> Vec<&'a str> {
  let query = query.to_lowercase();
  let mut result = Vec::new();
  for line in content.lines() {
    if line.to_lowercase().contains(&query) {
      result.push(line);
    }
  }
  result
}

// TEST
#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn case_sensitive() {
    let query = "duct";
    let content = "\
Rust:
safe, fast, productive.
Pick three.";

    assert_eq!(vec!["safe, fast, productive."], search(query, content));
  }

  #[test]
  fn case_insensitive() {
    let query = "rUsT";
    let content = "\
Rust:
safe, fast, productive.
Pick three.
Trust me.";

    assert_eq!(
      vec!["Rust:", "Trust me."],
      search_case_insensitive(query, content)
    );
  }
}
```


## minigrep v2.0

### main.rs

```rust:no-line-numbers
use std::{env, process};

use minigrep::Config;

fn main() {
  let config = Config::build(env::args()).unwrap_or_else(|err| {
    eprintln!("Problem parsing arguments: {err}.");
    process::exit(1);
  });

  println!("================================================");
  println!("Query: \"{}\"", config.query);
  println!("Searching in file: \"{}\"", config.file_path);
  println!("Case sensitivity: {}", config.ignore_case);
  println!("================================================\n");

  if let Err(e) = minigrep::run(config) {
    eprintln!("Application err: {e}");
    process::exit(1);
  }
}
```

### lib.rs

```rust:no-line-numbers
use std::{env, error::Error, fs};

pub fn run(config: Config) -> Result<(), Box<dyn Error>> {
  let content = fs::read_to_string(config.file_path)?;

  let results = if config.ignore_case {
    search_case_insensitive(&config.query, &content)
  } else {
    search(&config.query, &content)
  };
  for line in results {
    println!("{line}");
  }
  Ok(())
}

pub struct Config {
  pub query: String,
  pub file_path: String,
  pub ignore_case: bool,
}

impl Config {
  pub fn build(mut args: impl Iterator<Item = String>) -> Result<Config, &'static str> {
    args.next(); // 跳过第一个参数, 即程序名称
    let query = match args.next() {
      Some(arg) => arg,
      None => return Err("Didn't get a query string."),
    };
    let file_path = match args.next() {
      Some(arg) => arg,
      None => return Err("Didn't get a file path."),
    };
    let ignore_case = env::var("IGNORE_CASE").is_ok();
    Ok(Config {
      query,
      file_path,
      ignore_case,
    })
  }
}

pub fn search(query: &str, content: &str) -> Vec<String> {
  let red_color = "\x1b[31m";
  let reset_color = "\x1b[0m";

  content
    .lines()
    .filter(|line| line.contains(query))
    .map(|line| line.replace(query, &format!("{}{}{}", red_color, query, reset_color)))
    .collect()
}

pub fn search_case_insensitive(query: &str, content: &str) -> Vec<String> {
  let red_color = "\x1b[31m";
  let reset_color = "\x1b[0m";
  let query_lowercase = query.to_lowercase();

  content
    .lines()
    .filter(|line| line.to_lowercase().contains(&query_lowercase))
    .map(|line| {
      let mut highlighted_line = String::new();
      let mut last_end = 0;
      let line_lowercase = line.to_lowercase();

      // 查找所有匹配位置
      for (start, _) in line_lowercase.match_indices(&query_lowercase) {
        let end = start + query.len();

        // 非匹配前缀部分
        highlighted_line.push_str(&line[last_end..start]);
        // 高亮匹配部分
        highlighted_line.push_str(red_color);
        highlighted_line.push_str(&line[start..end]);
        highlighted_line.push_str(reset_color);
        
        last_end = end;
      }
      // 非匹配后缀部分
      highlighted_line.push_str(&line[last_end..]);
      highlighted_line
    })
    .collect()
}

// TEST
#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn case_sensitive() {
    let query = "duct";
    let content = "\
Rust:
safe, fast, productive.
Pick three.";

    assert_eq!(vec![String::from("safe, fast, pro\x1b[31mduct\x1b[0mive.")], search(query, content));
  }

  #[test]
  fn case_insensitive() {
    let query = "rUsT";
    let content = "\
Rustrrrrrrrrrrust:
safe, fast, productive.
Pick three.
Trust me.";

    assert_eq!(
      vec![String::from("\x1b[31mRust\x1b[0mrrrrrrrrr\x1b[31mrust\x1b[0m:"), String::from("T\x1b[31mrust\x1b[0m me.")],
      search_case_insensitive(query, content)
    );
  }
}
```

> **fs::read_to_string 基本工作原理**
>
> 1. 打开文件: 使用 File::open 打开指定路径的文件.
> 2. 读取内容: 将文件的内容读取为一个 String.
>    - 如果文件是有效的 UTF-8 编码, 则直接将其解析为 String。
>    - 如果文件不是有效的 UTF-8 编码, 则返回 std\::io\::Error。
> 3. 关闭文件: 自动关闭文件(Rust 的 RAII 机制确保了资源的释放)

> RAII 即 Resource Acquisition Is Initialization (资源获取即初始化).\
> RAII 的核心思想是:
>  - 资源的获取与初始化绑定: 在对象构造时获取资源(例如打开文件、分配内存).
>  - 资源的释放与析构绑定: 在对象析构时释放资源(例如关闭文件、释放内存).
