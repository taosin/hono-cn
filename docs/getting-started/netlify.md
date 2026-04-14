# Netlify

Netlify 提供静态站点托管和无服务器后端服务。[Edge Functions](https://docs.netlify.com/edge-functions/overview/) 使我们能够使网页动态化。

Edge Functions 支持用 Deno 和 TypeScript 编写，通过 [Netlify CLI](https://docs.netlify.com/cli/get-started/) 轻松完成部署。使用 Hono，你可以为 Netlify Edge Functions 创建应用程序。

## 1. Setup

Netlify 有一个 starter。使用 "create-hono" 命令开始你的项目。为此示例选择 `netlify` template。

::: code-group

```sh [npm]
npm create hono@latest my-app
```

```sh [yarn]
yarn create hono my-app
```

```sh [pnpm]
pnpm create hono my-app
```

```sh [bun]
bun create hono@latest my-app
```

```sh [deno]
deno init --npm hono my-app
```

:::

进入 `my-app`。

## 2. Hello World

编辑 `netlify/edge-functions/index.ts`：

```ts
import { Hono } from 'jsr:@hono/hono'
import { handle } from 'jsr:@hono/hono/netlify'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default handle(app)
```

## 3. Run

使用 Netlify CLI 运行开发服务器。然后在 Web 浏览器中访问 `http://localhost:8888`。

```sh
netlify dev
```

## 4. Deploy

你可以使用 `netlify deploy` 命令部署。

```sh
netlify deploy --prod
```

## `Context`

你可以通过 `c.env` 访问 Netlify 的 `Context`：

```ts
import { Hono } from 'jsr:@hono/hono'
import { handle } from 'jsr:@hono/hono/netlify'

// 导入类型定义
import type { Context } from 'https://edge.netlify.com/'

export type Env = {
  Bindings: {
    context: Context
  }
}

const app = new Hono<Env>()

app.get('/country', (c) =>
  c.json({
    'You are in': c.env.context.geo.country?.name,
  })
)

export default handle(app)
```
