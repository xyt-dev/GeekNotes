---
title: "Rust Tidbits: Box Is Special(关于Box的故事)"
order: 2
---

> From: Manish Goregaokar's blog

Rust is not a simple language. As with any such language, it has many little <EngWord content="tidbits" word="tidbit" highlight="n 0"/> of complexity that most folks aren’t aware of. Many of these tidbits are ones which may not practically matter much for everyday Rust programming, but are interesting to know. Others may be more useful. I’ve found that a lot of these aren’t documented anywhere (not that they always should be), and sometimes depend on knowledge of compiler internals or history. As a fan of programming trivia myself, I’ve decided to try writing about these things whenever I come across them. “Tribal Knowledge” shouldn’t be a thing in a programming community; and trivia is fun!

> Rust并非一门简单的语言。与许多此类语言一样，它包含许多大多数人未曾察觉的复杂细节。其中许多细节可能对日常Rust编程的实际影响不大，但了解它们却十分有趣。另一些则可能更具实用性。我发现这些细节大多未被记录在案（尽管并非所有都需如此），有时甚至需要了解编译器内部机制或历史背景才能理解。作为一名编程冷知识的爱好者，我决定在遇到这些内容时尝试将其记录下来。在编程社区中，“部落知识”本不应存在；况且冷知识的分享本身就充满乐趣！

---

So. `Box<T>`. Your favorite heap allocation type that nobody uses.

