---
title: First-class Functions in Ruby
description: In a programming language, a first-class function is a function that can be treated the same way as a variable. Find out what are fist-class functions and how they are represented in Ruby.
date: "2018-07-16"
tags: [ruby]
draft: false
path: "/blog/first-class-functions"
---

In a programming language, a [first-class function](https://en.wikipedia.org/wiki/First-class_function "first-class function") is a function that can be treated the same way as a **variable**. Basically, a function is considered a first-class function if you can:

1. pass it as an argument to another function,
2. return it by another function,
3. and assign it to a variable.

However, you cannot always achieve this by using mere Ruby methods. For example, let’s create a method that makes some simple math:

```ruby
def multiply
  puts 2 * 2
end
```

If you assign this method to a variable, the actual result will be the return value, but not the method itself:

```ruby
> result = multiply
=> 4
```

This means that you cannot achieve any of above described behaviour of a first-class function. This is when a Ruby `Proc` objects come in handy. The definition from the official [Ruby documentation](https://ruby-doc.org/core-2.2.0/Proc.html "proc documentation") states that

> Proc is a block of code that have been bound to a set of local variables. Once bound, the code may be called in different contexts and still access those variables.

### Assign Proc to a variable

The best way to display this in work is to do the same operation as with `multiply` method.

```ruby
> result = Proc.new { puts 2 * 2 }
=> #<Proc:0x007fb5281b8a98@(irb):35>
```

In this example you now see that the `result` variable doesn’t hold the result of the number multiplication, but it holds the function itself. Only when I decide to explicitly call the function, I get the actual function executed.

```ruby
> result.call
=> 4
```

### Return Proc by another function

The next example will show you how to return a Proc from another function. Let’s stick to the same multiplication example, but elaborate it a little bit and wrap it into a method.

```ruby
def multiply(method_number)
  Proc.new { |proc_number| proc_number * method_number }
end

> multiply(2)
=> #<Proc:0x007fb528180dc8@(irb):38>
```

In case you want to call it, first, you have to assign `multiply` method to a variable and, second, call the Proc object itself.

```ruby
> result = multiply(2)
=> #<Proc:0x007fb528173240@(irb):38>
> result.call(7)
=> 14
```

### Pass Proc as a function argument

The third and the last example is about how to pass a Proc Object as a method argument.

```ruby
multiply = Proc.new { |number| number * 2 }

def calculate(proc)
  [1, 2, 3, 4, 5].each do |number|
    puts proc.call(number)
  end
end

> calculate(multiply)
=> 2 4 6 8 10
```

You can also use `map` method and pass a Proc object instead of a block prefixing it with `ampersand`:

```ruby
> [1, 2, 3, 4, 5].map(&multiply)
=> 2 4 6 8 10
```

This also tells us that `map` is a [higher order function](https://en.wikipedia.org/wiki/Higher-order_function "map function"), meaning that it can take one or more functions as an argument.

The last two examples also illustrate two different programming paradigms such as **imperative** and **declarative** one. Same as its name states, the imperative code (example with block) focuses on **how** to achieve the result and shows the exact steps to be implemented, whereas the declarative code (example with map) cares of **what** you want to achieve and hides the implementation details under the hood.

### Conclusion

All in all, `method` is a container for a code which you execute whenever you call a method name, however the code inside a `Proc` or a *first-class function* is stored unless you explicitly tell it to be executed, which gives you a wide spectrum of possibilities and ways to manipulate your code.

So generally why would you want to use a Proc (which is by the way the shorthand for *procedure*)? One of the reasons is **reusability** - you can reuse a Proc object as many times as necessary and do not write a lot of duplicated code. Returning to the multiplication example, what if you have N different arrays of numbers, where each number has to be multiplied by 2? Simply pass the `multiply` method to every new array.

```ruby
> [1, 2, 3, 4, 5].map(&multiply)
=> [2, 4, 6, 8, 10]
> [67, 32, 13, 40, 54].map(&multiply)
=> [134, 64, 26, 80, 108]
> [11, 12, 13, 14, 15].map(&multiply)
=> [22, 24, 26, 28, 30]
…
```

For example, if you go with a simple block, then you would have to repeat one and the same block N times, because block cannot be saved and is considered to have one time effect.

One more advantage is that you can also pass multiple Procs as method arguments. Let’s imagine that your program expects to have many callbacks; then you can simply pass as many Proc objects as you need, while you cannot achieve this result with just a block since Ruby method can accept only one block at a time.

```ruby
def process(callbacks)
  callbacks[:start].call
  sleep 2
  puts "some stuff is being processed..."
  sleep 2
  callbacks[:end].call
end

start_proc = Proc.new { puts "the process has started, let's wait :(" }
end_proc   = Proc.new { puts "the process has ended, yay!" }
process(start: start_proc, end: end_proc)
```

Another interesting thing about first-class functions is that they do not depend on names and thus they are often called [anonymous functions](https://en.wikipedia.org/wiki/Anonymous_function "anonymous functions").

Finally, it is important to know that the first-class functions are the main pillar of the **functional** programming which is quite a topic to be discussed as a separate post.
