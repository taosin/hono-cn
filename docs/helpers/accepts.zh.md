# Accepts Helper

Accepts Helper 有助于处理请求中的 Accept headers。

## Import

```ts
import { Hono } from 'hono'
import { accepts } from 'hono/accepts'
```

## `accepts()`

`accepts()` 函数查看 Accept header（如 Accept-Encoding 和 Accept-Language）并返回适当的值。

```ts
import { accepts } from 'hono/accepts'

app.get('/', (c) => {
  const accept = accepts(c, {
    header: 'Accept-Language',
    supports: ['en', 'ja', 'zh'],
    default: 'en',
  })
  return c.json({ lang: accept })
})
```

### `AcceptHeader` type

`AcceptHeader` 类型的定义如下。

```ts
export type AcceptHeader =
  | 'Accept'
  | 'Accept-Charset'
  | 'Accept-Encoding'
  | 'Accept-Language'
  | 'Accept-Patch'
  | 'Accept-Post'
  | 'Accept-Ranges'
```

## Options

### <Badge type="danger" text="required" /> header: `AcceptHeader`

目标 accept header。

### <Badge type="danger" text="required" /> supports: `string[]`

你的应用程序支持的头值。

### <Badge type="danger" text="required" /> default: `string`

默认值。

### <Badge type="info" text="optional" /> match: `(accepts: Accept[], config: acceptsConfig) => string`

自定义匹配函数。
