# ConnInfo 辅助工具

ConnInfo 辅助工具有助于你获取连接信息。例如，你可以轻松获取客户端的远程地址。

## 导入

::: code-group

```ts [Cloudflare Workers]
import { Hono } from 'hono'
import { getConnInfo } from 'hono/cloudflare-workers'
```

```ts [Deno]
import { Hono } from 'hono'
import { getConnInfo } from 'hono/deno'
```

```ts [Bun]
import { Hono } from 'hono'
import { getConnInfo } from 'hono/bun'
```

```ts [Vercel]
import { Hono } from 'hono'
import { getConnInfo } from 'hono/vercel'
```

```ts [AWS Lambda]
import { Hono } from 'hono'
import { getConnInfo } from 'hono/aws-lambda'
```

```ts [Cloudflare Pages]
import { Hono } from 'hono'
import { getConnInfo } from 'hono/cloudflare-pages'
```

```ts [Netlify]
import { Hono } from 'hono'
import { getConnInfo } from 'hono/netlify'
```

```ts [Lambda@Edge]
import { Hono } from 'hono'
import { getConnInfo } from 'hono/lambda-edge'
```

```ts [Node.js]
import { Hono } from 'hono'
import { getConnInfo } from '@hono/node-server/conninfo'
```

:::

## 用法

```ts
const app = new Hono()

app.get('/', (c) => {
  const info = getConnInfo(c) // info 是 `ConnInfo`
  return c.text(`Your remote address is ${info.remote.address}`)
})
```

## 类型定义

你可以从 `getConnInfo()` 获取的值的类型定义如下：

```ts
type AddressType = 'IPv6' | 'IPv4' | undefined

type NetAddrInfo = {
  /**
   * 传输协议类型
   */
  transport?: 'tcp' | 'udp'
  /**
   * 传输端口号
   */
  port?: number

  address?: string
  addressType?: AddressType
} & (
  | {
      /**
       * 主机名（如 IP 地址）
       */
      address: string

      /**
       * 主机名类型
       */
      addressType: AddressType
    }
  | {}
)

/**
 * HTTP 连接信息
 */
interface ConnInfo {
  /**
   * 远程信息
   */
  remote: NetAddrInfo
}
```
