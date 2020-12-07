---
title: Adding Staging Environment to Phoenix App
description: When you create a new phoenix app, it will come with 3 default environments, such as dev, test, and prod, where prod will be any instance of your deployed app. So we've been trying different solutions with the team on how to add a staging environment, and finally, we came up with the implementation below.
date: "2020-12-07"
tags: [phoenix, elixir, staging]
draft: false
path: "/blog/phoenix-staging-env"
---

When you create a new Phoenix app, it will come with 3 default environments for development, test, and production, where production will be any instance of your deployed app. So we've been trying different solutions with the team to add a staging environment, but eventually, we decided to go for the implementation below. It was suggested by one of my colleagues, thank you [Sjors](https://nl.linkedin.com/in/sjors-baltus-7417473a) 🙏

## Redefine MIX_ENV 😱

The first step will be to redefine `MIX_ENV` variable. This step will be different for everyone depending on the deployment infrastructure you are having. You will have to make sure to assign `MIX_ENV` to staging.

### Heroku example

Let's take Heroku as an example.

- By following [this guide](https://hexdocs.pm/phoenix/heroku.html) you can find out how to deploy your Phoenix app with Heroku.

- [This guide](https://devcenter.heroku.com/articles/multiple-environments) will help you with creating a staging environment.

- Finally, [this guide](https://devcenter.heroku.com/articles/config-vars) will walk you through the steps you need to take to add environment variables.

I believe, in the end, you will have something similar to:

```bash
heroku config:set MIX_ENV=staging --remote staging
```

The next steps should take place in your Phoenix app.

## Create staging config

Start by creating a `staging.exs` config file and potentially add there all the custom staging configuration you have.

This will be the bare minimum of the file:


```elixir
# config/staging.exs

use Mix.Config

config :my_app, MyApp,
  url: [host: "example.com", port: 80],
  cache_static_manifest: "priv/static/cache_manifest.json"

config :logger, level: :info

import_config "prod.secret.exs"
```

Then, you will need to specify that you want to start your app in a permanent mode for staging env as well; you can do it in `mix.exs` file.

```elixir
# mix.exs

def project do
  [
    # NOTE: the rest of code is skipped
    start_permanent: Mix.env() == :prod or Mix.env() == :staging,
  ]
end
```

### Testing

To test it, you can output the following line anywhere in your views:

```elixir
<%= "Current env is: #{Mix.env()}" %>
```