I was discussing some stuff on the rfcs repo when [@burdges realized that `Box<T>` has a funky `Deref` impl](https://github.com/rust-lang/rfcs/issues/1850#issuecomment-271766300).

Let’s look at it:

```rust:no-line-numbers
#[stable(feature = "rust1", since = "1.0.0")]
impl<T: ?Sized> Deref for Box<T> {
  type Target = T;

  fn deref(&self) -> &T {
    &**self
  }
}

#[stable(feature = "rust1", since = "1.0.0")]
impl<T: ?Sized> DerefMut for Box<T> {
  fn deref_mut(&mut self) -> &mut T {
    &mut **self
  }
}
```

Wait, what? <EngWord word="squint" content="Squints" highlight="n 1"/>:

```rust:no-line-numbers
fn deref(&self) -> &T {
  &**self
}
```

*The call is coming from inside the house!*

In case you didn’t realize it, this deref impl returns `&**self` – since `self` is an `&Box<T>`, dereferencing it once will provide a `Box<T>`, and the second dereference will dereference the box to provide a T. We then wrap it in a reference and return it.

But wait, we are defining how a `Box<T>` is to be dereferenced (that’s what Deref::deref is for!), such a definition cannot itself dereference a `Box<T>`! That’s infinite recursion.

And indeed. For any other type such a `deref` impl would recurse infinitely. If you run this code:

```rust:no-line-numbers
use std::ops::Deref;

struct LOLBox<T>(T);

impl<T> Deref for LOLBox<T> {
    type Target = T;
    fn deref(&self) -> &T {
        &**self
    }
}
```

the compiler will warn you:

```:no-line-numbers
warning: function cannot return without recurring, #[warn(unconditional_recursion)] on by default
 --> <anon>:7:5
  |
7 |     fn deref(&self) -> &T {
  |     ^
  |
note: recursive call site
 --> <anon>:8:10
  |
8 |         &**self
  |          ^^^^^^
  = help: a `loop` may express intention better if this is on purpose
```

Actually trying to dereference the type will lead to a stack overflow.

Clearly something is <EngWord word="fishy" content="fishy" highlight="adj 1" /> here. This deref impl is similar to the deref impl for `&T`, or the `Add` impl for number types, or any other of the implementations of operators on primitive types. 
For example we literally define [`Add` on two integers to be their addition](https://github.com/rust-lang/rust/blob/52c03d1d619fd25c961bc9de59bcc942b660d5db/src/libcore/ops.rs#L263). The reason these impls need to exist is so that people can still call `Add::add` if they need to in generic code and be able to pass integers to things with an `Add` bound. But the compiler knows how to use builtin operators on numbers and dereference borrowed references without these impls. But those are primitive types which are defined in the compiler, while `Box<T>` is just a regular smart pointer struct, right?

Turns out, `Box<T>` is special. It, too, is somewhat of a primitive type.

This is partly due to historical accident.

To understand this, we must look back to *Ye Olde*(古老的) days of pre-1.0 Rust (*ca*(circa 大约) 2014). Back in these days, we had none of this  <EngWord word="newfangle" content="newfangled" highlight="adj 1"/> "stability" business. The compiler broke your code every two weeks. Of course, you wouldn’t know that because the compiler would usually crash before it could tell you that your code was broken! <EngWord word="sigil" content="Sigils" highlight="n 0"/> <EngWord word="roam" content="roamed" highlight="v 0"/> the lands freely, and cargo was but a newborn child which was destined to eventually end the tyranny(暴君统治的国度) of Makefiles. People were largely happy knowing that their closures were safely boxed and their threads sufficiently green.

Back in these days, we didn’t have `Box<T>`, `Vec<T>`, or `String`. We had `~T`, `~[T]`, and `~str`. The second two are not equivalent to `Box<[T]>` and `Box<str>`, even though they may look like it, they are both growable containers like `Vec<T>` and `String`. `~` conceptually meant “owned”, though IMO(In My Opinion) that caused more confusion than it was worth.

You created a box using the `~`(tilde) operator, e.g. `let x = ~1;`. It could be dereferenced with the *(asterisk) operator, and autoderef worked much like it does today.

As a "primitive" type; like all primitive types, `~T` was special. The compiler knew things about it. The compiler knew how to dereference it without an explicit `Deref` impl. In fact, the `Deref` traits came into existence much after `~T` did. `~T` never got an explicit `Deref` impl, though it probably should have.

Eventually, there was a move to remove sigils from the language. The box constructor `~foo` was <EngWord word="supersede" content="superseded" highlight="v 0" /> by [placement box syntax](https://github.com/rust-lang/rust/pull/11055/), which still exists in Rust nightly. Then, the [`~T` type became `Box<T>`](https://github.com/rust-lang/rust/pull/13904). (`~[T]` and `~str` would also be removed, though ~str took a very confusing detour with StrBuf first).

**However, `Box<T>` was still special. It no longer needed special syntax to be referred to or constructed, but it was still internally a special type.** It **didn’t** even have a Deref impl yet, that came six months later, and it was implemented as `&**self`, exactly the same as it is today.

But why does it have to be special now? Rust had all the features it needed (allocations, ownership, overloadable deref) to implement `Box<T>` in pure rust in the stdlib as if it were a regular type.

Turns out that Rust didn’t. You see, because `Box<T>` and before it `~T` were special, their dereference semantics were implemented in a different part of the code. And, these semantics were not the same as the ones for DerefImm(Imm即Immutable) and DerefMut, which were created for use with other smart pointers. 
I don’t know if the possibility of being used for `~T` was considered when DerefImm/DerefMut were being implemented, or if it was a simple oversight, but `Box<T>` has three pieces of behavior that could not be replicated in pure Rust at the time:

- `box foo` in a pattern would destructure a box into its contents. It’s somewhat the opposite of `ref`.

- box foo() performed placement box, so the result of foo() could be directly written to a preallocated box, reducing extraneous copies.

- **You could move out of deref with `Box<T>`.**

The third one is the one that really gets to us here(第三点才是我们真正感兴趣的). **For a regular type, `*foo` will produce a temporary that must be immediately borrowed or copied.** You cannot do `let x = *y` for a non-Copy type. This dereference operation will call `DerefMut::deref_mut` or `Deref::deref` based on how it gets borrowed. With `Box<T>`, you can do this:

```rust:no-line-numbers
let x = Box::new(vec![1,2,3,4]);
let y = *x; // moves the vec out into `y`, then deallocates the box
            // but does not call a destructor on the vec
```

For any other type, such an operation will produce a "cannot move out of a borrow" error.

This operation is <EngWord word="colloquially" content="colloquially" highlight="adv 0" /> called `DerefMove`, and there has been an RFC(Request for Comments, 征求意见稿/提案) in the past for making it into a trait. I suspect that the `DerefMove` semantics could even have been removed from `Box<T>` before 1.0 (I don’t find it necessary), but people had better things to do, like fixing the million other rough edges of the language that can’t be touched after backwards compatibility is a thing.

> 作者的观点是：在 Rust 1.0 之前，`Box<T>` 的某些解引用行为隐含了类似 `DerefMove` 的语义（即通过解引用转移所有权），但这种设计并非必要，且未被标准化为 trait。由于 Rust 团队优先处理了其他更紧迫的兼容性问题，这一行为被保留至今.

Most of this isn’t really useful to know unless you actually come across a case where you can make use of DerefMove semantics, or if you work on the compiler. But it certainly is interesting!