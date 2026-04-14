# Validation

Hono 仅提供非常薄的 Validator。然而，与第三方 Validator 结合使用时，它可以变得强大。此外，RPC 功能允许你通过类型与客户端共享 API 规范。

## Manual validator

首先，介绍一种在不使用第三方 Validator 的情况下验证传入值的方法。

从 `hono/validator` 导入 `validator`。

```ts
import { validator } from 'hono/validator'
```

要验证 form 数据，将 `form` 指定为第一个参数，将回调指定为第二个参数。在回调中验证值，最后返回验证后的值。`validator` 可以作为中间件使用。

```ts
app.post(
  '/posts',
  validator('form', (value, c) => {
    const body = value['body']
    if (!body || typeof body !== 'string') {
      return c.text('Invalid!', 400)
    }
    return {
      body: body,
    }
  }),
  //...
```

在 handler 中，你可以使用 `c.req.valid('form')` 获取验证后的值。

```ts
, (c) => {
  const { body } = c.req.valid('form')
  // ... do something
  return c.json(
    {
      message: 'Created!',
    },
    201
  )
}
```

验证目标包括 `form` 之外的 `json`、`query`、`header`、`param` 和 `cookie`。

::: warning
当你验证 `json` 或 `form` 时，请求_必须_包含匹配的 `content-type` header（例如，`json` 的 `Content-Type: application/json`）。否则，请求体将不会被解析，你将在回调中收到空对象（`{}`）。

使用 [`app.request()`](../api/request.md) 进行测试时，设置 `content-type` header 很重要。

给定这样的应用程序。

```ts
const app = new Hono()
app.post(
  '/testing',
  validator('json', (value, c) => {
    // pass-through validator
    return value
  }),
  (c) => {
    const body = c.req.valid('json')
    return c.json(body)
  }
)
```

你的测试可以这样写。

```ts
// ❌ 这不会工作
const res = await app.request('/testing', {
  method: 'POST',
  body: JSON.stringify({ key: 'value' }),
})
const data = await res.json()
console.log(data) // {}

// ✅ 这会工作
const res = await app.request('/testing', {
  method: 'POST',
  body: JSON.stringify({ key: 'value' }),
  headers: new Headers({ 'Content-Type': 'application/json' }),
})
const data = await res.json()
console.log(data) // { key: 'value' }
```

:::

::: warning
当你验证 `header` 时，你需要使用**小写**名称作为键。

如果你想验证 `Idempotency-Key` header，你需要使用 `idempotency-key` 作为键。

```ts
// ❌ 这不会工作
app.post(
  '/api',
  validator('header', (value, c) => {
    // idempotencyKey 总是 undefined
    // 所以这个中间件总是返回 400，不符合预期
    const idempotencyKey = value['Idempotency-Key']

    if (idempotencyKey == undefined || idempotencyKey === '') {
      throw new HTTPException(400, {
        message: 'Idempotency-Key is required',
      })
    }
    return { idempotencyKey }
  }),
  (c) => {
    const { idempotencyKey } = c.req.valid('header')
    // ...
  }
)

// ✅ 这会工作
app.post(
  '/api',
  validator('header', (value, c) => {
    // 可以按预期获取 header 的值
    const idempotencyKey = value['idempotency-key']

    if (idempotencyKey == undefined || idempotencyKey === '') {
      throw new HTTPException(400, {
        message: 'Idempotency-Key is required',
      })
    }
    return { idempotencyKey }
  }),
  (c) => {
    const { idempotencyKey } = c.req.valid('header')
    // ...
  }
)
```

:::

## Multiple validators

你也可以包含多个 validators 来验证请求的不同部分：

```ts
app.post(
  '/posts/:id',
  validator('param', ...),
  validator('query', ...),
  validator('json', ...),
  (c) => {
    //...
  }
```

## With Zod

