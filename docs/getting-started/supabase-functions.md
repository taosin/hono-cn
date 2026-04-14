# Supabase Edge Functions

[Supabase](https://supabase.com/) 是 Firebase 的开源替代方案，提供类似 Firebase 功能的一系列工具，包括数据库、身份验证、存储，现在还有无服务器函数。

Supabase Edge Functions 是服务器端 TypeScript 函数，全球分布，在离用户更近的地方运行以提高性能。这些函数使用 [Deno](https://deno.com/) 开发，带来了多种好处，包括改进的安全性和现代 JavaScript/TypeScript runtime。

以下是如何开始使用 Supabase Edge Functions：

## 1. Setup

### Prerequisites

在开始之前，请确保已安装 Supabase CLI。如果尚未安装，请按照 [官方文档](https://supabase.com/docs/guides/cli/getting-started) 中的说明操作。

### Creating a New Project

1. 打开终端或命令提示符。

2. 通过运行以下命令在本地机器上的目录中创建新的 Supabase 项目：

```bash
supabase init

```

此命令在当前目录中初始化新的 Supabase 项目。

### Adding an Edge Function

3. 在 Supabase 项目内，创建名为 `hello-world` 的新 Edge Function：

```bash
supabase functions new hello-world

```

此命令在项目中创建指定名称的新 Edge Function。

## 2. Hello World

通过修改文件 `supabase/functions/hello-world/index.ts` 编辑 `hello-world` 函数：

```ts
import { Hono } from 'jsr:@hono/hono'

// 更改为你的函数名称
const functionName = 'hello-world'
const app = new Hono().basePath(`/${functionName}`)

app.get('/hello', (c) => c.text('Hello from hono-server!'))

Deno.serve(app.fetch)
```

## 3. Run

要本地运行函数，使用以下命令：

1. 使用以下命令提供函数：

```bash
supabase start # 启动 supabase stack
supabase functions serve --no-verify-jwt # 启动 Functions 监视器
```

`--no-verify-jwt` 标志允许你在本地开发期间绕过 JWT 验证。

2. 使用 cURL 或 Postman 向 `http://127.0.0.1:54321/functions/v1/hello-world/hello` 发出 GET 请求：

```bash
curl  --location  'http://127.0.0.1:54321/functions/v1/hello-world/hello'
```

此请求应返回文本 "Hello from hono-server!"。

## 4. Deploy

你可以使用单个命令部署 Supabase 中的所有 Edge Functions：

```bash
supabase functions deploy
```

或者，你可以通过在 deploy 命令中指定函数名称来部署单个 Edge Functions：

```bash
supabase functions deploy hello-world

```

有关更多部署方法，请访问 Supabase 文档的 [Deploying to Production](https://supabase.com/docs/guides/functions/deploy)。
