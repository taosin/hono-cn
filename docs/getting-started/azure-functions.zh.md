# Azure Functions

[Azure Functions](https://azure.microsoft.com/en-us/products/functions) 是 Microsoft Azure 的无服务器平台。你可以运行代码来响应事件，它会自动管理底层计算资源。

Hono 最初并非为 Azure Functions 设计，但使用 [Azure Functions Adapter](https://github.com/Marplex/hono-azurefunc-adapter)，它也可以在 Azure Functions 上运行。

它适用于运行在 Node.js 18 或更高版本上的 Azure Functions **V4**。

## 1. 安装 CLI

要创建 Azure Function，你必须先安装 [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/create-first-function-cli-typescript?pivots=nodejs-model-v4#install-the-azure-functions-core-tools)。

在 macOS 上

```sh
brew tap azure/functions
brew install azure-functions-core-tools@4
```

其他操作系统请参考此链接：

- [Install the Azure Functions Core Tools | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-functions/create-first-function-cli-typescript?pivots=nodejs-model-v4#install-the-azure-functions-core-tools)

## 2. 设置

在当前文件夹中创建 TypeScript Node.js V4 项目。

```sh
func init --typescript
```

更改主机的默认路由前缀。将此属性添加到 `host.json` 的根 JSON 对象：

```json
"extensions": {
    "http": {
        "routePrefix": ""
    }
}
```

::: info
默认的 Azure Functions 路由前缀是 `/api`。如果你不按上述更改，请确保所有 Hono 路由都以 `/api` 开头
:::

现在你可以安装 Hono 和 Azure Functions Adapter：

::: code-group

```sh [npm]
npm i @marplex/hono-azurefunc-adapter hono
```

```sh [yarn]
yarn add @marplex/hono-azurefunc-adapter hono
```

```sh [pnpm]
pnpm add @marplex/hono-azurefunc-adapter hono
```

```sh [bun]
bun add @marplex/hono-azurefunc-adapter hono
```

:::

## 3. Hello World

创建 `src/app.ts`：

```ts
// src/app.ts
import { Hono } from 'hono'
const app = new Hono()

app.get('/', (c) => c.text('Hello Azure Functions!'))

export default app
```

创建 `src/functions/httpTrigger.ts`：

```ts
// src/functions/httpTrigger.ts
import { app } from '@azure/functions'
import { azureHonoHandler } from '@marplex/hono-azurefunc-adapter'
import honoApp from '../app'

app.http('httpTrigger', {
  methods: [
    // 在此添加所有支持的 HTTP 方法
    'GET',
    'POST',
    'DELETE',
    'PUT',
  ],
  authLevel: 'anonymous',
  route: '{*proxy}',
  handler: azureHonoHandler(honoApp.fetch),
})
```

## 4. 运行

在本地运行开发服务器。然后在你的 Web 浏览器中访问 `http://localhost:7071`。

::: code-group

```sh [npm]
npm run start
```

```sh [yarn]
yarn start
```

```sh [pnpm]
pnpm start
```

```sh [bun]
bun run start
```

:::

## 5. 部署

::: info
在部署到 Azure 之前，你需要在云基础设施中创建一些资源。请访问 Microsoft 文档 [Create supporting Azure resources for your function](https://learn.microsoft.com/en-us/azure/azure-functions/create-first-function-cli-typescript?pivots=nodejs-model-v4&tabs=windows%2Cazure-cli%2Cbrowser#create-supporting-azure-resources-for-your-function)
:::

构建项目以进行部署：

::: code-group

```sh [npm]
npm run build
```

```sh [yarn]
yarn build
```

```sh [pnpm]
pnpm build
```

```sh [bun]
bun run build
```

:::

将项目部署到 Azure Cloud 中的函数应用。将 `<YourFunctionAppName>` 替换为你的应用名称。

```sh
func azure functionapp publish <YourFunctionAppName>
```
