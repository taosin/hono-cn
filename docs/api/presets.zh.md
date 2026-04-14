# Presets

Hono 有多个 routers，每个都针对特定用途设计。你可以在 Hono 的构造函数中指定要使用的 router。

**Presets** 为常见用例提供，因此你不必每次都指定 router。从所有 presets 导入的 `Hono` 类是相同的，唯一区别在于 router。因此，你可以互换使用它们。

## `hono`

用法：

```ts twoslash
import { Hono } from 'hono'
```

Routers：

```ts
this.router = new SmartRouter({
  routers: [new RegExpRouter(), new TrieRouter()],
})
```

## `hono/quick`

用法：

```ts twoslash
import { Hono } from 'hono/quick'
```

Router：

```ts
this.router = new SmartRouter({
  routers: [new LinearRouter(), new TrieRouter()],
})
```

## `hono/tiny`

用法：

```ts twoslash
import { Hono } from 'hono/tiny'
```

Router：

```ts
this.router = new PatternRouter()
```

## Which preset should I use?

| Preset       | 适用平台                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `hono`       | 这在大多数用例中强烈推荐。虽然注册阶段可能比 `hono/quick` 慢，但一旦启动就会表现出高性能。它非常适合用 **Deno**、**Bun** 或 **Node.js** 构建的长生命周期服务器。它也适合 **Fastly Compute**，因为在该平台上路由注册发生在应用程序构建阶段。对于 **Cloudflare Workers**、**Deno Deploy** 等使用 v8 isolates 的环境，这个 preset 也合适。因为 isolates 在启动后会持续一段时间。 |
| `hono/quick` | 这个 preset 专为每次请求都初始化应用程序的环境设计。                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `hono/tiny`  | 这是最小的 router 包，适合资源有限的环境。                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
