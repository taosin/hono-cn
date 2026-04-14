# RPC

RPC 功能允许在服务器和客户端之间共享 API 规范。

首先，从你的服务器代码中导出你的 Hono 应用程序的 `typeof`（通常称为 `AppType`）——或者只是你想要客户端可用的路由。

通过将 `AppType` 作为泛型参数接受，Hono Client 可以推断由 Validator 指定的输入类型和由返回 `c.json()` 的 handlers 发出的输出类型。

> [!NOTE]
> 为了使 RPC 类型在 monorepo 中正常工作，请在 Client 和 Server 的 tsconfig.json 文件中设置 `"strict": true`。[阅读更多。](https://github.com/honojs/hono/issues/2270#issuecomment-2143745118)

## 服务器

在服务器端，你需要做的就是编写一个 validator 并创建变量 `route`。以下示例使用 [Zod Validator](https://github.com/honojs/middleware/tree/main/packages/zod-validator)。

```ts{1}
const route = app.post(
  '/posts',
  zValidator(
    'form',
    z.object({
      title: z.string(),
      body: z.string(),
    })
  ),
  (c) => {
    // ...
    return c.json(
      {
        ok: true,
        message: 'Created!',
      },
      201
    )
  }
)
```

然后，导出类型以与客户端共享 API 规范。

```ts
export type AppType = typeof route
```

## 客户端

在客户端，首先导入 `hc` 和 `AppType`。

```ts
import type { AppType } from '.'
import { hc } from 'hono/client'
```

`hc` 是创建客户端的函数。将 `AppType` 作为泛型传递，并将服务器 URL 指定为参数。

```ts
const client = hc<AppType>('http://localhost:8787/')
```

调用 `client.{path}.{method}` 并将你想要发送到服务器的数据作为参数传递。

```ts
const res = await client.posts.$post({
  form: {
    title: 'Hello',
    body: 'Hono is a cool project',
  },
})
```

`res` 与 "fetch" Response 兼容。你可以使用 `res.json()` 从服务器检索数据。

```ts
if (res.ok) {
  const data = await res.json()
  console.log(data.message)
}
```

### Cookies

要使客户端在每次请求时都发送 cookies，请在创建客户端时将 `{ 'init': { 'credentials": 'include' } }` 添加到选项。

```ts
// client.ts
const client = hc<AppType>('http://localhost:8787/', {
  init: {
    credentials: 'include',
  },
})

// 此请求现在将包含你可能设置的任何 cookies
const res = await client.posts.$get({
  query: {
    id: '123',
  },
})
```

## 状态码

如果你在 `c.json()` 中明确指定状态码（如 `200` 或 `404`），它将作为传递给客户端的类型添加。

```ts
// server.ts
const app = new Hono().get(
  '/posts',
  zValidator(
    'query',
    z.object({
      id: z.string(),
    })
  ),
  async (c) => {
    const { id } = c.req.valid('query')
    const post: Post | undefined = await getPost(id)

    if (post === undefined) {
      return c.json({ error: 'not found' }, 404) // 指定 404
    }

    return c.json({ post }, 200) // 指定 200
  }
)

export type AppType = typeof app
```

你可以通过状态码获取数据。

```ts
// client.ts
const client = hc<AppType>('http://localhost:8787/')

const res = await client.posts.$get({
  query: {
    id: '123',
  },
})

if (res.status === 404) {
  const data: { error: string } = await res.json()
  console.log(data.error)
}

if (res.ok) {
  const data: { post: Post } = await res.json()
  console.log(data.post)
}

// { post: Post } | { error: string }
type ResponseType = InferResponseType<typeof client.posts.$get>

// { post: Post }
type ResponseType200 = InferResponseType<
  typeof client.posts.$get,
  200
>
```

## 全局响应

Hono RPC 客户端不会自动从全局错误处理器（如 `app.onError()`）或全局中间件推断响应类型。你可以使用 `ApplyGlobalResponse` 类型辅助工具将全局错误响应类型合并到所有路由中。

```ts
import type { ApplyGlobalResponse } from 'hono/client'

const app = new Hono()
  .get('/api/users', (c) => c.json({ users: ['alice', 'bob'] }, 200))
  .onError((err, c) => c.json({ error: err.message }, 500))

type AppWithErrors = ApplyGlobalResponse<
  typeof app,
  {
    500: { json: { error: string } }
  }
>

const client = hc<AppWithErrors>('http://localhost')
```

现在客户端知道成功和错误响应：

```ts
const res = await client.api.users.$get()

if (res.ok) {
  const data = await res.json() // { users: string[] }
}

// InferResponseType 包含全局错误类型
type ResType = InferResponseType<typeof client.api.users.$get>
// { users: string[] } | { error: string }
```

你也可以一次定义多个全局错误状态码：

```ts
type AppWithErrors = ApplyGlobalResponse<
  typeof app,
  {
    401: { json: { error: string; message: string } }
    500: { json: { error: string; message: string } }
  }
>
```

## Not Found

如果你想使用客户端，你不应该对 Not Found 响应使用 `c.notFound()`。客户端从服务器获取的数据无法正确推断。

```ts
// server.ts
export const routes = new Hono().get(
  '/posts',
  zValidator(
    'query',
    z.object({
      id: z.string(),
    })
  ),
  async (c) => {
    const { id } = c.req.valid('query')
    const post: Post | undefined = await getPost(id)

    if (post === undefined) {
      return c.notFound() // ❌️
    }

    return c.json({ post })
  }
)

// client.ts
import { hc } from 'hono/client'

const client = hc<typeof routes>('/')

const res = await client.posts[':id'].$get({
  param: {
    id: '123',
  },
})

const data = await res.json() // 🙁 data 是 unknown
```

请使用 `c.json()` 并为 Not Found 响应指定状态码。

```ts
export const routes = new Hono().get(
  '/posts',
  zValidator(
    'query',
    z.object({
      id: z.string(),
    })
  ),
  async (c) => {
    const { id } = c.req.valid('query')
    const post = await getPost(id)

    if (!post) {
      return c.json({ error: 'not found' }, 404) // 指定 404
    }

    return c.json({ post }, 200) // 指定 200
  }
)
```

或者，你可以使用模块扩展来扩展 `NotFoundResponse` 接口。这允许 `c.notFound()` 返回类型化的响应：

```ts
// server.ts
import { Hono, TypedResponse } from 'hono'

declare module 'hono' {
  interface NotFoundResponse
    extends Response,
      TypedResponse<{ error: string }, 404, 'json'> {}
}

const app = new Hono()
  .get('/posts/:id', async (c) => {
    const post = await getPost(c.req.param('id'))
    if (!post) {
      return c.notFound()
    }
    return c.json({ post }, 200)
  })
  .notFound((c) => c.json({ error: 'not found' }, 404))

export type AppType = typeof app
```

现在客户端可以正确推断 404 响应类型。

## 路径参数

你也可以处理包含路径参数或查询值的路由。

```ts
const route = app.get(
  '/posts/:id',
  zValidator(
    'query',
    z.object({
      page: z.coerce.number().optional(), // coerce 转换为 number
    })
  ),
  (c) => {
    // ...
    return c.json({
      title: 'Night',
      body: 'Time to sleep',
    })
  }
)
```

路径参数和查询值**必须**作为 `string` 传递，即使底层值是其他类型。

使用 `param` 指定你想要包含在路径中的字符串，使用 `query` 指定任何查询值。

```ts
const res = await client.posts[':id'].$get({
  param: {
    id: '123',
  },
  query: {
    page: '1', // `string`，由 validator 转换为 `number`
  },
})
```

### 多个参数

处理具有多个参数的路由。

```ts
const route = app.get(
  '/posts/:postId/:authorId',
  zValidator(
    'query',
    z.object({
      page: z.string().optional(),
    })
  ),
  (c) => {
    // ...
    return c.json({
      title: 'Night',
      body: 'Time to sleep',
    })
  }
)
```

添加多个 `['']` 来指定路径中的参数。

```ts
const res = await client.posts[':postId'][':authorId'].$get({
  param: {
    postId: '123',
    authorId: '456',
  },
  query: {},
})
```

### 包含斜杠

`hc` 函数不会对 `param` 的值进行 URL 编码。要在参数中包含斜杠，请使用 [正则表达式](/docs/api/routing#regexp)。

```ts
// client.ts

// 请求 /posts/123/456
const res = await client.posts[':id'].$get({
  param: {
    id: '123/456',
  },
})

// server.ts
const route = app.get(
  '/posts/:id{.+}',
  zValidator(
    'param',
    z.object({
      id: z.string(),
    })
  ),
  (c) => {
    // id: 123/456
    const { id } = c.req.valid('param')
    // ...
  }
)
```

> [!NOTE]
> 没有正则表达式的基本路径参数不匹配斜杠。如果你使用 hc 函数传递包含斜杠的 `param`，服务器可能无法按预期路由。使用 `encodeURIComponent` 编码参数是确保正确路由的推荐方法。

## Headers

你可以将 headers 附加到请求。

```ts
const res = await client.search.$get(
  {
    //...
  },
  {
    headers: {
      'X-Custom-Header': 'Here is Hono Client',
      'X-User-Agent': 'hc',
    },
  }
)
```

要为所有请求添加公共 header，请将其指定为 `hc` 函数的参数。

```ts
const client = hc<AppType>('/api', {
  headers: {
    Authorization: 'Bearer TOKEN',
  },
})
```

## `init` 选项

你可以将 fetch 的 `RequestInit` 对象作为 `init` 选项传递给请求。以下是中止请求的示例。

```ts
import { hc } from 'hono/client'

const client = hc<AppType>('http://localhost:8787/')

const abortController = new AbortController()
const res = await client.api.posts.$post(
  {
    json: {
      // 请求体
    },
  },
  {
    // RequestInit 对象
    init: {
      signal: abortController.signal,
    },
  }
)

// ...

abortController.abort()
```

::: info
由 `init` 定义的 `RequestInit` 对象具有最高优先级。它可用于覆盖由其他选项（如 `body | method | headers`）设置的内容。
:::

## `$url()`

你可以使用 `$url()` 获取用于访问端点的 `URL` 对象。

::: warning
你必须传递绝对 URL 才能使其工作。传递相对 URL `/` 将导致以下错误。

`Uncaught TypeError: Failed to construct 'URL': Invalid URL`

```ts
// ❌ 将抛出错误
const client = hc<AppType>('/')
client.api.post.$url()

// ✅ 将按预期工作
const client = hc<AppType>('http://localhost:8787/')
client.api.post.$url()
```

:::

```ts
const route = app
  .get('/api/posts', (c) => c.json({ posts }))
  .get('/api/posts/:id', (c) => c.json({ post }))

const client = hc<typeof route>('http://localhost:8787/')

let url = client.api.posts.$url()
console.log(url.pathname) // `/api/posts`

url = client.api.posts[':id'].$url({
  param: {
    id: '123',
  },
})
console.log(url.pathname) // `/api/posts/123`
```

### Typed URL

你可以将基础 URL 作为第二个类型参数传递给 `hc` 以获得更精确的 URL 类型：

```ts
const client = hc<typeof route, 'http://localhost:8787'>(
  'http://localhost:8787/'
)

const url = client.api.posts.$url()
// url 是 TypedURL，具有精确的类型信息
// 包括协议、主机和路径
```

当你想要将 URL 用作类型安全的键（如 SWR 等库）时，这很有用。

## `$path()`

`$path()` 类似于 `$url()`，但返回路径字符串而不是 `URL` 对象。与 `$url()` 不同，它不包含基础 URL origin，因此无论你将什么基础 URL 传递给 `hc` 都能工作。

```ts
const route = app
  .get('/api/posts', (c) => c.json({ posts }))
  .get('/api/posts/:id', (c) => c.json({ post }))

const client = hc<typeof route>('http://localhost:8787/')

let path = client.api.posts.$path()
console.log(path) // `/api/posts`

path = client.api.posts[':id'].$path({
  param: {
    id: '123',
  },
})
console.log(path) // `/api/posts/123`
```

你也可以传递查询参数：

```ts
const path = client.api.posts.$path({
  query: {
    page: '1',
    limit: '10',
  },
})
console.log(path) // `/api/posts?page=1&limit=10`
```

## 文件上传

你可以使用 form body 上传文件：

```ts
// client
const res = await client.user.picture.$put({
  form: {
    file: new File([fileToUpload], filename, {
      type: fileToUpload.type,
    }),
  },
})
```

```ts
// server
const route = app.put(
  '/user/picture',
  zValidator(
    'form',
    z.object({
      file: z.instanceof(File),
    })
  )
  // ...
)
```

## 自定义 `fetch` 方法

你可以设置自定义 `fetch` 方法。

在以下 Cloudflare Worker 脚本中，使用 Service Bindings 的 `fetch` 方法而不是默认 `fetch`。

```toml
# wrangler.toml
services = [
  { binding = "AUTH", service = "auth-service" },
]
```

```ts
// src/client.ts
const client = hc<CreateProfileType>('http://localhost', {
  fetch: c.env.AUTH.fetch.bind(c.env.AUTH),
})
```

## 自定义查询序列化器

你可以使用 `buildSearchParams` 选项自定义查询参数的序列化方式。当你需要数组的中括号表示法或其他自定义格式时，这很有用：

```ts
const client = hc<AppType>('http://localhost', {
  buildSearchParams: (query) => {
    const searchParams = new URLSearchParams()
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined) {
        continue
      }
      if (Array.isArray(v)) {
        v.forEach((item) => searchParams.append(`${k}[]`, item))
      } else {
        searchParams.set(k, v)
      }
    }
    return searchParams
  },
})
```

## Infer

使用 `InferRequestType` 和 `InferResponseType` 来了解要请求的对象类型和要返回的对象类型。

```ts
import type { InferRequestType, InferResponseType } from 'hono/client'

// InferRequestType
const $post = client.todo.$post
type ReqType = InferRequestType<typeof $post>['form']

// InferResponseType
type ResType = InferResponseType<typeof $post>
```

## 使用类型安全辅助工具解析响应

你可以使用 `parseResponse()` 辅助工具轻松解析来自 `hc` 的响应，并具有类型安全性。

```ts
import { parseResponse, DetailedError } from 'hono/client'

// result 包含解析后的响应体（根据 Content-Type 自动解析）
const result = await parseResponse(client.hello.$get()).catch(
  (e: DetailedError) => {
    console.error(e)
  }
)
// 如果响应不是 ok，parseResponse 会自动抛出错误
```

## 使用 SWR

你也可以使用 React Hook 库，如 [SWR](https://swr.vercel.app)。

```tsx
import useSWR from 'swr'
import { hc } from 'hono/client'
import type { InferRequestType } from 'hono/client'
import type { AppType } from '../functions/api/[[route]]'

const App = () => {
  const client = hc<AppType>('/api')
  const $get = client.hello.$get

  const fetcher =
    (arg: InferRequestType<typeof $get>) => async () => {
      const res = await $get(arg)
      return await res.json()
    }

  const { data, error, isLoading } = useSWR(
    'api-hello',
    fetcher({
      query: {
        name: 'SWR',
      },
    })
  )

  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>

  return <h1>{data?.message}</h1>
}

export default App
```

## 在更大的应用程序中使用 RPC

在更大的应用程序中，如 [构建更大的应用程序](/docs/guides/best-practices#building-a-larger-application) 中提到的示例，你需要注意推断类型。
一个简单的方法是链接 handlers，以便始终推断类型。

```ts
// authors.ts
import { Hono } from 'hono'

const app = new Hono()
  .get('/', (c) => c.json('list authors'))
  .post('/', (c) => c.json('create an author', 201))
  .get('/:id', (c) => c.json(`get ${c.req.param('id')}`))

export default app
```

```ts
// books.ts
import { Hono } from 'hono'

const app = new Hono()
  .get('/', (c) => c.json('list books'))
  .post('/', (c) => c.json('create a book', 201))
  .get('/:id', (c) => c.json(`get ${c.req.param('id')}`))

export default app
```

然后你可以像往常一样导入子路由器，并确保也链接它们的 handlers，因为这是应用程序的顶层，这是我们要导出的类型。

```ts
// index.ts
import { Hono } from 'hono'
import authors from './authors'
import books from './books'

const app = new Hono()

const routes = app.route('/authors', authors).route('/books', books)

export default app
export type AppType = typeof routes
```

现在你可以使用注册的 AppType 创建新客户端，并像往常一样使用它。

## 已知问题

### IDE 性能

使用 RPC 时，路由越多，IDE 就会变得越慢。主要原因之一是执行了大量的类型实例化来推断你的应用程序类型。

例如，假设你的应用程序有这样的路由：

```ts
// app.ts
export const app = new Hono().get('foo/:id', (c) =>
  c.json({ ok: true }, 200)
)
```

Hono 将按以下方式推断类型：

```ts
export const app = Hono<BlankEnv, BlankSchema, '/'>().get<
  'foo/:id',
  'foo/:id',
  JSONRespondReturn<{ ok: boolean }, 200>,
  BlankInput,
  BlankEnv
>('foo/:id', (c) => c.json({ ok: true }, 200))
```

这是单个路由的类型实例化。虽然用户不需要手动编写这些类型参数，这是一件好事，但已知类型实例化需要很长时间。你的 IDE 中使用的 `tsserver` 每次使用应用程序时都会执行这个耗时的任务。如果你有很多路由，这会显著减慢你的 IDE。

然而，我们有一些技巧来缓解这个问题。

#### Hono 版本不匹配

如果你的后端与前端分离并位于不同的目录中，你需要确保 Hono 版本匹配。如果你在后端使用一个 Hono 版本，在前端使用另一个版本，你会遇到问题，如 "_Type instantiation is excessively deep and possibly infinite_"。

![](https://github.com/user-attachments/assets/e4393c80-29dd-408d-93ab-d55c11ccca05)

#### TypeScript 项目引用

与 [Hono 版本不匹配](#hono-version-mismatch) 的情况一样，如果你的后端和前端是分离的，你会遇到问题。如果你想在前端访问后端的代码（例如 `AppType`），你需要使用 [项目引用](https://www.typescriptlang.org/docs/handbook/project-references.html)。TypeScript 的项目引用允许一个 TypeScript 代码库访问和使用另一个 TypeScript 代码库的代码。（来源：[Hono RPC And TypeScript Project References](https://catalins.tech/hono-rpc-in-monorepos/)）。

#### 在使用前编译你的代码（推荐）

`tsc` 可以在编译时执行类型实例化等繁重的任务！这样，`tsserver` 就不需要每次使用时都实例化所有类型参数。这将使你的 IDE 快得多！

编译包含服务器应用程序的客户端可以为你提供最佳性能。将以下代码放在你的项目中：

```ts
import { app } from './app'
import { hc } from 'hono/client'

// 这是一个在编译时计算类型的技巧
export type Client = ReturnType<typeof hc<typeof app>>

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
  hc<typeof app>(...args)
```

编译后，你可以使用 `hcWithType` 而不是 `hc` 来获取已经计算好类型的客户端。

```ts
const client = hcWithType('http://localhost:8787/')
const res = await client.posts.$post({
  form: {
    title: 'Hello',
    body: 'Hono is a cool project',
  },
})
```

如果你的项目是 monorepo，这个解决方案非常合适。使用 [`turborepo`](https://turbo.build/repo/docs) 等工具，你可以轻松分离服务器项目和客户端项目，并更好地管理它们之间的依赖关系。这是一个 [工作示例](https://github.com/m-shaka/hono-rpc-perf-tips-example)。

你也可以使用 `concurrently` 或 `npm-run-all` 等工具手动协调构建过程。

#### 手动指定类型参数

这有点麻烦，但你可以手动指定类型参数以避免类型实例化。

```ts
const app = new Hono().get<'foo/:id'>('foo/:id', (c) =>
  c.json({ ok: true }, 200)
)
```

仅指定单个类型参数就可以在性能上产生差异，但如果你有很多路由，这可能需要你大量时间和精力。

#### 将你的应用程序和客户端拆分为多个文件

如 [在更大的应用程序中使用 RPC](#using-rpc-with-larger-applications) 中所述，你可以将你的应用程序拆分为多个应用程序。你也可以为每个应用程序创建客户端：

```ts
// authors-cli.ts
import { app as authorsApp } from './authors'
import { hc } from 'hono/client'

const authorsClient = hc<typeof authorsApp>('/authors')

// books-cli.ts
import { app as booksApp } from './books'
import { hc } from 'hono/client'

const booksClient = hc<typeof booksApp>('/books')
```

这样，`tsserver` 就不需要一次为所有路由实例化类型。
