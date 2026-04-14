# Testing

[Vitest]: https://vitest.dev/

测试很重要。实际上，测试 Hono 的应用程序很容易。创建测试环境的方法因每个 runtime 而异，但基本步骤相同。在本节中，让我们使用 Cloudflare Workers 和 [Vitest] 进行测试。

::: tip
Cloudflare 推荐使用 [Vitest] 与 [@cloudflare/vitest-pool-workers](https://www.npmjs.com/package/@cloudflare/vitest-pool-workers)。更多详情，请参考 Cloudflare Workers 文档中的 [Vitest integration](https://developers.cloudflare.com/workers/testing/vitest-integration/)。
:::

## Request and Response

你需要做的就是创建请求并将其传递给 Hono 应用程序以验证响应。然后你可以使用有用的 `app.request` 方法。

::: tip
对于类型化测试客户端，查看 [testing helper](/docs/helpers/testing)。
:::

例如，考虑提供以下 REST API 的应用程序。

```ts
app.get('/posts', (c) => {
  return c.text('Many posts')
})

app.post('/posts', (c) => {
  return c.json(
    {
      message: 'Created',
    },
    201,
    {
      'X-Custom': 'Thank you',
    }
  )
})
```

向 `GET /posts` 发出请求并测试响应。

```ts
describe('Example', () => {
  test('GET /posts', async () => {
    const res = await app.request('/posts')
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Many posts')
  })
})
```

要向 `POST /posts` 发出请求，请执行以下操作。

```ts
test('POST /posts', async () => {
  const res = await app.request('/posts', {
    method: 'POST',
  })
  expect(res.status).toBe(201)
  expect(res.headers.get('X-Custom')).toBe('Thank you')
  expect(await res.json()).toEqual({
    message: 'Created',
  })
})
```

要向 `POST /posts` 发出带有 `JSON` 数据的请求，请执行以下操作。

```ts
test('POST /posts', async () => {
  const res = await app.request('/posts', {
    method: 'POST',
    body: JSON.stringify({ message: 'hello hono' }),
    headers: new Headers({ 'Content-Type': 'application/json' }),
  })
  expect(res.status).toBe(201)
  expect(res.headers.get('X-Custom')).toBe('Thank you')
  expect(await res.json()).toEqual({
    message: 'Created',
  })
})
```

要向 `POST /posts` 发出带有 `multipart/form-data` 数据的请求，请执行以下操作。

```ts
test('POST /posts', async () => {
  const formData = new FormData()
  formData.append('message', 'hello')
  const res = await app.request('/posts', {
    method: 'POST',
    body: formData,
  })
  expect(res.status).toBe(201)
  expect(res.headers.get('X-Custom')).toBe('Thank you')
  expect(await res.json()).toEqual({
    message: 'Created',
  })
})
```

你也可以传递 Request 类的实例。

```ts
test('POST /posts', async () => {
  const req = new Request('http://localhost/posts', {
    method: 'POST',
  })
  const res = await app.request(req)
  expect(res.status).toBe(201)
  expect(res.headers.get('X-Custom')).toBe('Thank you')
  expect(await res.json()).toEqual({
    message: 'Created',
  })
})
```

这样，你可以像 End-to-End 一样测试它。

## Env

要为测试设置 `c.env`，你可以将其作为第 3 个参数传递给 `app.request`。这对于模拟 [Cloudflare Workers Bindings](https://hono.dev/getting-started/cloudflare-workers#bindings) 等值很有用：

```ts
const MOCK_ENV = {
  API_HOST: 'example.com',
  DB: {
    prepare: () => {
      /* mocked D1 */
    },
  },
}

test('GET /posts', async () => {
  const res = await app.request('/posts', {}, MOCK_ENV)
})
```