你可以使用 [Zod](https://zod.dev)，第三方 validators 之一。我们推荐使用第三方 validator。

从 Npm registry 安装。

::: code-group

```sh [npm]
npm i zod
```

```sh [yarn]
yarn add zod
```

```sh [pnpm]
pnpm add zod
```

```sh [bun]
bun add zod
```

:::

从 `zod` 导入 `z`。

```ts
import * as z from 'zod'
```

编写你的 schema。

```ts
const schema = z.object({
  body: z.string(),
})
```

你可以在回调函数中使用 schema 进行验证并返回验证后的值。

```ts
const route = app.post(
  '/posts',
  validator('form', (value, c) => {
    const parsed = schema.safeParse(value)
    if (!parsed.success) {
      return c.text('Invalid!', 401)
    }
    return parsed.data
  }),
  (c) => {
    const { body } = c.req.valid('form')
    // ... do something
    return c.json(
      {
        message: 'Created!',
      },
      201
    )
  }
)
```

## Zod Validator Middleware

你可以使用 [Zod Validator Middleware](https://github.com/honojs/middleware/tree/main/packages/zod-validator) 使其更容易。

::: code-group

```sh [npm]
npm i @hono/zod-validator
```

```sh [yarn]
yarn add @hono/zod-validator
```

```sh [pnpm]
pnpm add @hono/zod-validator
```

```sh [bun]
bun add @hono/zod-validator
```

:::

并导入 `zValidator`。

```ts
import { zValidator } from '@hono/zod-validator'
```

并如下编写。

```ts
const route = app.post(
  '/posts',
  zValidator(
    'form',
    z.object({
      body: z.string(),
    })
  ),
  (c) => {
    const validated = c.req.valid('form')
    // ... use your validated data
  }
)
```

## Standard Schema Validator Middleware

[Standard Schema](https://standardschema.dev/) 是一个规范，为 TypeScript 验证库提供通用接口。它由 Zod、Valibot 和 ArkType 的维护者创建，允许生态系统工具与任何验证库一起工作，而无需自定义适配器。

[Standard Schema Validator Middleware](https://github.com/honojs/middleware/tree/main/packages/standard-validator) 让你可以使用任何与 Standard Schema 兼容的验证库与 Hono，为你提供选择首选验证器的灵活性，同时保持一致的类型安全。

::: code-group

```sh [npm]
npm i @hono/standard-validator
```

```sh [yarn]
yarn add @hono/standard-validator
```

```sh [pnpm]
pnpm add @hono/standard-validator
```

```sh [bun]
bun add @hono/standard-validator
```

:::

从包中导入 `sValidator`：

```ts
import { sValidator } from '@hono/standard-validator'
```

### With Zod

你可以使用 Zod 与 Standard Schema validator：

::: code-group

```sh [npm]
npm i zod
```

```sh [yarn]
yarn add zod
```

```sh [pnpm]
pnpm add zod
```

```sh [bun]
bun add zod
```

:::

```ts
import * as z from 'zod'
import { sValidator } from '@hono/standard-validator'

const schema = z.object({
  name: z.string(),
  age: z.number(),
})

app.post('/author', sValidator('json', schema), (c) => {
  const data = c.req.valid('json')
  return c.json({
    success: true,
    message: `${data.name} is ${data.age}`,
  })
})
```

### With Valibot

[Valibot](https://valibot.dev/) 是一种轻量级替代 Zod 的方案，具有模块化设计：

::: code-group

```sh [npm]
npm i valibot
```

```sh [yarn]
yarn add valibot
```

```sh [pnpm]
pnpm add valibot
```

```sh [bun]
bun add valibot
```

:::

```ts
import * as v from 'valibot'
import { sValidator } from '@hono/standard-validator'

const schema = v.object({
  name: v.string(),
  age: v.number(),
})

app.post('/author', sValidator('json', schema), (c) => {
  const data = c.req.valid('json')
  return c.json({
    success: true,
    message: `${data.name} is ${data.age}`,
  })
})
```

### With ArkType

[ArkType](https://arktype.io/) 提供 TypeScript 原生语法进行运行时验证：

::: code-group

```sh [npm]
npm i arktype
```

```sh [yarn]
yarn add arktype
```

```sh [pnpm]
pnpm add arktype
```

```sh [bun]
bun add arktype
```

:::

```ts
import { type } from 'arktype'
import { sValidator } from '@hono/standard-validator'

const schema = type({
  name: 'string',
  age: 'number',
})

app.post('/author', sValidator('json', schema), (c) => {
  const data = c.req.valid('json')
  return c.json({
    success: true,
    message: `${data.name} is ${data.age}`,
  })
})
```
