# Routing

Hono 的路由灵活且直观。让我们来看看。

## Basic

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
// HTTP Methods
app.get('/', (c) => c.text('GET /'))
app.post('/', (c) => c.text('POST /'))
app.put('/', (c) => c.text('PUT /'))
app.delete('/', (c) => c.text('DELETE /'))

// Wildcard
app.get('/wild/*/card', (c) => {
  return c.text('GET /wild/*/card')
})

// Any HTTP methods
app.all('/hello', (c) => c.text('Any Method /hello'))

// Custom HTTP method
app.on('PURGE', '/cache', (c) => c.text('PURGE Method /cache'))

// Multiple Method
app.on(['PUT', 'DELETE'], '/post', (c) =>
  c.text('PUT or DELETE /post')
)

// Multiple Paths
app.on('GET', ['/hello', '/ja/hello', '/en/hello'], (c) =>
  c.text('Hello')
)
```

## Path Parameter

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/user/:name', async (c) => {
  const name = c.req.param('name')
  //       ^?
  // ...
})
```

或一次性获取所有参数：

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/posts/:id/comment/:comment_id', async (c) => {
  const { id, comment_id } = c.req.param()
  //       ^?
  // ...
})
```

## Optional Parameter

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
// 将匹配 `/api/animal` 和 `/api/animal/:type`
app.get('/api/animal/:type?', (c) => c.text('Animal!'))
```

## Regexp

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/post/:date{[0-9]+}/:title{[a-z]+}', async (c) => {
  const { date, title } = c.req.param()
  //       ^?
  // ...
})
```

## Including slashes

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/posts/:filename{.+\\.png}', async (c) => {
  //...
})
```

## Chained route

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app
  .get('/endpoint', (c) => {
    return c.text('GET /endpoint')
  })
  .post((c) => {
    return c.text('POST /endpoint')
  })
  .delete((c) => {
    return c.text('DELETE /endpoint')
  })
```

## Grouping

你可以使用 Hono 实例对路由进行分组，并使用 route 方法将它们添加到主 app。

```ts twoslash
import { Hono } from 'hono'
// ---cut---
const book = new Hono()

book.get('/', (c) => c.text('List Books')) // GET /book
book.get('/:id', (c) => {
  // GET /book/:id
  const id = c.req.param('id')
  return c.text('Get Book: ' + id)
})
book.post('/', (c) => c.text('Create Book')) // POST /book

const app = new Hono()
app.route('/book', book)
```

## Grouping without changing base

你也可以在保持 base 的同时对多个实例进行分组。

```ts twoslash
import { Hono } from 'hono'
// ---cut---
const book = new Hono()
book.get('/book', (c) => c.text('List Books')) // GET /book
book.post('/book', (c) => c.text('Create Book')) // POST /book

const user = new Hono().basePath('/user')
user.get('/', (c) => c.text('List Users')) // GET /user
user.post('/', (c) => c.text('Create User')) // POST /user

const app = new Hono()
app.route('/', book) // 处理 /book
app.route('/', user) // 处理 /user
```

## Base path

你可以指定 base path。

```ts twoslash
import { Hono } from 'hono'
// ---cut---
const api = new Hono().basePath('/api')
api.get('/book', (c) => c.text('List Books')) // GET /api/book
```

## Routing with hostname

如果包含 hostname，它也能正常工作。

```ts twoslash
import { Hono } from 'hono'
// ---cut---
const app = new Hono({
  getPath: (req) => req.url.replace(/^https?:\/([^?]+).*$/, '$1'),
})

app.get('/www1.example.com/hello', (c) => c.text('hello www1'))
app.get('/www2.example.com/hello', (c) => c.text('hello www2'))
```

## Routing with `host` Header value

如果你在 Hono 构造函数中设置 `getPath()` 函数，Hono 可以处理 `host` header 值。

```ts twoslash
import { Hono } from 'hono'
// ---cut---
const app = new Hono({
  getPath: (req) =>
    '/' +
    req.headers.get('host') +
    req.url.replace(/^https?:\/\/[^/]+(\/[^?]*).*/, '$1'),
})

app.get('/www1.example.com/hello', (c) => c.text('hello www1'))

// 以下请求将匹配路由：
// new Request('http://www1.example.com/hello', {
//  headers: { host: 'www1.example.com' },
// })
```

通过应用这个，例如，你可以通过 `User-Agent` header 改变路由。

## Routing priority

Handlers 或 middleware 将按注册顺序执行。

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/book/a', (c) => c.text('a')) // a
app.get('/book/:slug', (c) => c.text('common')) // common
```

```
GET /book/a ---> `a`
GET /book/b ---> `common`
```

当 handler 执行时，进程将停止。

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('*', (c) => c.text('common')) // common
app.get('/foo', (c) => c.text('foo')) // foo
```

```
GET /foo ---> `common` // foo 将不会 dispatch
```

如果你有想要执行的 middleware，请在 handler 上方编写代码。

```ts twoslash
import { Hono } from 'hono'
import { logger } from 'hono/logger'
const app = new Hono()
// ---cut---
app.use(logger())
app.get('/foo', (c) => c.text('foo'))
```

如果你想有一个"_fallback_"handler，请在其他 handler 下方编写代码。

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
// ---cut---
app.get('/bar', (c) => c.text('bar')) // bar
app.get('*', (c) => c.text('fallback')) // fallback
```

```
GET /bar ---> `bar`
GET /foo ---> `fallback`
```

## Grouping ordering

注意，路由分组的错误很难察觉。`route()` 函数从第二个参数（如 `three` 或 `two`）获取存储的路由，并将其添加到自己的（`two` 或 `app`）路由中。

```ts
three.get('/hi', (c) => c.text('hi'))
two.route('/three', three)
app.route('/two', two)

export default app
```

它将返回 200 响应。

```
GET /two/three/hi ---> `hi`
```

然而，如果顺序错误，它将返回 404。

```ts twoslash
import { Hono } from 'hono'
const app = new Hono()
const two = new Hono()
const three = new Hono()
// ---cut---
three.get('/hi', (c) => c.text('hi'))
app.route('/two', two) // `two` 没有 routes
two.route('/three', three)

export default app
```

```
GET /two/three/hi ---> 404 Not Found
```
