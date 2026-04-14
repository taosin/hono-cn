# Google Cloud Run

[Google Cloud Run](https://cloud.google.com/run) 是由 Google Cloud 构建的无服务器平台。你可以在响应事件时运行代码，Google 会自动为你管理底层计算资源。

Google Cloud Run 使用容器来运行你的服务。这意味着你可以通过提供 Dockerfile 来使用任何你喜欢的 runtime（例如，Deno 或 Bun）。如果未提供 Dockerfile，Google Cloud Run 将使用默认的 Node.js buildpack。

本指南假设你已经拥有 Google Cloud 账户和计费账户。

## 1. Install the CLI

当使用 Google Cloud Platform 时，使用 [gcloud CLI](https://cloud.google.com/sdk/docs/install) 最简单。

例如，在 MacOS 上使用 Homebrew：

```sh
brew install --cask gcloud-cli
```

使用 CLI 进行身份验证。

```sh
gcloud auth login
```

## 2. Project setup

创建项目。在提示符处接受自动生成的项目 ID。

```sh
gcloud projects create --set-as-default --name="my app"
```

为你的项目 ID 和项目号创建环境变量以便于重复使用。可能需要约 30 秒后项目才能通过 `gcloud projects list` 命令成功返回。

```sh
PROJECT_ID=$(gcloud projects list \
    --format='value(projectId)' \
    --filter='name="my app"')

PROJECT_NUMBER=$(gcloud projects list \
    --format='value(projectNumber)' \
    --filter='name="my app"')

echo $PROJECT_ID $PROJECT_NUMBER
```

查找你的计费账户 ID。

```sh
gcloud billing accounts list
```

将之前命令中的计费账户添加到项目。

```sh
gcloud billing projects link $PROJECT_ID \
    --billing-account=[billing_account_id]
```

启用所需的 APIs。

```sh
gcloud services enable run.googleapis.com \
    cloudbuild.googleapis.com
```

更新服务账户权限以访问 Cloud Build。

```sh
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com \
    --role=roles/run.builder
```

## 3. Hello World

使用 "create-hono" 命令开始你的项目。选择 `nodejs`。

```sh
npm create hono@latest my-app
```

进入 `my-app` 并安装依赖项。

```sh
cd my-app
npm i
```

将 `src/index.ts` 中的端口更新为 `8080`。

<!-- prettier-ignore -->
```ts
import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

serve({
  fetch: app.fetch,
  port: 3000 // [!code --]
  port: 8080 // [!code ++]
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
```

在本地运行开发服务器。然后在 Web 浏览器中访问 http://localhost:8080。

```sh
npm run dev
```

## 4. Deploy

开始部署并按照交互式提示操作（例如，选择一个 region）。

```sh
gcloud run deploy my-app --source . --allow-unauthenticated
```

## Changing runtimes

如果你想使用 Deno 或 Bun runtimes（或定制的 Nodejs 容器）进行部署，添加一个 `Dockerfile`（可选 `.dockerignore`）与你所需的环境。

有关容器化的信息，请参考：

- [Node.js](/docs/getting-started/nodejs#building-deployment)
- [Bun](https://bun.com/guides/ecosystem/docker)
- [Deno](https://docs.deno.com/examples/google_cloud_run_tutorial)
