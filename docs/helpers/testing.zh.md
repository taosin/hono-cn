# Testing 辅助工具

Testing 辅助工具提供函数，使 Hono 应用程序的测试更容易。

## 导入

```ts
import { Hono } from 'hono'
import { testClient } from 'hono/testing'
```

## `testClient()`

`testClient()` 函数将 Hono 实例作为第一个参数，并返回根据 Hono 应用程序的路由进行类型化的对象，类似于 [Hono Client](/docs/guides/rpc#client)。这允许你在测试中以类型安全的方式调用已定义的路由，并具有编辑器自动完成功能。

**关于类型推断的重要说明：**

为了让 `testClient` 正确推断路由类型并提供自动完成，**你必须使用链接方法直接在 `Hono` 实例上定义路由**。

类型推断依赖于类型通过链接的 `.get()`、`.post()` 等调用流动。如果你在创建 Hono 实例后单独定义路由（如 "Hello World" 示例中显示的常见模式：`const app = new Hono(); app.get(...)`），`testClient` 将没有特定路由的必要类型信息，你将无法获得类型安全的客户端功能。

**示例：**

此示例有效，因为 `.get()` 方法直接链接到 `new Hono()` 调用：

```ts
// index.ts
const app = new Hono().get('/search', (c) => {
  const query = c.req.query('q')
  return c.json({ query: query, results: ['result1', 'result2'] })
})

export default app
```

```ts
// index.test.ts
import { Hono } from 'hono'
import { testClient } from 'hono/testing'
import { describe, it, expect } from 'vitest' // 或你首选的测试运行器
import app from './app'

describe('Search Endpoint', () => {
  // 从应用程序实例创建测试客户端
  const client = testClient(app)

  it('should return search results', async () => {
    // 使用类型化客户端调用端点
    // 注意查询参数的类型安全性（如果在路由中定义）
    // 以及通过 .$get() 直接访问
    const res = await client.search.$get({
      query: { q: 'hono' },
    })

    // 断言
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      query: 'hono',
      results: ['result1', 'result2'],
    })
  })
})
```

要在测试中包含 headers，请将它们作为调用中的第二个参数传递。第二个参数还可以将 `init` 属性作为 `RequestInit` 对象，允许你设置 headers、method、body 等。在此处了解有关 `init` 属性的更多信息 [here](/docs/guides/rpc#init-option)。

```ts
// index.test.ts
import { Hono } from 'hono'
import { testClient } from 'hono/testing'
import { describe, it, expect } from 'vitest' // 或你首选的测试运行器
import app from './app'

describe('Search Endpoint', () => {
  // 从应用程序实例创建测试客户端
  const client = testClient(app)

  it('should return search results', async () => {
    // 在 headers 中包含令牌并设置内容类型
    const token = 'this-is-a-very-clean-token'
    const res = await client.search.$get(
      {
        query: { q: 'hono' },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `application/json`,
        },
      }
    )

    // 断言
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      query: 'hono',
      results: ['result1', 'result2'],
    })
  })
})
```
