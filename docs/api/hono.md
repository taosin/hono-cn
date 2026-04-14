# App - Hono

`Hono` 是主要对象。它会被首先导入并一直使用到最后。

```ts twoslash
import { Hono } from 'hono'

const app = new Hono()
//...

export default app // 用于 Cloudflare Workers 或 Bun
```

## Methods

`Hono` 实例有以下方法：

- app.**HTTP_METHOD**(\[path,\]handler|middleware...)
- app.**all**(\[path,\]handler|middleware...)
- app.**on**(method|method[], path|path[], handler|middleware...)
- app.**use**(\[path,\]middleware)
- app.**route**(path, \[app\])
- app.**basePath**(path)
- app.**notFound**(handler)
- app.**onError**(err, handler)
- app.**mount**(path, anotherApp)
- app.**fire**()
- app.**fetch**(request, env, event)
- app.**request**(path, options)

其中第一部分用于路由，请参阅 [routing section](/docs/api/routing)。

## Not Found

`app.notFound` 允许你自定义 Not Found 响应。

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.notFound((c) => {
  return c.text('Custom 404 Message', 404)
})
```

:::warning
`notFound` 方法仅从顶级 app 调用。更多信息见这个 [issue](https://github.com/honojs/hono/issues/3465#issuecomment-2381210165)。
:::

## Error Handling

`app.onError` 允许你处理未捕获的错误并返回自定义响应。

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.onError((err, c) => {
  console.error(`${err}`)
  return c.text('Custom Error Message', 500)
})
```

::: info
如果父 app 和其 routes 都有 `onError` 处理器，route 级别的处理器优先级更高。
:::

## fire()

::: warning
**`app.fire()` 已弃用**。改用 `hono/service-worker` 中的 `fire()`。详情见 [Service Worker documentation](/docs/getting-started/service-worker)。
:::

`app.fire()` 自动添加全局 `fetch` 事件监听器。

这对于遵循 [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) 的环境很有用，例如 [非 ES module Cloudflare Workers](https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/)。

`app.fire()` 为你执行以下操作：

```ts
addEventListener('fetch', (event: FetchEventLike): void => {
  event.respondWith(this.dispatch(...))
})
```

## fetch()

`app.fetch` 将成为你的应用程序入口点。

对于 Cloudflare Workers，你可以使用以下代码：

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
type Env = any
type ExecutionContext = any
// ---cut---
export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx)
  },
}
```

或者只需：

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
export default app
```

Bun：

<!-- prettier-ignore -->
```ts
export default app // [!code --]
export default {  // [!code ++]
  port: 3000, // [!code ++]
  fetch: app.fetch, // [!code ++]
} // [!code ++]
```

## request()

`request` 是一个用于测试的实用方法。

你可以传递 URL 或路径名来发送 GET 请求。`app` 将返回 `Response` 对象。

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
declare const test: (name: string, fn: () => void) => void
declare const expect: (value: any) => any
// ---cut---
test('GET /hello is ok', async () => {
  const res = await app.request('/hello')
  expect(res.status).toBe(200)
})
```

你也可以传递 `Request` 对象：

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
declare const test: (name: string, fn: () => void) => void
declare const expect: (value: any) => any
// ---cut---
test('POST /message is ok', async () => {
  const req = new Request('Hello!', {
    method: 'POST',
  })
  const res = await app.request(req)
  expect(res.status).toBe(201)
})
```

## mount()

`mount()` 允许你将用其他框架构建的应用程序挂载到你的 Hono 应用程序中。

```ts
import { Router as IttyRouter } from 'itty-router'
import { Hono } from 'hono'

// 创建 itty-router 应用程序
const ittyRouter = IttyRouter()

// 处理 `GET /itty-router/hello`
ittyRouter.get('/hello', () => new Response('Hello from itty-router'))

// Hono 应用程序
const app = new Hono()

// 挂载！
app.mount('/itty-router', ittyRouter.handle)
```

## strict mode

strict mode 默认为 `true`，区分以下 routes：

- `/hello`
- `/hello/`

`app.get('/hello')` 不会匹配 `GET /hello/`。

通过将 strict mode 设置为 `false`，两条路径将被同等对待。

```ts twoslash
import { Hono } from 'hono'
// ---cut---
const app = new Hono({ strict: false })
```

## router option

`router` 选项指定使用哪个 router。默认 router 是 `SmartRouter`。如果你想使用 `RegExpRouter`，将其传递给新的 `Hono` 实例：

```ts twoslash
import { Hono } from 'hono'
// ---cut---
import { RegExpRouter } from 'hono/router/reg-exp-router'

const app = new Hono({ router: new RegExpRouter() })
```

## Generics

你可以传递泛型来指定 Cloudflare Workers Bindings 和 `c.set`/`c.get` 中使用的变量的类型。

```ts twoslash
import { Hono } from 'hono'
type User = any
declare const user: User
// ---cut---
type Bindings = {
  TOKEN: string
}

type Variables = {
  user: User
}

const app = new Hono<{
  Bindings: Bindings
  Variables: Variables
}>()

app.use('/auth/*', async (c, next) => {
  const token = c.env.TOKEN // token 是 `string`
  // ...
  c.set('user', user) // user 应该是 `User`
  await next()
})
```
