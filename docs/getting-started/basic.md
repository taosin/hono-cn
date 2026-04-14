# Getting Started

使用 Hono 非常简单。我们可以设置项目、编写代码、在本地服务器上开发并快速部署。相同的代码可以在任何 runtime 上运行，只是入口点不同。让我们看看 Hono 的基本用法。

## Starter

每个平台都有可用的 Starter templates。使用以下 "create-hono" 命令。

::: code-group

```sh [npm]
npm create hono@latest my-app
```

```sh [yarn]
yarn create hono my-app
```

```sh [pnpm]
pnpm create hono@latest my-app
```

```sh [bun]
bun create hono@latest my-app
```

```sh [deno]
deno init --npm hono@latest my-app
```

:::

然后你会被问到想要使用哪个 template。让我们选择 Cloudflare Workers 作为示例。

```
? Which template do you want to use?
    aws-lambda
    bun
    cloudflare-pages
❯   cloudflare-workers
    deno
    fastly
    nextjs
    nodejs
    vercel
```

template 将被拉取到 `my-app` 中，所以进入其中并安装依赖项。

::: code-group

```sh [npm]
cd my-app
npm i
```

```sh [yarn]
cd my-app
yarn
```

```sh [pnpm]
cd my-app
pnpm i
```

```sh [bun]
cd my-app
bun i
```

:::

包安装完成后，运行以下命令启动本地服务器。

::: code-group

```sh [npm]
npm run dev
```

```sh [yarn]
yarn dev
```

```sh [pnpm]
pnpm dev
```

```sh [bun]
bun run dev
```

:::

## Hello World

你可以使用 TypeScript 编写代码，通过 Cloudflare Workers 开发工具 "Wrangler"、Deno、Bun 等，无需考虑转译。

在 `src/index.ts` 中编写你的第一个应用程序。下面的示例是一个入门级 Hono 应用程序。

`import` 和最后的 `export default` 部分可能因 runtime 而异，但所有应用程序代码都将在任何地方运行相同的代码。

```ts
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
```

启动开发服务器并在浏览器中访问 `http://localhost:8787`。

::: code-group

```sh [npm]
npm run dev
```

```sh [yarn]
yarn dev
```

```sh [pnpm]
pnpm dev
```

```sh [bun]
bun run dev
```

:::

## Return JSON

返回 JSON 也很容易。以下是处理对 `/api/hello` 的 GET 请求并返回 `application/json` 响应的示例。

```ts
app.get('/api/hello', (c) => {
  return c.json({
    ok: true,
    message: 'Hello Hono!',
  })
})
```

## Request and Response

获取路径参数、URL 查询值和附加响应 header 的写法如下。

```ts
app.get('/posts/:id', (c) => {
  const page = c.req.query('page')
  const id = c.req.param('id')
  c.header('X-Message', 'Hi!')
  return c.text(`You want to see ${page} of ${id}`)
})
```

我们可以轻松处理 POST、PUT 和 DELETE，不仅是 GET。

```ts
app.post('/posts', (c) => c.text('Created!', 201))
app.delete('/posts/:id', (c) =>
  c.text(`${c.req.param('id')} is deleted!`)
)
```

## Return HTML

你可以使用 [html Helper](/docs/helpers/html) 或使用 [JSX](/docs/guides/jsx) 语法编写 HTML。如果你想使用 JSX，将文件重命名为 `src/index.tsx` 并配置它（具体取决于每个 runtime）。以下是使用 JSX 的示例。

```tsx
const View = () => {
  return (
    <html>
      <body>
        <h1>Hello Hono!</h1>
      </body>
    </html>
  )
}

app.get('/page', (c) => {
  return c.html(<View />)
})
```

## Return raw Response

你也可以返回原始 [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)。

```ts
app.get('/', () => {
  return new Response('Good morning!')
})
```

## Using Middleware

Middleware 可以为你完成艰巨的工作。例如，添加 Basic Authentication。

```ts
import { basicAuth } from 'hono/basic-auth'

// ...

app.use(
  '/admin/*',
  basicAuth({
    username: 'admin',
    password: 'secret',
  })
)

app.get('/admin', (c) => {
  return c.text('You are authorized!')
})
```

有有用的内置中间件，包括 Bearer 和使用 JWT 的身份验证、CORS 和 ETag。Hono 还提供使用外部库（如 GraphQL Server 和 Firebase Auth）的第三方中间件。而且，你可以创建自己的中间件。

## Adapter

有适用于平台特定功能的 Adapters，例如处理静态文件或 WebSocket。例如，要在 Cloudflare Workers 中处理 WebSocket，导入 `hono/cloudflare-workers`。

```ts
import { upgradeWebSocket } from 'hono/cloudflare-workers'

app.get(
  '/ws',
  upgradeWebSocket((c) => {
    // ...
  })
)
```

## Next step

大多数代码可以在任何平台上运行，但每个平台都有指南。例如，如何设置项目或如何部署。请查看你想要用于创建应用程序的确切平台页面！
