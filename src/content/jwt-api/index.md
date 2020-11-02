---
title: How to use JSON Web Tokens in API requests
description: A simple implementation of Web API in Rails and an example of how to access it with JWT signed with private key
date: "2018-03-02"
tags: [rails, api, jwt]
draft: false
path: "/blog/rails-api-jwt"
---

_Fast_ and _secure_ are the two best words to describe JSON Web Tokens, also known as **JWT**. So what are these tokens and why would one want to use them?

JWT is a cryptographically signed JSON object used for secure information transmission. It can be signed with a secret token (**HMAC** and **ECDSA** algorithms) or a pair of public and private keys (**RSA** algorithm). In this post, I will show an example of how to encode/decode a JWT in ruby by using private/public key pair. Then I will make a sample request with this token to an API implemented in Rails.

Basically, Web **API** (Application programming interface) is an application with a set of endpoints which you can access by means of requests and retrieve some information. Let's assume that I have a big amount of some kind of data and I can share this data with the consumers of my API. For this I will need a new rails application created with `--api` tag not to load redundant configuration such as cookies or flash messages.

```bash
$ rails new jwt_test --api
```

In order to create a dummy data, I am going to use [`faker`](https://github.com/stympy/faker "faker ruby gem'") gem that allows you to generate a big set of random user info.

```ruby
# Gemfile

gem "faker", :git => "https://github.com/stympy/faker.git", :branch => "master"
```

As a next step I will be generating a new address book table in the database `rails g migration CreateAddressBook`.

```ruby
# db/migrate/20180302122906_create_address_book.rb

class CreateAddressBook < ActiveRecord::Migration[5.1]
  def change
    create_table :address_books do |t|
      t.string :address
      t.string :city
      t.string :country
      t.string :first_name
      t.string :last_name
      t.string :phone_number
      t.string :email
      t.string :job_title
    end
  end
end
```

Run `bundle install` and `rails db:migrate` in your terminal and create an empty address book model.

```ruby
# models/address_book.rb

class AddressBook < ApplicationRecord
end
```

Afterwards let's prepare a seeds file to fill in the address_book table.

```ruby
# db/seeds.rb

100.times do
  address_book              = AddressBook.new
  address_book.first_name   = Faker::Name.name.split.first
  address_book.last_name    = Faker::Name.name.split.last
  address_book.country      = Faker::Address.country
  address_book.city         = Faker::Address.city
  address_book.address      = Faker::Address.street_address
  address_book.phone_number = Faker::PhoneNumber.cell_phone
  address_book.job_title    = Faker::Job.title
  address_book.email        = Faker::Internet.email

  if address_book.save
    pp "New entry added to address book"
  else
    pp address_book.errors.errors.full_messages
  end
end
```

If you run `rails db:seed` in the terminal, it will create a dataset which later on we can offer to the consumers of the API.

I will go on and create a first version of the API in controllers folder and call it `personal_data_controller.rb`. What it does, it just outputs all addresses in a JSON format.


```ruby
# controllers/api/v1/personal_data_controller.rb

class Api::V1::PersonalDataController < ActionController::Base
  def index
    render json: { data: AddressBook.all }
  end
end
```

I also have to specify routes for this controller, for the testing purposes it will only be one `get` route for the `index` action.


```ruby
# config/routes.rb

Rails.application.routes.draw do
  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      resources :personal_data, only: [:index]
    end
  end
end
```

You can use [`rest-client`](https://github.com/rest-client/rest-client "rest client ruby gem") gem to access it. RestClient offers you a big variety of options to make `get`, `post`, `put` and `delete` requests. You can dig for more details on their github page. Hence, add this gem to your Gemfile, run `bundle install`, start `rails server` and make a request from the rails console.


```bash
> response = RestClient.get 'http://localhost:3000/api/v1/personal_data'
 => <RestClient::Response 200 "{\"data\":[{\"...">
> JSON.parse(response.body)
=> {"data"=>[{"id"=>1, "address"=>"98000 Hayley Wall", "city"=>"Lake Marcelle", "country"=>"French Southern Territories", "first_name"=>"Sabina", "last_name"=>"Mann", "phone_number"=>"1-556-411-3952", "email"=>"gustave@konopelski.net"......}]}
```

Ta da, you just retrieved all the data as easy as that.

So this is a very simplistic example of how a Web API can work. However, in a bit closer to the real life environment, no one will really allow you accessing an endpoint without identifying yourself. So let's add a trivial authorization for our consumers.

First of all, let's create a consumer model with the help of [`devise`](https://github.com/plataformatec/devise "devise ruby gem") gem.

```ruby
# Gemfile

gem 'devise'
```

```bash
$ bundle install
$ rails generate devise:install
$ rails generate devise Consumer
$ rails db:migrate
```

After this, let's generate another migration to add two more fields to the consumer table, this will be `_token_` and `_secret_`. JWT will be saved to token field later on, while secret will be used to identify who the consumer is. Run `rails g migration AddFieldsToConsumer` from the terminal and update the migration file.

```ruby
# db/migrate/20180302123914_add_fields_to_consumer.rb

class AddFieldsToConsumer < ActiveRecord::Migration[5.1]
  def change
    add_column :consumers, :token, :string
    add_column :consumers, :secret, :string
  end
end
```

Migrate the database afterwards.

As a rule, you would usually have to create an admin panel, ask consumers to register and provide them with a secret, but for now I will not bother to handle this and create a test consumer from the rails console. The _secret_ will be a string generated with [SecureRandom](http://ruby-doc.org/stdlib-2.1.2/libdoc/securerandom/rdoc/SecureRandom.html "ruby secure randon base64") module.


```bash
> consumer = Consumer.new
> consumer.email = "test@example.com"
> consumer.password = "12345678"
> consumer.secret = SecureRandom.urlsafe_base64(32)
> consumer.save
```

So now I can add the logic to prevent unidentified consumers from retrieving the data. To make this happen, I have to add an authorization endpoint to provide the customer with a token. The flow is usually the following: the customer authorizes with the help of secret, gets a token and then uses it to retrieve data. In OAuth terms, this token would usually be called `access_token`.

We need to add the `authorize` route, which will be the `post` action. It will also be a `collection` route since in this implementation we do not require personal_data IDs.

```ruby
# config/routes.rb

Rails.application.routes.draw do
  devise_for :consumers
  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      resources :personal_data, only: [:index] do
        post :authorize, on: :collection
      end
    end
  end
end
```

Then add the authorize action to the `personal_data` controller. If the request is built correctly and it has the `secret` in the header, then we can find the consumer in the database, generate the random token and return it as JSON response.

```ruby
# controllers/api/v1/personal_data_controller.rb

class Api::V1::PersonalDataController < ActionController::Base
  def index
    render json: { data: AddressBook.all }
  end

  def authorize
    return render json: {}, status: 401 unless consumer.present?

    consumer.update!(token: SecureRandom.urlsafe_base64(32))

    render json: { data: { token: consumer.token } }
  end

 private

  def consumer
    @consumer ||= Consumer.find_by(secret: request.headers["HTTP_SECRET"])
  end
````

Now if I make a request to `authorize` action without a secret or with a wrong one, I get an `401 Unauthorized` error.

```bash
> RestClient::Request.execute(
  method: :post,
  url: 'http://localhost:3000/api/v1/personal_data/authorize',
  headers: {
    secret: "wrong"
  }
)
=> RestClient::Unauthorized: 401 Unauthorized
```

However, I am not going to implement the token validation logic, because, finally, it's time for us to get to know how to use JWT.

Generally speaking, JWT is a Base64 encoded string that consists of three parts `header.payload.signature` separated by a dot.

The **header** specifies the token type, which is JWT, and the encryption algorithm, which is `RS256` since I decided to use public/private keys.

```
{
  "typ": "JWT",
  "alg": "RS256"
}
```

All info we want to know about the consumer goes to the **payload** part. In our case it will look like this:

```ruby
{
  "secret": consumer.secret,
  "email": consumer.email,
  "exp": 5.minutes.from_now
}
```

The last goes the **signature**; the formula for the signature is Base64 encoded header, Base64 encoded payload and the private key. Then all of them are signed by the RS256 algorithm. The whole signature is Base64 encoded as well.

```
RSASHA256(
  Base64.encode64(header) + "." +
  Base64.encode64(payload),
  private_key
)
```

I believe you do no want to do all this manually, that is why there is a ruby gem called [`jwt`](https://github.com/jwt/ruby-jwt "jwt ruby gem") that can do all encoding and decoding part for you. As I am going to use the public/private keys for JWT signing, it makes sense to generate a private key first.

[`OpenSSL::PKey::RSA.generate(2048)`](http://ruby-doc.org/stdlib-2.5.0/libdoc/openssl/rdoc/OpenSSL/PKey/RSA.html "openssl ruby keys") generates a private key object for you. If you assign it to a variable and call `to_s` method on it, you can see the actual key; if you call `public_key`, you will get a public key.

```bash
> private_key = OpenSSL::PKey::RSA.generate(2048)
=> #<OpenSSL::PKey::RSA:0x007fc0d4d11f18>

> private_key.to_s
=> "-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAA.......GHdR+JDL68w==\n-----END RSA PRIVATE KEY-----\n"

> private_key.public_key
=> #<OpenSSL::PKey::RSA:0x007fc0d6246370>

> private_key.public_key.to_s
=>  "-----BEGIN PUBLIC KEY-----\nIBCgKCAQEA344d0T.........VwIDAQAB\n-----END PUBLIC KEY-----\n"
```

After you generated the private key, you need to save it to a file in the `config` directory (only for testing purposes, in real life you never want to expose this key).

```bash
> File.open("config/private_key.pem", "w") { |file| file.write(private_key) }
```

As a second step, we will need to populate the `private_data` controller and add the `payload`, `private_key` and `jwt` methods there.

```ruby
# controllers/api/v1/private_data_controller.rb

class Api::V1::PersonalDataController < ActionController::Base
  ...
  def jwt
    JWT.encode(payload, private_key, "RS256")
  end

  def payload
    {
      email:  consumer.email,
      secret: consumer.secret,
      expire: 5.minutes.from_now
    }
  end

  def private_key
    private_key_file = File.read(Rails.root.join("config", "private_key.pem"))
    OpenSSL::PKey::RSA.new(private_key_file)
  end
  ...
end
```

The `payload` method gathers some basic user info. In future it will save us some time, since there will be no need to query the database over and over again.

The `private_key` method reads the private key from `_private_key.pem_` file, where I saved it couple of steps before.

Lastly, the `jwt` method creates the actual token for us (that's the `jwt` gem in action). Now we can return it to the consumer as a response in `authorize` action.

```ruby
# controllers/api/v1/private_data_controller.rb

class Api::V1::PersonalDataController < ActionController::Base
  def authorize
    return render json: {}, status: 401 unless consumer.present?

    consumer.update!(token: jwt)

    render json: { data: { token: consumer.token } }
  end
end
```

Ultimately, let's add the before hook for index action. It will check for the JWT in the request authorization header and decode it. If it's valid, the consumer can retrieve all the data, otherwise, we throw an error. `JWT.decode` takes the JWT as the first argument, second one is the API's public key, the `true` flag says that the algorithm token (public key) should be verified (in some cases no token is used) and the last one goes the algorithm itself. Here is how the `personal_data_contoller.rb` will eventually look:

```ruby
# controllers/api/v1/personal_data_contoller.rb

class Api::V1::PersonalDataController < ActionController::Base
  before_action :validate_jwt, only: :index

  def index
    render json: { data: AddressBook.all }
  end

  def authorize
    return render json: {}, status: 401 unless consumer.present?

    consumer.update!(token: jwt)

    render json: { data: { token: consumer.token } }
  end

  private

  def jwt
    JWT.encode(payload, private_key, "RS256")
  end

  def payload
    {
      email:  consumer.email,
      secret: consumer.secret,
      expire: 5.minutes.from_now
    }
  end

  def private_key
    private_key_file = File.read(Rails.root.join("config", "private_key.pem"))
    OpenSSL::PKey::RSA.new(private_key_file)
  end

  def validate_jwt
    JWT.decode(
      request.authorization.split.last,
      OpenSSL::PKey::RSA.new(private_key.public_key),
      true,
      { algorithm: "RS256" }
    )
  rescue => error
    render json: { errors: error }
  end

  def consumer
    @consumer ||= Consumer.find_by(secret: request.headers["HTTP_SECRET"])
  end
end
```

Now you can make one more request with only JWT token passed to the request authorization header. It is also called **Bearer authentication** because it requires only token, not the set of user credentials (password and login). Initially, it was created as a part of Open Authorization (**OAuth**) scheme.

```bash
> jwt = "qkjhgfcvb.lkjhfgvhuhj.jsnchydwcnj"

> RestClient::Request.execute(
  method: :get,
  url: 'http://localhost:3000/api/v1/personal_data',
  headers: {
    authorization: "Bearer #{jwt}"
  }
)
```

To round it all up, you can use APIs to consume or provide data, and it is smart to have a strong authorization in order to protect your data. I think, if authorization solution already exists in a form of a gem, it is OK to use it and not reinvent the wheel. However, you might need some custom behavior and then it makes sense to write something of your own.

As to JWT, you might want to use this token in your requests and be sure nothing malicious was injected somewhere along the way. As an option, you can check if JWT has expired and ask consumer to re-authorize to get a new valid token. You can read more about JSON Web Tokens at [jwt.io](https://jwt.io "about jwt"). They also have an interactive debugger so that you can test your token right away.

You can find the code for the sample API in my [github repo](https://github.com/alisafrunza/jwt_token "api jwt github repo'").
