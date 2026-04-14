# Middleware

Middleware 在端点 `Handler` 之前/之后工作。我们可以在 dispatch 之前获取 `Request` 或在 dispatch 之后操作 `Response`。

## Definition of Middleware

- Handler - 应该返回 `Response` 对象。只有一个 handler 会被调用。
- Middleware - 应该 `await next()` 并返回 nothing 以调用下一个 Middleware，**或**返回 `Response` 以提前退出。

用户可以使用 `app.use` 或使用 `app.HTTP_METHOD` 以及 handlers 来注册中间件。使用这个功能，可以轻松指定路径和方法。

```ts
// 匹配任何方法，所有 routes
app.use(logger())

// 指定路径
app.use('/posts/*', cors())

// 指定方法和路径
app.post('/posts/*', basicAuth())
```

如果 handler 返回 `Response`，它将用于最终用户并停止处理。

```ts
app.post('/posts', (c) => c.text('Created!', 201))
```

在这种情况下，在 dispatch 之前处理四个中间件，如下所示：

```ts
logger() -> cors() -> basicAuth() -> *handler*
```

## Execution order

中间件的执行顺序由注册顺序决定。第一个注册的中间件在 `next` 之前的处理首先执行，在 `next` 之后的处理最后执行。见下文。

```ts
app.use(async (_, next) => {
  console.log('middleware 1 start')
  await next()
  console.log('middleware 1 end')
})
app.use(async (_, next) => {
  console.log('middleware 2 start')
  await next()
  console.log('middleware 2 end')
})
app.use(async (_, next) => {
  console.log('middleware 3 start')
  await next()
  console.log('middleware 3 end')
})

app.get('/', (c) => {
  console.log('handler')
  return c.text('Hello!')
})
```

结果如下。

```
middleware 1 start
  middleware 2 start
    middleware 3 start
      handler
    middleware 3 end
  middleware 2 end
middleware 1 end
```

注意，如果 handler 或任何中间件抛出，hono 将捕获它并将其传递给你的 [app.onError() callback](/docs/api/hono#error-handling) 或在返回之前自动将其转换为 500 响应。这意味着 next() 永远不会抛出，因此无需将其包装在 try/catch/finally 中。

## Built-in Middleware

Hono 有内置中间件。

```ts
import { Hono } from 'hono'
import { poweredBy } from 'hono/powered-by'
import { logger } from 'hono/logger'
import { basicAuth } from 'hono/basic-auth'

const app = new Hono()

app.use(poweredBy())
app.use(logger())

app.use(
  '/auth/*',
  basicAuth({
    username: 'hono',
    password: 'acoolproject',
  })
)
```

::: warning
在 Deno 中，可以使用与 Hono 版本不同的中间件版本，但这可能导致错误。例如，此代码无法工作，因为版本不同。

```ts
import { Hono } from 'jsr:@hono/hono@4.4.0'
import { upgradeWebSocket } from 'jsr:@hono/hono@4.4.5/deno'

const app = new Hono()

app.get(
  '/ws',
  upgradeWebSocket(() => ({
    // ...
  }))
)
```

:::

## Custom Middleware

你可以直接在 `app.use()` 中编写自己的中间件：

```ts
// 自定义 logger
app.use(async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.url}`)
  await next()
})

// 添加自定义 header
app.use('/message/*', async (c, next) => {
  await next()
  c.header('x-message', 'This is middleware!')
})

app.get('/message/hello', (c) => c.text('Hello Middleware!'))
```

然而，直接将中间件嵌入 `app.use()` 会限制其可重用性。因此，我们可以将中间件分离到不同的文件中。

为了确保我们不会丢失 `context` 和 `next` 的类型定义，在分离中间件时，我们可以使用 Hono factory 的 [`createMiddleware()`](/docs/helpers/factory#createmiddleware)。这也允许我们类型安全地 [访问我们在 `Context` 中 `set` 的数据](https://hono.dev/docs/api/context#set-get) 从下游 handlers。

```ts
import { createMiddleware } from 'hono/factory'

const logger = createMiddleware(async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.url}`)
  await next()
})
```

:::info
类型泛型可以与 `createMiddleware` 一起使用：

```ts
createMiddleware<{Bindings: Bindings}>(async (c, next) =>
```

:::

### Modify the Response After Next

此外，中间件可以设计为在必要时修改响应：

```ts
const stripRes = createMiddleware(async (c, next) => {
  await next()
  c.res = undefined
  c.res = new Response('New Response')
})
```

## Context access inside Middleware arguments

要在中间件参数内部访问 context，直接使用 `app.use` 提供的 context 参数。请查看下面的示例以澄清。

```ts
import { cors } from 'hono/cors'

app.use('*', async (c, next) => {
  const middleware = cors({
    origin: c.env.CORS_ORIGIN,
  })
  return middleware(c, next)
})
```

### Extending the Context in Middleware

要在中间件内部扩展 context，使用 `c.set`。你可以通过向 `createMiddleware` 函数传递 `{ Variables: { yourVariable: YourVariableType } }` 泛型参数来使其类型安全。

```ts
import { createMiddleware } from 'hono/factory'

const echoMiddleware = createMiddleware<{
  Variables: {
    echo: (str: string) => string
  }
}>(async (c, next) => {
  c.set('echo', (str) => str)
  await next()
})

app.get('/echo', echoMiddleware, (c) => {
  return c.text(c.var.echo('Hello!'))
})
```

### Type Inference Across Chained Middleware

当你使用 `.use()` 链接多个中间件时，Hono 会自动累积 `Variables` 类型。跟随中间件链的 route handlers 可以类型安全地访问前面所有中间件的所有变量：

```ts
import { createMiddleware } from 'hono/factory'

const authMiddleware = createMiddleware<{
  Variables: { user: { id: string; name: string } }
}>(async (c, next) => {
  c.set('user', { id: '123', name: 'Alice' })
  await next()
})

const dbMiddleware = createMiddleware<{
  Variables: { db: { query: (sql: string) => Promise<unknown> } }
}>(async (c, next) => {
  c.set('db', {
    query: async (sql) => {
      /* ... */
    },
  })
  await next()
})

const app = new Hono()
  .use(authMiddleware)
  .use(dbMiddleware)
  .get('/', (c) => {
    // `user` 和 `db` 都可用且类型安全
    const user = c.var.user // { id: string; name: string }
    const db = c.var.db // { query: (sql: string) => Promise<unknown> }
    return c.json({ user })
  })
```

这有效是因为每个 `.use()` 调用都返回一个具有合并类型的新 Hono 实例，因此随着中间件的链接，类型会增长。这消除了大多数用例需要提前手动声明组合 `Env` 类型的需求。

## Third-party Middleware

内置中间件不依赖外部模块，但第三方中间件可以依赖第三方库。因此，使用它们，我们可以制作更复杂的应用程序。

我们可以探索各种 [third-party middleware](https://hono.dev/docs/middleware/third-party)。例如，我们有 GraphQL Server Middleware、Sentry Middleware、Firebase Auth Middleware 等。
