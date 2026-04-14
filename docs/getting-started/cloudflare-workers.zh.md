# Cloudflare Workers

[Cloudflare Workers](https://workers.cloudflare.com) 是 Cloudflare CDN 上的 JavaScript edge runtime。

你可以使用 [Wrangler](https://developers.cloudflare.com/workers/wrangler/) 在本地开发应用程序并通过几个命令发布它。Wrangler 包含转译器，所以我们可以用 TypeScript 编写代码。

让我们用 Hono 创建你的第一个 Cloudflare Workers 应用程序。

## 1. Setup

Cloudflare Workers 有一个 starter。使用 "create-hono" 命令开始你的项目。为此示例选择 `cloudflare-workers` template。

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

编辑 `src/index.ts` 如下。

```ts
import { Hono } from 'hono'
const app = new Hono()

app.get('/', (c) => c.text('Hello Cloudflare Workers!'))

export default app
```

## 3. Run

在本地运行开发服务器。然后在 Web 浏览器中访问 `http://localhost:8787`。

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

### Change port number

如果你需要更改端口号，可以按照此处的说明更新 `wrangler.toml` / `wrangler.json` / `wrangler.jsonc` 文件：[Wrangler Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/#local-development-settings)

或者，你可以按照此处的说明设置 CLI 选项：[Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/commands/#dev)

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

就是这样！

## Using Hono with other event handlers

你可以在 _Module Worker mode_ 中将 Hono 与其他事件处理器（如 `scheduled`）集成。

为此，将 `app.fetch` 导出为模块的 `fetch` 处理器，然后根据需求实现其他处理器：

```ts
const app = new Hono()

export default {
  fetch: app.fetch,
  scheduled: async (batch, env) => {},
}
```

## Serve static files

如果你想提供静态文件，可以使用 Cloudflare Workers 的 [Static Assets feature](https://developers.cloudflare.com/workers/static-assets/)。在 `wrangler.toml` 中指定文件的目录：

```toml
assets = { directory = "public" }
```

然后创建 `public` 目录并将文件放在那里。例如，`./public/static/hello.txt` 将作为 `/static/hello.txt` 提供。

```
.
├── package.json
├── public
│   ├── favicon.ico
│   └── static
│       └── hello.txt
├── src
│   └── index.ts
└── wrangler.toml
```

## Types

如果你想要 workers 类型，你必须安装 `@cloudflare/workers-types`。

::: code-group

```sh [npm]
npm i --save-dev @cloudflare/workers-types
```

```sh [yarn]
yarn add -D @cloudflare/workers-types
```

```sh [pnpm]
pnpm add -D @cloudflare/workers-types
```

```sh [bun]
bun add --dev @cloudflare/workers-types
```

:::

## Testing

对于测试，我们推荐使用 `@cloudflare/vitest-pool-workers`。参考 [examples](https://github.com/honojs/examples) 进行设置。

如果有下面的应用程序。

```ts
import { Hono } from 'hono'

const app = new Hono()
app.get('/', (c) => c.text('Please test me!'))
```

我们可以测试它是否返回 "_200 OK_" Response。

```ts
describe('Test the application', () => {
  it('Should return 200 response', async () => {
    const res = await app.request('http://localhost/')
    expect(res.status).toBe(200)
  })
})
```

## Bindings

在 Cloudflare Workers 中，我们可以绑定环境变量、KV namespace、R2 bucket 或 Durable Object。你可以在 `c.env` 中访问它们。如果你将 bindings 的"_类型定义_"作为泛型传递给 `Hono`，它将具有类型。

```ts
type Bindings = {
  MY_BUCKET: R2Bucket
  USERNAME: string
  PASSWORD: string
}

const app = new Hono<{ Bindings: Bindings }>()

// 访问环境值
app.put('/upload/:key', async (c, next) => {
  const key = c.req.param('key')
  await c.env.MY_BUCKET.put(key, c.req.body)
  return c.text(`Put ${key} successfully!`)
})
```

## Using Variables in Middleware

这仅适用于 Module Worker mode。如果你想在中间件中使用 Variables 或 Secret Variables，例如 Basic Authentication Middleware 中的 "username" 或 "password"，你需要这样写：

```ts
import { basicAuth } from 'hono/basic-auth'

type Bindings = {
  USERNAME: string
  PASSWORD: string
}

const app = new Hono<{ Bindings: Bindings }>()

//...

app.use('/auth/*', async (c, next) => {
  const auth = basicAuth({
    username: c.env.USERNAME,
    password: c.env.PASSWORD,
  })
  return auth(c, next)
})
```

同样的方法适用于 Bearer Authentication Middleware、JWT Authentication 等。

## Deploy from GitHub Actions

在通过 CI 部署代码到 Cloudflare 之前，你需要一个 Cloudflare token。你可以从 [User API Tokens](https://dash.cloudflare.com/profile/api-tokens) 管理它。

如果是新创建的 token，选择 **Edit Cloudflare Workers** template。如果你已经有另一个 token，请确保 token 具有相应的权限。（注意：token 权限在 Cloudflare Pages 和 Cloudflare Workers 之间不共享）。

然后进入你的 GitHub 仓库设置 dashboard：`Settings->Secrets and variables->Actions->Repository secrets`，并添加一个名为 `CLOUDFLARE_API_TOKEN` 的新 secret。

然后在你的 Hono 项目根文件夹中创建 `.github/workflows/deploy.yml`，粘贴以下代码：

```yml
name: Deploy

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - uses: actions/checkout@v4
      - name: Deploy
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

然后编辑 `wrangler.toml`，在 `compatibility_date` 行后添加此代码。

```toml
main = "src/index.ts"
minify = true
```

一切都准备好了！现在推送代码并享受它。

## Load env when local development

要配置本地开发的环境变量，在项目根目录创建 `.dev.vars` 文件或 `.env` 文件。这些文件应使用 [dotenv](https://hexdocs.pm/dotenvy/dotenv-file-format.html) 语法格式化。例如：

```
SECRET_KEY=value
API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

> 有关此部分的更多信息，你可以在 Cloudflare 文档中找到：https://developers.cloudflare.com/workers/wrangler/configuration/#secrets

然后我们使用 `c.env.*` 在代码中获取环境变量。

::: info
默认情况下，`process.env` 在 Cloudflare Workers 中不可用，因此建议从 `c.env` 获取环境变量。如果你想使用它，你需要启用 [`nodejs_compat_populate_process_env`](https://developers.cloudflare.com/workers/configuration/compatibility-flags/#enable-auto-populating-processenv) 标志。你也可以从 `cloudflare:workers` 导入 `env`。详细信息请查看 [How to access `env` on Cloudflare docs](https://developers.cloudflare.com/workers/runtime-apis/bindings/#how-to-access-env)
:::

```ts
type Bindings = {
  SECRET_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/env', (c) => {
  const SECRET_KEY = c.env.SECRET_KEY
  return c.text(SECRET_KEY)
})
```

在将项目部署到 Cloudflare 之前，记得在 Cloudflare Workers 项目的配置中设置环境变量/secrets。

> 有关此部分的更多信息，你可以在 Cloudflare 文档中找到：https://developers.cloudflare.com/workers/configuration/environment-variables/#add-environment-variables-via-the-dashboard
