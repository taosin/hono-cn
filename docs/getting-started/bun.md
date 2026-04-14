# Bun

[Bun](https://bun.com) 是另一个 JavaScript runtime。它不是 Node.js 或 Deno。Bun 包含一个转译器，我们可以用 TypeScript 编写代码。Hono 也可以在 Bun 上运行。

## 1. Install Bun

要安装 `bun` 命令，请遵循 [官方网站](https://bun.com) 的说明。

## 2. Setup

### 2.1. Setup a new project

Bun 有一个 starter。使用 "bun create" 命令开始你的项目。为此示例选择 `bun` template。

```sh
bun create hono@latest my-app
```

进入 my-app 并安装依赖项。

```sh
cd my-app
bun install
```

### 2.2. Setup an existing project

在现有的 Bun 项目中，我们只需要通过以下命令在项目根目录安装 `hono` 依赖项：

```sh
bun add hono
```

然后将 `dev` 命令添加到现有的 `package.json` 中。

```json
{
  "scripts": {
    "dev": "bun run --hot src/index.ts"
  }
}
```

查看 [Bun starter template](https://github.com/honojs/starter/tree/main/templates/bun) 获取最小示例设置。这是运行 `bun create hono@latest` 的输出。

## 3. Hello World

"Hello World" 脚本如下。几乎与在其他平台上编写相同。

```ts
import { Hono } from 'hono'

const app = new Hono()
app.get('/', (c) => c.text('Hello Bun!'))

export default app
```

如果你在现有项目上设置 Hono，`bun run dev` 命令期望 "Hello World" 脚本放在 `src/index.tx` 中。

## 4. Run

运行命令。

```sh
bun run dev
```

然后，在浏览器中访问 `http://localhost:3000`。

## Change port number

你可以通过导出 `port` 来指定端口号。

<!-- prettier-ignore -->
```ts
import { Hono } from 'hono'

const app = new Hono()
app.get('/', (c) => c.text('Hello Bun!'))

export default app // [!code --]
export default { // [!code ++]
  port: 3000, // [!code ++]
  fetch: app.fetch, // [!code ++]
} // [!code ++]
```

## Serve static files

要提供静态文件，使用从 `hono/bun` 导入的 `serveStatic`。

```ts
import { serveStatic } from 'hono/bun'

const app = new Hono()

app.use('/static/*', serveStatic({ root: './' }))
app.use('/favicon.ico', serveStatic({ path: './favicon.ico' }))
app.get('/', (c) => c.text('You can access: /static/hello.txt'))
app.get('*', serveStatic({ path: './static/fallback.txt' }))
```

对于上面的代码，它将适用于以下目录结构。

```
./
├── favicon.ico
├── src
└── static
    ├── demo
    │   └── index.html
    ├── fallback.txt
    ├── hello.txt
    └── images
        └── dinotocat.png
```

### `rewriteRequestPath`

如果你想将 `http://localhost:3000/static/*` 映射到 `./statics`，可以使用 `rewriteRequestPath` 选项：

```ts
app.get(
  '/static/*',
  serveStatic({
    root: './',
    rewriteRequestPath: (path) =>
      path.replace(/^\/static/, '/statics'),
  })
)
```

### `mimes`

你可以使用 `mimes` 添加 MIME 类型：

```ts
app.get(
  '/static/*',
  serveStatic({
    mimes: {
      m3u8: 'application/vnd.apple.mpegurl',
      ts: 'video/mp2t',
    },
  })
)
```

### `onFound`

你可以使用 `onFound` 指定找到请求文件时的处理：

```ts
app.get(
  '/static/*',
  serveStatic({
    // ...
    onFound: (_path, c) => {
      c.header('Cache-Control', `public, immutable, max-age=31536000`)
    },
  })
)
```

### `onNotFound`

你可以使用 `onNotFound` 指定未找到请求文件时的处理：

```ts
app.get(
  '/static/*',
  serveStatic({
    onNotFound: (path, c) => {
      console.log(`${path} is not found, you access ${c.req.path}`)
    },
  })
)
```

### `precompressed`

`precompressed` 选项检查具有 `.br` 或 `.gz` 等扩展名的文件是否可用，并根据 `Accept-Encoding` header 提供它们。它优先考虑 Brotli，然后是 Zstd 和 Gzip。如果都不可用，则提供原始文件。

```ts
app.get(
  '/static/*',
  serveStatic({
    precompressed: true,
  })
)
```

## Testing

你可以在 Bun 上使用 `bun:test` 进行测试。

```ts
import { describe, expect, it } from 'bun:test'
import app from '.'

describe('My first test', () => {
  it('Should return 200 Response', async () => {
    const req = new Request('http://localhost/')
    const res = await app.fetch(req)
    expect(res.status).toBe(200)
  })
})
```

然后，运行命令。

```sh
bun test index.test.ts
```
