# Adapter Helper

Adapter Helper 提供了一种通过统一接口与各种平台交互的无缝方式。

## Import

```ts
import { Hono } from 'hono'
import { env, getRuntimeKey } from 'hono/adapter'
```

## `env()`

`env()` 函数有助于在不同的 runtimes 中检索环境变量，不仅限于 Cloudflare Workers 的 Bindings。可以使用 `env(c)` 检索的值因 runtimes 而异。

```ts
import { env } from 'hono/adapter'

app.get('/env', (c) => {
  // NAME 在 Node.js 或 Bun 上是 process.env.NAME
  // NAME 在 Cloudflare 上是 `wrangler.toml` 中写入的值
  const { NAME } = env<{ NAME: string }>(c)
  return c.text(NAME)
})
```

支持的 Runtimes、Serverless Platforms 和 Cloud Services：

- Cloudflare Workers
  - `wrangler.toml`
  - `wrangler.jsonc`
- Deno
  - [`Deno.env`](https://docs.deno.com/runtime/manual/basics/env_variables)
  - `.env` file
- Bun
  - [`Bun.env`](https://bun.com/guides/runtime/set-env)
  - `process.env`
- Node.js
  - `process.env`
- Vercel
  - [Environment Variables on Vercel](https://vercel.com/docs/projects/environment-variables)
- AWS Lambda
  - [Environment Variables on AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/samples-blank.html#samples-blank-architecture)
- Lambda@Edge\
  Lambda 上的环境变量 [不支持](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/add-origin-custom-headers.html) Lambda@Edge，你需要使用 [Lambda@Edge event](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-event-structure.html) 作为替代。
- Fastly Compute\
  在 Fastly Compute 上，你可以使用 ConfigStore 来管理用户定义的数据。
- Netlify\
  在 Netlify 上，你可以使用 [Netlify Contexts](https://docs.netlify.com/site-deploys/overview/#deploy-contexts) 来管理用户定义的数据。

### Specify the runtime

你可以通过将 runtime key 作为第二个参数传递来指定 runtime 以获取环境变量。

```ts
app.get('/env', (c) => {
  const { NAME } = env<{ NAME: string }>(c, 'workerd')
  return c.text(NAME)
})
```

## `getRuntimeKey()`

`getRuntimeKey()` 函数返回当前 runtime 的标识符。

```ts
app.get('/', (c) => {
  if (getRuntimeKey() === 'workerd') {
    return c.text('You are on Cloudflare')
  } else if (getRuntimeKey() === 'bun') {
    return c.text('You are on Bun')
  }
  ...
})
```

### Available Runtimes Keys

以下是可用的 runtimes keys，不可用的 runtime key runtimes 可能被支持并标记为 `other`，其中一些受到 [WinterCG's Runtime Keys](https://runtime-keys.proposal.wintercg.org/) 的启发：

- `workerd` - Cloudflare Workers
- `deno`
- `bun`
- `node`
- `edge-light` - Vercel Edge Functions
- `fastly` - Fastly Compute
- `other` - 其他未知 runtimes keys
