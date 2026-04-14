# Cloudflare Pages

[Cloudflare Pages](https://pages.cloudflare.com) 是一个用于全栈 web 应用程序的边缘平台。它提供静态文件和由 Cloudflare Workers 提供的动态内容。

Hono 完全支持 Cloudflare Pages。它引入了令人愉快的开发体验。Vite 的 dev server 很快，使用 Wrangler 部署非常快速。

## 1. Setup

Cloudflare Pages 有一个 starter。使用 "create-hono" 命令开始你的项目。为此示例选择 `cloudflare-pages` template。

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

以下是基本目录结构。

```text
./
├── package.json
├── public
│   └── static // 放置你的静态文件。
│       └── style.css // 你可以通过 `/static/style.css` 访问它。
├── src
│   ├── index.tsx // 服务器端的入口点。
│   └── renderer.tsx
├── tsconfig.json
└── vite.config.ts
```

## 2. Hello World

编辑 `src/index.tsx` 如下：

```tsx
import { Hono } from 'hono'
import { renderer } from './renderer'

const app = new Hono()

app.get('*', renderer)

app.get('/', (c) => {
  return c.render(<h1>Hello, Cloudflare Pages!</h1>)
})

export default app
```

## 3. Run

在本地运行开发服务器。然后在 Web 浏览器中访问 `http://localhost:5173`。

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

## 4. Deploy

如果你有 Cloudflare 账户，可以部署到 Cloudflare。在 `package.json` 中，`$npm_execpath` 需要更改为你选择的包管理器。

::: code-group

```sh [npm]
npm run deploy
```

```sh [yarn]
yarn deploy
```

```sh [pnpm]
pnpm run deploy
```

```sh [bun]
bun run deploy
```

:::

### Deploy via the Cloudflare dashboard with GitHub

1. 登录 [Cloudflare dashboard](https://dash.cloudflare.com) 并选择你的账户。
2. 在 Account Home 中，选择 Workers & Pages > Create application > Pages > Connect to Git。
3. 授权你的 GitHub 账户，并选择仓库。在 Set up builds and deployments 中，提供以下信息：

| Configuration option | Value           |
| -------------------- | --------------- |
| Production branch    | `main`          |
| Build command        | `npm run build` |
| Build directory      | `dist`          |

## Bindings

你可以使用 Cloudflare Bindings，如 Variables、KV、D1 等。在本节中，让我们使用 Variables 和 KV。

### Create `wrangler.toml`

首先，为本地 Bindings 创建 `wrangler.toml`：

```sh
touch wrangler.toml
```

编辑 `wrangler.toml`。使用名称 `MY_NAME` 指定 Variable。

```toml
[vars]
MY_NAME = "Hono"
```

### Create KV

接下来，创建 KV。运行以下 `wrangler` 命令：

```sh
wrangler kv namespace create MY_KV --preview
```

记下 `preview_id`，如下输出：

```
{ binding = "MY_KV", preview_id = "abcdef" }
```

使用 Bindings 的名称 `MY_KV` 指定 `preview_id`：

```toml
[[kv_namespaces]]
binding = "MY_KV"
id = "abcdef"
```

### Edit `vite.config.ts`

编辑 `vite.config.ts`：

```ts
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import build from '@hono/vite-cloudflare-pages'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    devServer({
      entry: 'src/index.tsx',
      adapter, // Cloudflare Adapter
    }),
    build(),
  ],
})
```

### Use Bindings in your application

在你的应用程序中使用 Variable 和 KV。设置类型。

```ts
type Bindings = {
  MY_NAME: string
  MY_KV: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()
```

使用它们：

```tsx
app.get('/', async (c) => {
  await c.env.MY_KV.put('name', c.env.MY_NAME)
  const name = await c.env.MY_KV.get('name')
  return c.render(<h1>Hello! {name}</h1>)
})
```

### In production

对于 Cloudflare Pages，你将使用 `wrangler.toml` 进行本地开发，但对于生产环境，你将在 dashboard 中设置 Bindings。

## Client-side

你可以使用 Vite 的功能编写客户端脚本并将其导入到应用程序中。如果 `/src/client.ts` 是客户端的入口点，只需在 script 标签中编写它。此外，`import.meta.env.PROD` 对于检测是在 dev server 上运行还是在构建阶段很有用。

```tsx
app.get('/', (c) => {
  return c.html(
    <html>
      <head>
        {import.meta.env.PROD ? (
          <script type='module' src='/static/client.js'></script>
        ) : (
          <script type='module' src='/src/client.ts'></script>
        )}
      </head>
      <body>
        <h1>Hello</h1>
      </body>
    </html>
  )
})
```

为了正确构建脚本，你可以使用以下示例配置文件 `vite.config.ts`。

```ts
import pages from '@hono/vite-cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      build: {
        rollupOptions: {
          input: './src/client.ts',
          output: {
            entryFileNames: 'static/client.js',
          },
        },
      },
    }
  } else {
    return {
      plugins: [
        pages(),
        devServer({
          entry: 'src/index.tsx',
        }),
      ],
    }
  }
})
```

你可以运行以下命令来构建服务器和客户端脚本。

```sh
vite build --mode client && vite build
```

## Cloudflare Pages Middleware

Cloudflare Pages 使用自己的 [middleware](https://developers.cloudflare.com/pages/functions/middleware/) 系统，与 Hono 的中间件不同。你可以通过在名为 `_middleware.ts` 的文件中导出 `onRequest` 来启用它，如下所示：

```ts
// functions/_middleware.ts
export async function onRequest(pagesContext) {
  console.log(`You are accessing ${pagesContext.request.url}`)
  return await pagesContext.next()
}
```

使用 `handleMiddleware`，你可以将 Hono 的中间件用作 Cloudflare Pages 中间件。

```ts
// functions/_middleware.ts
import { handleMiddleware } from 'hono/cloudflare-pages'

export const onRequest = handleMiddleware(async (c, next) => {
  console.log(`You are accessing ${c.req.url}`)
  await next()
})
```

你也可以使用 Hono 的内置和第三方中间件。例如，要添加 Basic Authentication，你可以使用 [Hono's Basic Authentication Middleware](/docs/middleware/builtin/basic-auth)。

```ts
// functions/_middleware.ts
import { handleMiddleware } from 'hono/cloudflare-pages'
import { basicAuth } from 'hono/basic-auth'

export const onRequest = handleMiddleware(
  basicAuth({
    username: 'hono',
    password: 'acoolproject',
  })
)
```

如果你想应用多个中间件，可以这样写：

```ts
import { handleMiddleware } from 'hono/cloudflare-pages'

// ...

export const onRequest = [
  handleMiddleware(middleware1),
  handleMiddleware(middleware2),
  handleMiddleware(middleware3),
]
```

### Accessing `EventContext`

你可以通过 `handleMiddleware` 中的 `c.env` 访问 [`EventContext`](https://developers.cloudflare.com/pages/functions/api-reference/#eventcontext) 对象。

```ts
// functions/_middleware.ts
import { handleMiddleware } from 'hono/cloudflare-pages'

export const onRequest = [
  handleMiddleware(async (c, next) => {
    c.env.eventContext.data.user = 'Joe'
    await next()
  }),
]
```

然后，你可以通过处理器中的 `c.env.eventContext` 访问数据值：

```ts
// functions/api/[[route]].ts
import type { EventContext } from 'hono/cloudflare-pages'
import { handle } from 'hono/cloudflare-pages'

// ...

type Env = {
  Bindings: {
    eventContext: EventContext
  }
}

const app = new Hono<Env>().basePath('/api')

app.get('/hello', (c) => {
  return c.json({
    message: `Hello, ${c.env.eventContext.data.user}!`, // 'Joe'
  })
})

export const onRequest = handle(app)
```
