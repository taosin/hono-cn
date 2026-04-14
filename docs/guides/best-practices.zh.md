# 最佳实践

Hono 非常灵活。你可以随意编写你的应用程序。
然而，有一些最佳实践最好遵循。

## 尽可能不要创建 "Controllers"

可能情况下，你不应该创建 "Ruby on Rails 风格的 Controllers"。

```ts
// 🙁
// 一个 RoR 风格的 Controller
const booksList = (c: Context) => {
  return c.json('list books')
}

app.get('/books', booksList)
```

问题与类型有关。例如，路径参数在 Controller 中无法推断，除非编写复杂的泛型。

```ts
// 🙁
// 一个 RoR 风格的 Controller
const bookPermalink = (c: Context) => {
  const id = c.req.param('id') // 无法推断路径参数
  return c.json(`get ${id}`)
}
```

因此，你不需要创建 RoR 风格的 controllers，应该在路径定义后直接编写 handlers。

```ts
// 😃
app.get('/books/:id', (c) => {
  const id = c.req.param('id') // 可以推断路径参数
  return c.json(`get ${id}`)
})
```

## `hono/factory` 中的 `factory.createHandlers()`

如果你仍然想创建 RoR 风格的 Controller，请使用 [`hono/factory`](/docs/helpers/factory) 中的 `factory.createHandlers()`。如果使用这个，类型推断将正常工作。

```ts
import { createFactory } from 'hono/factory'
import { logger } from 'hono/logger'

// ...

// 😃
const factory = createFactory()

const middleware = factory.createMiddleware(async (c, next) => {
  c.set('foo', 'bar')
  await next()
})

const handlers = factory.createHandlers(logger(), middleware, (c) => {
  return c.json(c.var.foo)
})

app.get('/api', ...handlers)
```

## 构建更大的应用程序

使用 `app.route()` 来构建更大的应用程序，而无需创建 "Ruby on Rails 风格的 Controllers"。

如果你的应用程序有 `/authors` 和 `/books` 端点，并且你想从 `index.ts` 分离文件，请创建 `authors.ts` 和 `books.ts`。

```ts
// authors.ts
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.json('list authors'))
app.post('/', (c) => c.json('create an author', 201))
app.get('/:id', (c) => c.json(`get ${c.req.param('id')}`))

export default app
```

```ts
// books.ts
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.json('list books'))
app.post('/', (c) => c.json('create a book', 201))
app.get('/:id', (c) => c.json(`get ${c.req.param('id')}`))

export default app
```

然后，导入它们并使用 `app.route()` 挂载到路径 `/authors` 和 `/books`。

```ts
// index.ts
import { Hono } from 'hono'
import authors from './authors'
import books from './books'

const app = new Hono()

// 😃
app.route('/authors', authors)
app.route('/books', books)

export default app
```

### 如果你想使用 RPC 功能

上面的代码在普通用例中工作良好。
但是，如果你想使用 `RPC` 功能，你可以通过以下方式获得正确的类型。

```ts
// authors.ts
import { Hono } from 'hono'

const app = new Hono()
  .get('/', (c) => c.json('list authors'))
  .post('/', (c) => c.json('create an author', 201))
  .get('/:id', (c) => c.json(`get ${c.req.param('id')}`))

export default app
export type AppType = typeof app
```

如果你将 `app` 的类型传递给 `hc`，它将获得正确的类型。

```ts
import type { AppType } from './authors'
import { hc } from 'hono/client'

// 😃
const client = hc<AppType>('http://localhost') // 正确推断类型
```

有关更详细的信息，请参阅 [RPC 页面](/docs/guides/rpc#using-rpc-with-larger-applications)。
