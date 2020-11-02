---
title: Give this API a REST
description: Do you know about the 5 mandatory REST API constraints? Over the last couple of years I’ve been dealing a lot with APIs and I was taking for granted that those APIs were RESTful.
date: "2018-09-10"
tags: [rails, rest]
draft: false
path: "/blog/rest-api"
---

Over the last couple of years I’ve been dealing a lot with APIs and I was taking for granted that those APIs were RESTful. But at some point when I asked myself what was REST, I could not find the answer. Erm…

![gif erm](https://media.giphy.com/media/5hmlX9levfAC6kbBRk/giphy.gif)

So I started googling the topic and surfing various resources, and almost every blog post had a reference to **Roy Fielding**, who actually came up with the term REST in his [dissertation](https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm#sec_5_2 "roy fielding rest dissertation") as of 2000. So it made sense to read the original work and try to find out what does it really mean to write APIs that can be called RESTful. I also tried to make some examples in the context of Rails (where applicable).

Let’s start with a definition.

**REST** (Representational State Transfer) is an architectural style which lists a set of constraints to be applied to your API to make sure that it will be efficient in a long term perspective.

#### Null style

The very first thing you do - you design your system and think of implementation. The idea is to start with system’s needs as a whole without any constraints so that you can see a bigger picture of what you are building and what are the purposes. Then step by step, you identify and apply specific constraints making sure that those live in harmony with your system. It is not that you start blank and figure out what it will be in the process, but you know what you are building in advance and incrementally add constraints assuring your API’s longevity.

> The Null style is simply an empty set of constraints. From an architectural perspective, the null style describes a system in which there are no distinguished boundaries between components. It is the starting point for our description of REST. - Roy Fielding

Later on in his dissertation, Roy Fielding suggests a list of **5 mandatory constraints** which you need to apply in order to have a RESTful API.

Here are they:

- Client-Server
- Stateless
- Cache
- Uniform Interface
- Layered System

Now let's go through all of them in more details.

## Client-Server

Usually, there is a **server** part that holds some specific data and a **client** part that wants to retrieve data. Server offers a list of resources on which client can make a request and get some kind of data. It is also up to server to either reject or process requests.

> A client is a **triggering** process; a server is a **reactive** process. Clients make requests that trigger reactions from servers. Thus, a client initiates activity at times of its choosing. On the other hand, a server waits for requests to be made and then reacts to them. - Roy Fielding

At the same time, this constraint states that client and server should be separated. The server components should be focused on data. The client side should hold all user interactions. Moreover, these two concerns should evolve independently; and the only thing the client should care about is the resource’s URI.

Nowadays this does not sound as something new and is considered a common practice. You'd surprise no one by client/server approach. Just keep things separate and try to decrease dependency.

By the way, let’s make a small detour to resources I mentioned earlier. **Resource** is one of the key REST concepts, and if put simply, it is just an abstract way to call any kind of information. Basically, resource is something you share with the world as a part of your service (be it a list of movies, specific book or currency converter), which you can access by a specific URI.

While, in REST terminology **URI** - `v2/books/123/comments/123` - is called **resource identifier**.

## Stateless

The next constraint says that client-server communication should be stateless. Every new request made by a client towards a server must contain all the information to perform the request. Meaning that a server cannot hold any information on its side, and if there is any kind of a session, it should only be kept on the client side.

#### application state vs resource state;

Speaking of statelessness, this constraint is related to the **application state**, which covers all your interactions with an application. For example if you are logged in to Facebook, or replying to a specific tweet, or writing a comment to a friend’s post on Instagram, all this happen in scopes of the application state. So this kind of state is the responsibility of a client.

There is also a **resource state** which is the state of a resource on a server and it has to be handled by the server only. Mainly, this is what you get as a response from a server and it can be referred to as **resource representation**, which can be either  `pdf`, `json`, `xml`, `html`, etc.

Going back to stateless constraint, every time you access whatever endpoint, you should specify tokens and other required info in the headers and payload. Why doing so? Mainly because by keeping your API stateless, you can take advantage of the following:

+ **Visibility**. So that you have everything you need right there and you are pretty sure what is going on within one request and you need no extra context;
+ **Reliability**. So that request stands on its own and if other request fails they have no influence on each other;
+ **Scalability**. So that server does not have to store the state and could process the request quickly and later on not worry about different states for different requests;

> **Scalability** is how much can we send from our source to different destinations during a specific amount of time.

However, you might think that is not always reasonable to perform one and the same request again and again. And you are right. That is why there is another constraint that tells you to use caching on the client side and decrease the amount of the repetitive requests when possible.

## Cache

[Cache](https://en.wikipedia.org/wiki/Cache_(computing) "cache definition wiki") is a hardware or software component that stores data so that future requests for that data can be served faster.

The idea behind this constraint is that if you can cache a response on the client side, then do it. It will improve the scalability and efficiency of your API.

However, the biggest drawback is that you should know when to invalidate your cache and send a new request to update the data. As it was [said](https://martinfowler.com/bliki/TwoHardThings.html "cache invalidation") once:

> There are only two hard things in Computer Science: cache invalidation and naming things.
-- Phil Karlton

For example, I’d say that you can cache whatever **GET** request which does not affect resources but just retrieves resources' details. Also, if you know that the data is updated not that often, then you can think of a smart way of caching it.

#### low-level caching;

Rails provides different ways for handling [cache](https://guides.rubyonrails.org/caching_with_rails.html "rails cache"), I personally, think that for this scenario we could use the **low-level caching**, which uses `Rails.cache` object directly. It is a perfect option for storing data that is costly to retrieve or which is ok to be a little bit out-of-date.

For example, you are retrieving a list of horror movies.

```bash
> response = RestClient.get("http://localhost:3000/movies")
> data = JSON.parse(response.body)
=> [
  {
    "id": 1,
    "name": "Halloween",
    "director": "John Carpenter",
    "release_date": "1978-10-25",
    "created_at": "2018-09-04T13:39:23.044Z",
    "updated_at": "2018-09-04T13:39:23.044Z"
  },
  {
    "id": 2,
    "name": "It follows",
    "director": "David Robert Mitchell",
    "release_date": "2015-03-27",
    "created_at": "2018-09-04T13:40:09.034Z",
    "updated_at": "2018-09-04T13:40:09.034Z"
  },
  {
    "id": 3,
    "name": "The Shining",
    "director": "Stanley Kubrick",
    "release_date": "1980-05-23",
    "created_at": "2018-09-04T13:40:44.636Z",
    "updated_at": "2018-09-04T13:40:44.636Z"
  },
  {
    "id": 4,
    "name": "Get Out",
    "director": "Jordan Peele",
    "release_date": "2017-02-24",
    "created_at": "2018-09-04T13:57:47.962Z",
    "updated_at": "2018-09-04T13:57:47.962Z"
  }
]
```

Then you can use `ActiveSupport::Cache::MemCacheStore` class under the `ActiveSupport::Cache` module to create a new instance for your cache, write the response there and set the expiration time.

```bash
> cache = ActiveSupport::Cache::MemoryStore.new
> cache.write("movies", data, expires_in: 2.days)
```

You can find the cached data by the key `movies` and with the help of method `read`.

```bash
> cache.read("movies")
=> [
  {
    "id": 1,
    "name": "Halloween",
    "director": "John Carpenter"
  ...
  }
]
```

When it expires, the return value will be set to `nil`.

```bash
> cache.read("movies")
=> nil
```

#### HTTP caching;

On the other hand, you might not want to rely on client’s blind decision for caching, but to explicitly tell the client that resource was updated. In this case the [HTTP caching](https://devcenter.heroku.com/articles/http-caching-ruby-rails "http caching") comes in handy and  Rails happen to have some cool tools for this as well.

Let’s stick to the same horror movies example.

```ruby
class MoviesController < ApplicationController
  def index
    @movies = Movie.all
    render json: @movies
  end
end
```

I can set a condition to return the movies collection only if it was updated recently, otherwise return the `RestClient::NotModified` status. The client would know that nothing has changed and could reuse the cached copy of movies.

For this purpose I can use the [`stale?`](https://api.rubyonrails.org/classes/ActionController/ConditionalGet.html#method-i-stale-3F "rails stale method") method.

> Sets the **etag** and/or **last_modified** on the response and checks it against the client request. If the request doesn't match the options provided, the request is considered stale and should be generated from scratch. Otherwise, it's fresh and we don't need to generate anything and a reply of **304 Not Modified** is sent.

So let’s update the movies `index` method accordingly.

```ruby
class MoviesController < ApplicationController
  def index
    @movies = Movie.all

    if stale?(@movies)
      render json: @movies
    end
  end
end
```

From the previous response you should use the `etag` header which you can access by calling `response.headers`.

> Etag (entity tag) is the HTTP header that gives a mechanism for web cache validation by allowing clients to make conditional requests.

```bash
> pp response.headers
=> {:x_frame_options=>"SAMEORIGIN",
 :x_xss_protection=>"1; mode=block",
 :x_content_type_options=>"nosniff",
 :x_download_options=>"noopen",
 :x_permitted_cross_domain_policies=>"none",
 :referrer_policy=>"strict-origin-when-cross-origin",
 :content_type=>"application/json; charset=utf-8",
 :etag=>"W/\"3c3cff77435d15c6d25ad4351cbcccdc\"",
 :cache_control=>"max-age=0, private, must-revalidate",
 :x_request_id=>"7f0cba64-7cbb-45c7-93f8-f47ae591dfaa",
 :x_runtime=>"0.006859",
 :transfer_encoding=>"chunked"}
```

Now I can test if any of the response headers include the value of the etag:

```bash
> RestClient::Request.execute(
    method: :get,
    url: 'http://localhost:3000/movies',
    payload: {},
    headers: {
      "If-None-Match": 'W/"3c3cff77435d15c6d25ad4351cbcccdc”'
    }
  )
=> RestClient::NotModified (304 Not Modified)
```

In case a header with such value exists, then the response will be `RestClient::NotModified (304 Not Modified)` meaning that nothing has changed in the movies collection, otherwise, the response would have returned the updated collection.

## Uniform Interface

I personally think that this constraint is the most complex one and, imo, it is also the most ignored one.

So you might think that you build your APIs the way you like and design whatever behavior you desire? At some point that is true, but it is also not.

As a developer you should take the responsibility of building comprehensive interfaces that makes sense to use.

<img src="https://media.giphy.com/media/6w7tYtag2oZCJjKlkl/giphy.gif" alt="erm" class="center-img">

Thus, this constraint is pretty much as its name states - build uniform interfaces for your APIs! You should provide your services through the same means so that both server and provider know what to expect from each other. As a result, everyone will know about everyone's capabilities, intentions and how to handle errors. In order to apply this constraint, REST offers 4 **subconstraints** 😀 which are:

#### identification of resources;

Here you need to provide a stable identifier for your resource, in terms of web app that will be an **URI**. With Rails you really do not need to bother about anything since they do everything for you. Just use `resources :movies` and you have everything set. You will have `/movies` route listing all movies and if you want to access a specific movie, it will look like `/movies/123` rather than `/getMovieById?id=123`.

#### manipulation of resources through representations;

**Resource representation** is the collection of all data on that resource. It has its own nature and format, which is usually called a [media type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types "media type"): audio, video, text, etc. Whenever you make a request, you can specify the content_type and accept headers, where `accept` tells what kind of data client can accept from server, while content type is about the content of the current request/response.

Specify both when making a request:

```ruby
  RestClient.post(
    "http://example.com/resource",
    {
      param_one: 1
    },
    {
      content_type: :json,
      accept: :json
    }
  )
```

And pay attention to `content-type` when reading the response headers:

```bash
{:x_frame_options=>"SAMEORIGIN",
 :x_xss_protection=>"1; mode=block",
 …
 :content_type=>"application/json; charset=utf-8"}
```

Also, in your rails controller methods, you can take advantage of the [`respond_to`](https://apidock.com/rails/ActionController/MimeResponds/respond_to "mime respond to") which will handle different formats of the client’s request. So if client says I want to get the response in `HMTL`, `JSON` or `XML`, it will take you only couple of line of code to handle this:

```ruby
def index
  @movies = Movie.all

  respond_to do |format|
    format.html # will render index.html.erb
    format.xml { render xml: @movies }
    format.json { render json: @movies }
  end
end
```

It is also a good idea to include metadata to your messages. **Metadata** is a way to determine all the details about a specific resource, like versions, copyright, etc. that will help the consumer of a resource to make the best out of it.

```json
{
  "meta": {
    "version": "2.0",
    "copyright": "Copyright 2015 Example Corp.",
    "author": "Person Someone",
    "total-pages": 13
  },
  "data": {
    // ...
  }
}
```

#### self-descriptive messages;

In a way each request and a response is a **message** and the bottom line is that you communicate by sending and receiving messages. This constraint says that your messages should be **context free** and have all the info at hand. So if you are making a request and receive a `JSON` representation of a resource, then you should specify in the media type that it’s `application/json`.


#### hypermedia as the engine of application state (HATEOAS);

This constraint implies that the server API should guide the client about the next potential steps within each response. With HATEOAS you don’t need external specifications/documentation to make sense of how to use resources.

Let’s for example get the `JSON` representation of all movies resource, it might look like this:

```json
{
  "data": [
    {
      "release_date": "2017-03-24",
      "director": "Jordan Peele",
      "name": "Get Out"
    }
  ]
}
```

Not that descriptive, isn't it?

I would not know without further documentation what to do with it. But if I apply HATEOAS, the representation of this resource should change to something similar to:

```json
{
  "data": [
    {
      "release_date": "2017-03-24",
      "director": "Jordan Peele",
      "name": "Get Out",
      "links": [
        {
          "href": "http://localhost:3000/movies/1",
          "href": "http://localhost:3000/movies/1/comments",
          "href": "http://localhost:3000/movies/1/actors"
        }
      ]
    }
  ]
}
```

From this example I know how to access every specific movie, I also know that there are related movie’s resources such as comments and actors which I can access as well.

Further on, you know exactly how to manipulate the resource with the help of such verbs as `GET`, `POST`, `PUT`, `DELETE`. You should not create routes as `/deleteHorrorMovie?id=123`, but you’d go with something like `DELETE /movies/123`.

As I already mentioned above, Rails routes are entirely RESTful and do all the job for you:


```bash
GET    /movies(.:format)          movies#index
POST   /movies(.:format)          movies#create
GET    /movies/new(.:format)      movies#new
GET    /movies/:id/edit(.:format) movies#edit
GET    /movies/:id(.:format)      movies#show
PATCH  /movies/:id(.:format)      movies#update
PUT    /movies/:id(.:format)      movies#update
DELETE /movies/:id(.:format)      movies#destroy
```

This is indeed one of the core principles of REST, which will provide you with the reliable interface that right away gives you all the necessary info.

[Github’s API](https://developer.github.com/v3/ "github api") is a great example of RESTful API and it is extensively using the HATEOAS constraint. If you access `https://api.github.com/users/your-github-username`, you will get comprehensive details of all the actions and info about a specific user.

Let's check out Octocat's details:

```json
{
  "login": "octocat",
  "id": 583231,
  "node_id": "MDQ6VXNlcjU4MzIzMQ==",
  "avatar_url": "https://avatars3.githubusercontent.com/u/583231?v=4",
  "gravatar_id": "",
  "url": "https://api.github.com/users/octocat",
  "html_url": "https://github.com/octocat",
  "followers_url": "https://api.github.com/users/octocat/followers",
  "following_url": "https://api.github.com/users/octocat/following{/other_user}",
  "gists_url": "https://api.github.com/users/octocat/gists{/gist_id}",
  "starred_url": "https://api.github.com/users/octocat/starred{/owner}{/repo}",
  "subscriptions_url": "https://api.github.com/users/octocat/subscriptions",
  "organizations_url": "https://api.github.com/users/octocat/orgs",
  "repos_url": "https://api.github.com/users/octocat/repos",
  "events_url": "https://api.github.com/users/octocat/events{/privacy}",
  "received_events_url": "https://api.github.com/users/octocat/received_events",
  "type": "User",
  "site_admin": false,
  "name": "The Octocat",
  "company": "GitHub",
  "blog": "http://www.github.com/blog",
  "location": "San Francisco",
  "email": null,
  "hireable": null,
  "bio": null,
  "public_repos": 8,
  "public_gists": 8,
  "followers": 2356,
  "following": 9,
  "created_at": "2011-01-25T18:44:36Z",
  "updated_at": "2018-08-27T04:11:15Z"
}
```

Cool, isn’t it?

##### How can we do the same in Rails?

We can achieve the similar results with the help of [Rails serialization](https://api.rubyonrails.org/classes/ActiveModel/Serialization.html "rails serialization"). It will give us necessary tools to choose what exact fields (and their combinations) do we want to return to client.

First, add serialization gem to your `Gemfile`:

```ruby
gem 'active_model_serializers'
```

and after that run `bundle install` from your terminal.

Then generate specific movie and comment serializers by running the following commands:

```bash
=> rails g serializer Movie
  create  app/serializers/movie_serializer.rb
=> rails g serializer Comment
  create  app/serializers/comment_serializer.rb
```
This will generate a new `serializer` folder under the `/app` directory and create 2 new files for us.

Now let’s decide how do we want to handle data. The movie table has the following fields:

```bash
=> Movie(id: integer, name: string, director: string, release: date, created_at: datetime, updated_at: datetime)
```

I do not really want to send `id`, `updated_at` and `created_at` to client, so I can leave them out by specifying what fields to serialize:

```ruby
class MovieSerializer < ActiveModel::Serializer
  attributes :name, :director, :release
end
```

If you now go to `http://localhost:3000/movies`, you will see that all extra fields are removed and left only those that I specified in attributes:

```json
[
  {
    "name": "Halloween",
    "director": "John Carpenter",
    "release_date": "1978-10-25"
  },
  {
    "name": "It follows",
    "director": "David Robert Mitchell",
    "release_date": "2015-03-27"
  },
  ...
]
```

Great, next you can also specify what ActiveRecord associations does this model have and serialize them as well. Add `has_many :comments` to `movie_serializer.rb` and check out how the result changed:

```json
[
  {
    "name": "Halloween",
    "director": "John Carpenter",
    "release_date": "1978-10-25",
    "comments": [
      {
        "id": 1,
        "body": "Frankly, my dear, I don’t give a damn."
      },
      {
        "id": 2,
        "body": "I love the smell of napalm in the morning."
      }
    ]
  },
  ...
]
```

Now we are one step closer to implementing the HATEOAS constraint. The final thing we need to do is to show all the movie related links. Create a new `links` method which should look like this:

```ruby
  def links
    {
      href: movie_path(object.id)
    }
  end
```
Add it to movie attributes:

```ruby
attributes :name, :director, :release, :links
```

Finally, include `Rails.application.routes.url_helpers` in `movie_serializer.rb` so that you have the access to `movie_path`, otherwise, Rails will trow you an **undefined method 'movie_path'** error.

Reload `http://localhost:3000/movies` and voila:

```json
[
  {
    "name": "Halloween",
    "director": "John Carpenter",
    "release_date": "1978-10-25",
    "links": {
      "href": "/movies/1"
    },
    "comments": [
      {
        "id": 1,
        "body": "Frankly, my dear, I don’t give a damn."
      },
      {
        "id": 2,
        "body": "I love the smell of napalm in the morning."
      }
    ]
  }
]
```

Repeat the same steps for comment's serializer. Eventually it should look similar to:

```ruby
class CommentSerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers

  attributes :id, :body, :links

  def links
    {
      href: movie_comment_path(object.movie.id, object.id)
    }
  end
end
```

Reload the browser's page one more time and you should finally see a resource compliant with HATEOAS constraint 😎

```json
[
  {
    "name": "Halloween",
    "director": "John Carpenter",
    "release_date": "1978-10-25",
    "links": {
      "href": "/movies/1"
    },
    "comments": [
      {
        "id": 1,
        "body": "Frankly, my dear, I don’t give a damn.",
        "links": {
          "href": "/movies/1/comments/1"
        }
      },
      {
        "id": 2,
        "body": "I love the smell of napalm in the morning.",
        "links": {
          "href": "/movies/1/comments/2"
        }
      }
    ]
  }
]
```

If you think of it in terms of any webpage, this constraint is already implemented there. If you open, let’s say, Pinterest, you already know where to click to see a specific pin, how to create or delete a board, etc. You don’t need to remember specific URIs and parameters, you just need to know the website’s domain name and that’s pretty much it. However, when it comes to Web APIs HATEOAS is the least met RESTful constraint.

## Layered System

Layered system constraint is the last mandatory one, which is build on the client/server constraint. Its architecture tells that you can authenticate requests on server 1, store data on server 2, do whatever other actions on servers 3, 4, etc. The bottom line is that client does not care how many intermediate layers are on its way to actual data it needs to retrieve. Client needs to communicate with the layer it is exposed to and all that happens below is of no concern for a client. This way you encapsulate your logic and make it less exposed and, thus, more secure.

For example, you can have a proxy layer that will receive a request and then forward it to a server where you can make a payment or to another one where you just retrieve info about your credit card. Either there can be additional caching layer or the one that communicates with a legacy application.

### Final thoughts

It is important to remember that REST does not tell you what protocol to use and how to implement any of these constraints on a low level. The REST architectural approach leaves a lot of space for a you to engineer your own solutions and choose those that work best for your specific end goals.

I personally realized that my APIs were pretty far away from being RESTful. Especially when you understand that you need to follow all the constraints because all of them all mandatory and you cannot miss one and yet call your service RESTful. There is so much space for improvement. But im my opinion that's good, it motivates you to learn things and get better at what you are doing.

So are YOU up to building a really RESTful API?
