---
title: Integrating LDAP with Rails
description: In this post, I will tell you how to integrate LDAP with your Rails app. For this purpose, I will be using net-ldap gem and an online open LDAP server, which works just fine for the testing purposes.
date: "2017-05-29"
tags: [rails, ldap]
draft: false
path: "/blog/ldap-rails"
---

[LDAP](https://en.wikipedia.org/wiki/Lightweight_Directory_Access_Protocol "ldap wikipedia") (Lightweight Directory Access Protocol) is a server protocol used to access and manage directory information.

Let's assume that you already have the LDAP server running. Also, you have all your employees listed there.

In this post, I will tell you how to integrate LDAP with your Rails app. For this purpose, I will be using [`net-ldap`](https://github.com/ruby-ldap/ruby-net-ldap "ruby net ldap gem") gem and an online open [`LDAP server`](http://www.forumsys.com/tutorials/integration-how-to/ldap/online-ldap-test-server "ldap server"), which works just fine for the testing purposes.

However, you can use [`devise_ldap_authenticatable`](https://github.com/cschiewek/devise_ldap_authenticatable "devise ldap authenticatable gem") gem where everything is already implemented; but for now I decided to come up with something of my own for the purpose of understanding what happens behind the scenes.

Let's start with creating the Ldap class. I will add it to the lib directory and implement couple of core methods there.

The `create_connection` method will create a new Ldap object, and later on we will be able to reuse the connection method not to overload the LDAP with too many connection requests for one and the same user. Note that I have used **ldap.forumsys.com** host and port **389**; they were specified in the instruction for the test LDAP server I am using.

The bind method will return true/false depending on the connection status. One of the top reasons why you might get false is the wrong username format. It should be converted according to LDAP's way, for example, I am using riemann@example.com email, which eventually should look like `uid=riemann,dc=example,dc=com`. Otherwise you will get this error:

```bash
=> #<OpenStruct extended_response=nil, code=34, error_message="invalid DN", matched_dn="", message="Invalid DN Syntax">
```

In oder to get the correct formats, I added the `sanitize_email`, `domain` and `username` methods to this class.

There is also a `get_user_info` which uses the search method from `Net::LDAP` library. In this case I decided to retrieve the info about the user who has just signed in. To do this, I need to specify the base domain (dn=example,dn=com) and filter by username (riemann).

The search output will be the following:

```bash
=> [#<Net::LDAP::Entry:0x007fb46cc3d840
  @myhash=
   {:dn=>["uid=riemann,dc=example,dc=com"],
    :userpassword=>["{sha}W6ph5Mm5Pz8GgiULbPgzG37mj9g="],
    :objectclass=>["inetOrgPerson", "organizationalPerson", "person", "top"],
    :cn=>["Bernhard Riemann"],
    :sn=>["Riemann"],
    :uid=>["riemann"],
    :mail=>["riemann@ldap.forumsys.com"]}>
```

Later on you can continue building your app logic depending on this info; for example, you can grant different user access permissions.

So here's the complete code from my `lib/ldap.rb`:

```ruby
# lib/ldap.rb

class Ldap
  def initialize(email, password)
    @email = email
    @password = password
  end

  def bind
    connection.bind
  end

  def connection
    @connection ||= create_connection
  end

  def get_user_info
    connection.search(
      :base => domain,
      :filter => Net::LDAP::Filter.eq("uid", username)
    ).first
  end

  private

  def create_connection
    Net::LDAP.new(
      :host => "ldap.forumsys.com",
      :port => 389,
      :auth => {
        :method => :simple,
        :username => sanitize_email,
        :password => @password
      }
    )
  end

  def domain
    domain = @email.split("@").last.split(".")
    "dc=#{domain.first},dc=#{domain.last}"
  end

  def username
    "#{@email.split("@").first}"
  end

  def sanitize_email
    "uid=#{username},#{domain}"
  end
end
```

Next step, I will create the `ldap_auth_controller.rb` file. Here I have the connect method and the ldap memoize for the Ldap class method. The `get_operation_result` called on Ldap connection returns the result of the operation.

```ruby
# controllers/ldap_auth_controller.rb

class LdapAuthController < ApplicationController
  def connect
    if ldap.bind
      @user_info = ldap.get_user_info
      flash[:success] = ldap.connection.get_operation_result.message
      redirect_to root_path
    else
      flash[:error] = ldap.connection.get_operation_result.message
      redirect_to ldap_auth_path
    end
  end

  private

  def ldap
    @ldap ||= Ldap.new(params[:email], params[:password])
  end
end
```

Further on, in `routes.rb` I'll create two routes, one for the sign in form and the second one for the connect action. We will root to `ldap_auth#home`:

```ruby
# config/routes.rb

Rails.application.routes.draw do
  get  :ldap_auth, action: :index, controller: :ldap_auth
  post :connect, controller: :ldap_auth

  root to: "ldap_auth#home"
end
```

Finally, let's create the `ldap_auth` folder in views and add there two files: `index.html.erb` and `home.html.erb`:

Insert the code below into `index.html.erb`. I have added the `bootstrap_form` gem and used bootstrap grids to make the form look just a little bit prettier.


```erb
<!-- views/ldap_auth/index.html.erb -->

<div class="col-lg-6 col-lg-offset-3 col-md-6 col-sm-8">
  <h2>Log in</h2>

  <%= bootstrap_form_for("", url: connect_path, method: :post) do |f| %>
    <div class="field">
      <%= f.email_field :email%>
    </div>

    <div class="field">
      <%= f.password_field :password %>
    </div>

    <div class="actions">
      <%= f.submit "Log in" %>
    </div>
  <% end %>
</div>
```

As to `home.html.erb`, at this point it has no real purpose, so just add some dummy text there:

```erb
<!-- views/ldap_auth/home.html.erb -->

<p>Hey, I am a sample home page!</p>
```

And we are done. You can try this out with the `riemann@example.com` email and password `password`.

Later on you can continue building the authorization logic with the [devise](https://github.com/plataformatec/devise "devise gem") gem. You will have to rewrite the create action in `Devise::SessionsController`. This way you will sign in user only after bind returns true. As to the rest, you'll have all the cool and helpful Devise features.

To find out about the rest of methods which can be used with the `Net::LDAP` library, you can take a look at this official [documentation](http://www.rubydoc.info/gems/ruby-net-ldap/Net/LDAP "ldap documentation").

Here's the link to the [github's repository](https://github.com/alisafrunza/ldap_auth "github ldap auth") for this project.
