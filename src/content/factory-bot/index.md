---
title: Create factories without using ActiveRecord
description: Find out how to create FactoryBot factories in a ruby app that does not have a database connection.
date: "2020-11-04"
tags: [ruby, rspec, factory-bot]
draft: false
path: "/blog/factory-bot-without-db"
---

Let's say you are working on a simple ruby project that does not have a database. What is does, it mostly sends some API calls. For example, every time we want to send an API call to one service, we first need to retrieve user data from another service. Then in some time you add another call, and yet again you need to retrieve user info, and etc. When testing this, I found myself having a lot of duplicate data per different test cases, like

```ruby
let(:user_name) { "user_name" }
let(:last_name) { "last_name" }
let(:email) { "test@example.com" }
```

At some point it became very, very verbose.

One of the ideas was to introduce `user` factory with the help of [`factory-bot`](https://github.com/thoughtbot/factory_bot) gem. Of course, the main difficulty was that FactoryBot would expect you to have a db connection, so here's my workaround.

### Step 1

First, in my `spec/support` folder I created a `user_response.rb` file with a sample API response I get every time I retrieve a user.

Also based on my needs, I added a `data` method that has a structure of the user `data` from the API response since I was quite often using it in my test suit.

Finally, I added several attributes so that I could access mostly used user fields later on. Also, I assigned the values of these attributes to the corresponding fields in the `data` method. The values for the attributes will be coming from the factory itself (the one that we will be creating in the Step 2).

For now, this is how the whole `UserResponse` class looked:

```ruby
# spec/support/user_reponse.rb

class UserResponse
  attr_accessor :email, :first_name, :last_name, :date_of_birth

  def data
    {
      "data" => {
        "attributes" => {
          "email" => email,
          "first_name" => first_name,
          "last_name" => last_name,
          "date_of_birth" => date_of_birth,
        }
      }
    }
  end
end
```

### Step 2

Then, I created a new `/factories` folder and added a user factory there. The factory contained all the same fields that were previously set as `attr_accessor` in the `UserResponse` class (which, by the way, we also need to pass as a `class:` option to the factory).

> Note: I used [`faker`](https://github.com/faker-ruby/faker) gem to generate some fake data for my user factory.

```ruby
# spec/factories/user

FactoryBot.define do
  factory :user, class: UserResponse do
    email { Faker::Internet.email }
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    date_of_birth { Faker::Date.birthday(min_age: 1, max_age: 100).to_s }
  end
end
```

### Step 3

Now, our brand new factory is almost ready to be used; there is though one thing that needs to be fixed, but let's generate the error first.

So, the usage is the same as for the regular flow. You create a new factory in your test and then you can call on its attributes. You can also call `data` on the user and get the json response we talked about in Step 1.

```ruby
let(:user) { create(:user) }

user.first_name
user.email
user.data
```

Coming back to the promised error, if you now run your tests, you should get something similar to:

```bash
Failure/Error: let(:user) { create(:user) }

NoMethodError:
  undefined method `save!' for #<UserResponse:0x00007fb24f826a78>
```

Which makes total sense since we have no database to save our records to. In order to fix it, I just re-opened an empty `save!` method in my `UserResponse` class and then all the tests with the new user factory successfully passed.

```ruby
class UserResponse
  # NOTE: the rest of the code is skipped

  def save!; end
end
