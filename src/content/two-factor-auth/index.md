---
title: Adding Two Factor Authentication To Your Rails App
description: If you’re thinking of ways to secure your web application, one of the things you might want to try is implementing Two Factor Authentication.
date: "2017-04-28"
tags: [rails, devise]
draft: false
path: "/blog/two-factor-auth"
---

If you’re thinking of ways to secure your web application, one of the things you might want to try is implementing Two Factor Authentication.

[Two Factor Authentication](https://en.wikipedia.org/wiki/Multi-factor_authentication "Wikipedia Two Factor Authentication") (2FA) adds an extra step to your login process. While initially it was only about verifying email and password, and voila, you’re done; now you need one more component to prove your identity.

All in all, there are three 2FA types:

1. Knowledge - info that you know, for example your ID or a secret question.
2. Possession - something you have, like a phone, which you can use to scan a QR code or receive a text message.
3. Inheritance – basically your body, meaning that you can scan your iris or a fingerprint.

In this post I will tell how to implement the 2nd type - QR code verification - with a Rails application.

#### The workflow will be the following:

New user signs in for the first time. No 2FA is required. Nonetheless, if user decides so, she can activate 2FA.

While doing so, the user will be prompted to scan a QR code with the app installed on her phone. I will be using [Google Authenticator](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2 "Google Two Factor Auth Play Market") which works perfectly with the gem I chose for implementation.

![QR code](./qr.png)

When the user activated 2FA and scanned the QR code, next time she will be prompted to verify the One Time Password (OTP) from her Google Authenticator app.

![Google Authenticator](./google_auth.jpeg)

Now, let’s talk Rails!

You will need to add the following Gems to your Gemfile:

```ruby
# Gemfile

gem 'devise'
gem 'devise-two-factor'
gem 'rqrcode_png' # NOTE: will use it to generate QR code
```

Afterwads, run this in your console:

```bash
$ bundle install
```

Next, you need to run Devise generator, also from the console:

```bash
$ rails g devise:install
```

Create User model:

```bash
$ rails generate devise User
```

We will only need Devise session views; to generate this run:

```bash
$ rails generate devise:views -v sessions
```

When it comes to the [`devise-two-factor`](https://github.com/tinfoil/devise-two-factor/ "Devise Two Factor gem") gem, run the following command in your console with an encryption key which will be used to encrypt all OTP secrets before you store them to the database (Note: this key has to be 32 bytes or longer):

```bash
$ rails generate devise_two_factor User 32_bytes_long_example_key
```

This will automatically add these lines to your User model:

```ruby
# models/user.rb

devise :two_factor_authenticatable,
        :otp_secret_encryption_key => '32_bytes_long_example_key' # NOTE: move it somewhere safe
```

Later on, don’t forget to assign your key to any environment variable and move it to the settings, so that no one from the outside can access it.

In `application_controller.rb` add this before action:

```ruby
# controllers/application_controller.rb

class ApplicationController < ActionController::Base
  before_action :authenticate_user!
  before_action :configure_permitted_parameters, if: :devise_controller?

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_in, keys: [:otp_attempt])
  end
end
```

Finally, before running your migrations, add `unconfirmed_otp_secret` field to `****_add_devise_two_factor_to_users.rb` migration file:

```ruby
# db/migrate/****_add_devise_two_factor_to_users.rb

class AddDeviseTwoFactorToUsers < ActiveRecord::Migration[5.0]
  def change
    . . .
    add_column :users, :unconfirmed_otp_secret, :string
  end
end
```

Since we are done with the setup, run your migrations from the console:

```bash
$ rails db:migrate
```

At this point, let’s start with creating your routes. We will create a couple of custom methods in `Devise::SessionsController`, that’s why we have to overwrite the devise session route. We will also root to home page and tell Devise to redirect user to the sign in page, if she’s not logged in. So, add the following code to your `routes.rb`:

```ruby
# config/routes.rb

Rails.application.routes.draw do
  devise_for :users, controllers: { sessions: 'users/sessions' }

  devise_scope :user do
    post "/users/sessions/verify_otp" => "users/sessions#verify_otp"

    authenticated :user do
      root 'home#index', as: :authenticated_root
    end

    unauthenticated do
      root 'devise/sessions#new', as: :unauthenticated_root
    end
  end

  resources :two_factor do
    collection do
      get :activate
      get :deactivate
    end
  end

  root to: 'home#index'
end
```

As you can see, we have the activate/deactivate routes, so add these 2 methods to `user.rb`. They will give the user the option to turn the Two Factor step on or off:

```ruby
# models/user.rb

def activate_otp
  self.otp_required_for_login = true
  self.otp_secret = unconfirmed_otp_secret
  self.unconfirmed_otp_secret = nil
  save!
end

def deactivate_otp
  self.otp_required_for_login = false
  self.otp_secret = nil
  save!
end
```

Now let’s overwrite the default `Devise::SessionsController`. Create a `users` folder in your controllers, then create a `sessions_controller.rb` file inside it, and paste the following code from the snippet. Basically, here we do the following:

1. check whether 2FA is required or not, and
2. create session only if User validated OTP.

```ruby
# controllers/users/sessions_controller.rb

class Users::SessionsController < Devise::SessionsController
  def create
    return redirect_to new_user_session_path unless user_exist?
    user = User.find_by(id: session[:temp_user_id])
    return render :otp  if user.otp_required_for_login
    create_session(user)
  end

  def user_exist?
    return false unless user = User.find_by(email: params[:user][:email])
    return false unless user.valid_password?(params[:user][:password])
    session[:temp_user_id] = user.id
    true
  end

  def verify_otp
    user = User.find_by(id: session[:temp_user_id])
    if user.validate_and_consume_otp!(params[:otp_attempt], otp_secret: user.otp_secret)
      create_session(user)
    else
      render :otp
    end
  end

  def create_session(user)
    sign_in(user)
    session.delete(:temp_user_id)
    respond_with user, location: after_sign_in_path_for(user)
  end
end
```

Next we should create a `two_factor_controller.rb` and add there this code:

```ruby
# controllers/two_factor_controller.rb

class TwoFactorController < ApplicationController
  def activate
    current_user.unconfirmed_otp_secret = User.generate_otp_secret
    current_user.save!
    @qr_code = RQRCode::QRCode.new(two_factor_url).to_img.resize(240, 240).to_data_url
    current_user.activate_otp
    render :qr
  end

  def deactivate
    current_user.deactivate_otp
    redirect_back(fallback_location: root_path)
  end

  def two_factor_url
    app_id = "test_id"
    app_name = "test_name"
    "otpauth://totp/#{app_id}:#{current_user.email}?secret=#{current_user.unconfirmed_otp_secret}&issuer=#{app_name}"
  end
end
```

Here we build an url which will be formatted to the QR code, later on. In `activate` method we generate the code itself and make a call to the User model to update required fields.

Lastly, let’s create an empty `home_controller.rb`:

```ruby
# controllers/home_controller.rb

class HomeController < ApplicationController
end
```

The final step will be to create 3 views: one for `home#index` action, another one to display OTP, and the third one to show the QR code. In `views > devise > sessions`, create file `otp.html.erb` and put the following code there:

```erb
<!-- views/devise/sessions/otp.html.erb -->

<p>Please verify your OTP</p>
<%= form_for "", url: users_sessions_verify_otp_path, method: :post do |f| %>
  <%= f.label :otp_attempt %>
  <%= f.text_field :otp_attempt %>
  <%= f.submit "Verify" %>
<% end %>
```

Also in views create two more folders: `home` and `two_factor`. To `home` folder add `index.html.erb` file:

```erb
<!-- views/home/index.html.erb -->

<%- if current_user.otp_required_for_login %>
  <%= link_to("Deactivate two factor", deactivate_two_factor_index_path) %>
<% else %>
  <%= link_to("Activate two factor", activate_two_factor_index_path) %>
<% end %>
```

And add `qr.html.erb` to `two_factor` folder:

```erb
<!-- views/two_factor/qr.html.erb -->

<p>Please scan the QR code:</p>
<%= image_tag @qr_code %>
```

This is pretty much it. Now start your `rails s` server, and check what you just did.

The thing I like about `devise-two-factor` gem is that it’s pretty flexible. While I showed you this approach, you can still implement it in any way you’d like.

In case you might need it, here’s the link to the [Github repo](https://github.com/alisafrunza/two-factor-authentication "github two factor authentication") with this project.
