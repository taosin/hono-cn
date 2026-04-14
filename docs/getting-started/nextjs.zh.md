# Next.js

Next.js 是一个灵活的 React 框架，为你提供构建快速 web 应用程序的构建块。

当使用 Node.js runtime 时，你可以在 Next.js 上运行 Hono。在 Vercel 上，使用 Vercel Functions 可以轻松部署带有 Hono 的 Next.js。

## 1. Setup

Next.js 有一个 starter。使用 "create-hono" 命令开始你的项目。为此示例选择 `nextjs` template。

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

进入 `my-app` 并安装依赖项。

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

## 2. Hello World

如果你使用 App Router，编辑 `app/api/[[...route]]/route.ts`。更多信息参考 [Supported HTTP Methods](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#supported-http-methods) 部分。

```ts
import { Hono } from 'hono'
import { handle } from 'hono/vercel'

const app = new Hono().basePath('/api')

app.get('/hello', (c) => {
  return c.json({
    message: 'Hello Next.js!',
  })
})

export const GET = handle(app)
export const POST = handle(app)
```

## 3. Run

在本地运行开发服务器。然后在 Web 浏览器中访问 `http://localhost:3000`。

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

现在，`/api/hello` 只返回 JSON，但如果你构建 React UIs，你可以用 Hono 创建全栈应用程序。

## 4. Deploy

如果你有 Vercel 账户，你可以通过链接 Git 仓库进行部署。

## Pages Router

如果你使用 Pages Router，你需要首先安装 Node.js adapter。

::: code-group

```sh [npm]
npm i @hono/node-server
```

```sh [yarn]
yarn add @hono/node-server
```

```sh [pnpm]
pnpm add @hono/node-server
```

```sh [bun]
bun add @hono/node-server
```

:::

然后，你可以在 `pages/api/[[...route]].ts` 中使用从 `@hono/node-server/vercel` 导入的 `handle` 函数。

```ts
import { Hono } from 'hono'
import { handle } from '@hono/node-server/vercel'
import type { PageConfig } from 'next'

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
}

const app = new Hono().basePath('/api')

app.get('/hello', (c) => {
  return c.json({
    message: 'Hello Next.js!',
  })
})

export default handle(app)
```

为了使其与 Pages Router 一起工作，重要的是通过在你的项目 dashboard 或 `.env` 文件中设置环境变量来禁用 Vercel Node.js helpers。

```text
NODEJS_HELPERS=0
```
