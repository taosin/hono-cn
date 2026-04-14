# WebAssembly (w/ WASI)

[WebAssembly][wasm-core] 是一个安全、沙盒化、可移植的 runtime，在 web 浏览器内外运行。

实际上：

- 语言（如 JavaScript）_编译为_ WebAssembly（`.wasm` 文件）
- WebAssembly runtimes（如 [`wasmtime`][wasmtime] 或 [`jco`][jco]）启用_运行_ WebAssembly 二进制文件

虽然核心 WebAssembly _无法_ 访问本地文件系统或套接字等，但 [WebAssembly System Interface][wasi] 介入以在 WebAssembly 工作负载下定义平台。

这意味着使用 WASI，WebAssembly 可以操作文件、套接字等更多内容。

::: info
想自己查看 WASI 接口？查看 [`wasi:http`][wasi-http]
:::

JS 中对 WebAssembly w/ WASI 的支持由 [StarlingMonkey][sm] 提供支持，得益于 StarlingMonkey 和 Hono 中对 Web standards 的关注，**Hono 可以在启用 WASI 的 WebAssembly 生态系统中开箱即用。**

[sm]: https://github.com/bytecodealliance/StarlingMonkey
[wasm-core]: https://webassembly.org/
[wasi]: https://wasi.dev/
[bca]: https://bytecodealliance.org/
[wasi-http]: https://github.com/WebAssembly/wasi-http

## 1. Setup

WebAssembly JS 生态系统提供工具来轻松开始构建启用 WASI 的 WebAssembly 组件：

- [StarlingMonkey][sm] 是 [SpiderMonkey][spidermonkey] 的分叉，编译为 WebAssembly 并启用组件
- [`componentize-js`][componentize-js] 将 JavaScript ES 模块转换为 WebAssembly 组件
- [`jco`][jco] 是一个多工具，构建组件、生成类型并在 Node.js 或浏览器等环境中运行组件

::: info
WebAssembly 有一个开放的生态系统并且是开源的，核心项目主要由 [Bytecode Alliance][bca] 及其成员管理。

新功能、问题、pull requests 和其他类型的贡献总是受欢迎的。
:::

虽然 Hono on WebAssembly 的 starter 还不可用，但你可以像其他任何项目一样启动 WebAssembly Hono 项目：

::: code-group

```sh [npm]
mkdir my-app
cd my-app
npm init
npm i hono
npm i -D @bytecodealliance/jco @bytecodealliance/componentize-js @bytecodealliance/jco-std
npm i -D rolldown
```

````sh [yarn]
mkdir my-app
cd my-app
npm init
yarn add hono
yarn add -D @bytecodealliance/jco @bytecodealliance/componentize-js @bytecodealliance/jco-std
yarn add -D rolldown
G```

```sh [pnpm]
mkdir my-app
cd my-app
pnpm init --init-type module
pnpm add hono
pnpm add -D @bytecodealliance/jco @bytecodealliance/componentize-js @bytecodealliance/jco-std
pnpm add -D rolldown
````

```sh [bun]
mkdir my-app
cd my-app
npm init
bun add hono
bun add -D @bytecodealliance/jco @bytecodealliance/componentize-js @bytecodealliance/jco-std
```

:::

::: info
为确保你的项目使用 ES 模块，确保 `package.json` 中的 `type` 设置为 `"module"`
:::

进入 `my-app` 文件夹后，安装依赖项并初始化 TypeScript：

::: code-group

```sh [npm]
npm i
npx tsc --init
```

```sh [yarn]
yarn
yarn tsc --init
```

```sh [pnpm]
pnpm i
pnpm exec --init
```

```sh [bun]
bun i
```

:::

一旦有了基本的 TypeScript 配置文件（`tsconfig.json`），请确保它有以下配置：

- `compilerOptions.module` 设置为 `"nodenext"`

由于 `componentize-js`（以及重用它的 `jco`）仅支持单个 JS 文件，因此需要捆绑，所以可以使用 [`rolldown`][rolldown] 创建单个文件捆绑包。

可以使用以下 Rolldown 配置（`rolldown.config.mjs`）：

```js
import { defineConfig } from 'rolldown'

export default defineConfig({
  input: 'src/component.ts',
  external: /wasi:.*/,
  output: {
    file: 'dist/component.js',
    format: 'esm',
  },
})
```

::: info
随意使用你更舒服的任何其他捆绑工具（`rolldown`、`esbuild`、`rollup` 等）
:::

[jco]: https://github.com/bytecodealliance/jco
[componentize-js]: https://github.com/bytecodealliance/componentize-js
[rolldown]: https://rolldown.rs
[spidermonkey]: https://spidermonkey.dev/

## 2. Set up WIT interface & dependencies

[WebAssembly Interface Types (WIT)][wit] 是一个接口定义语言（"IDL"），规定了 WebAssembly 组件使用的功能（"imports"）和提供的功能（"exports"）。

在标准化的 WIT 接口中，[`wasi:http`][wasi-http] 用于处理 HTTP 请求（无论是接收还是发送），由于我们打算制作一个 web 服务器，我们的组件必须在其 [WIT world][wit-world] 中声明使用 `wasi:http/incoming-handler`：

首先，让我们在名为 `wit/component.wit` 的文件中设置组件的 WIT world：

```txt
package example:hono;

world component {
    export wasi:http/incoming-handler@0.2.6;
}
```

简单来说，上面的 WIT 文件意味着我们的组件"提供""接收"/"处理传入"HTTP 请求的功能。

`wasi:http/incoming-handler` 接口依赖于上游标准化的 WIT 接口（关于请求结构等的规范）。

要拉取那些第三方（由 Bytecode Alliance 维护）的 WIT 接口，我们可以使用的一个工具是 [`wkg`][wkg]：

```sh
wkg wit fetch
```

一旦 `wkg` 运行完成，你应该会发现你的 `wit` 文件夹中除了 `component.wit` 之外还有一个新的 `deps` 文件夹：

```
wit
├── component.wit
└── deps
    ├── wasi-cli-0.2.6
    │   └── package.wit
    ├── wasi-clocks-0.2.6
    │   └── package.wit
    ├── wasi-http-0.2.6
    │   └── package.wit
    ├── wasi-io-0.2.6
    │   └── package.wit
    └── wasi-random-0.2.6
        └── package.wit
```

[wkg]: https://github.com/bytecodealliance/wasm-pkg-tools
[wit-world]: https://github.com/WebAssembly/component-model/blob/main/design/mvp/WIT.md#wit-worlds
[wit]: https://github.com/WebAssembly/component-model/blob/main/design/mvp/WIT.md

## 3. Hello Wasm

要在 WebAssembly 中构建 HTTP 服务器，我们可以利用 [`jco-std`][jco-std] 项目，它包含的 helpers 使体验与标准 Hono 体验非常相似。

让我们在名为 `src/component.ts` 的文件中用基本的 Hono 应用程序作为 WebAssembly 组件来实现我们的 `component` world：

```ts
import { Hono } from 'hono'
import { fire } from '@bytecodealliance/jco-std/wasi/0.2.6/http/adapters/hono/server'

const app = new Hono()

app.get('/hello', (c) => {
  return c.json({ message: 'Hello from WebAssembly!' })
})

fire(app)

// 虽然我们上面已经使用 wasi HTTP 调用了 `fire()`，
// 但我们仍然需要实际导出 `wasi:http/incoming-handler` 接口对象，
// 因为 jco 和 componentize-js 将寻找匹配 WASI 接口的 ES 模块导出。
export { incomingHandler } from '@bytecodealliance/jco-std/wasi/0.2.6/http/adapters/hono/server'
```

## 4. Build

由于我们使用 Rolldown（并且它配置为处理 TypeScript 编译），我们可以使用它来构建和捆绑：

::: code-group

```sh [npm]
npx rolldown -c
```

```sh [yarn]
yarn rolldown -c
```

```sh [pnpm]
pnpm exec rolldown -c
```

```sh [bun]
bun build --target=bun --outfile=dist/component.js ./src/component.ts
```

:::

::: info
捆绑步骤是必要的，因为 WebAssembly JS 生态系统工具目前仅支持单个 JS 文件，我们想包含 Hono 以及相关库。

对于要求更简单的组件，捆绑器不是必需的。
:::

要构建你的 WebAssembly 组件，使用 `jco`（间接使用 `componentize-js`）：

::: code-group

```sh [npm]
npx jco componentize -w wit -o dist/component.wasm dist/component.js
```

```sh [yarn]
yarn jco componentize -w wit -o dist/component.wasm dist/component.js
```

```sh [pnpm]
pnpm exec jco componentize -w wit -o dist/component.wasm dist/component.js
```

```sh [bun]
bun run jco componentize -w wit -o dist/component.wasm dist/component.js
```

:::

## 5. Run

要运行你的 Hono WebAssembly HTTP 服务器，你可以使用任何启用 WASI 的 WebAssembly runtime：

- [`wasmtime`][wasmtime]
- `jco`（在 Node.js 中运行）

在本指南中，我们将使用 `jco serve`，因为它已经安装。

::: warning
`jco serve` 用于开发，不推荐用于生产环境。
:::

[wasmtime]: https://wasmtime.dev

::: code-group

```sh [npm]
npx jco serve dist/component.wasm
```

```sh [yarn]
yarn jco serve dist/component.wasm
```

```sh [pnpm]
pnpm exec jco serve dist/component.wasm
```

```sh [bun]
bun run jco serve dist/component.wasm
```

:::

你应该看到如下输出：

```
$ npx jco serve dist/component.wasm
Server listening @ localhost:8000...
```

向 `localhost:8000/hello` 发送请求将产生你在 Hono 应用程序中指定的 JSON 输出。

你应该看到如下输出：

```json
{ "message": "Hello from WebAssembly!" }
```

::: info
`jco serve` 通过将 WebAssembly 组件转换为基本的 WebAssembly coremodule 来工作，以便它可以在 Node.js 和浏览器等 runtimes 中运行。

这个过程通常通过 `jco transpile` 运行，这是我们可以在 JS 引擎（如 Node.js 和浏览器，可能使用 V8 或其他 Javascript 引擎）作为 WebAssembly Component runtimes 的方式。

`jco transpile` 如何工作超出了本指南的范围，你可以在 [the Jco book][jco-book] 中阅读更多相关信息
:::

## More information

要了解更多关于 WASI、WebAssembly 组件等更多信息，请查看以下资源：

- [BytecodeAlliance Component Model book][cm-book]
- [`jco` codebase][jco]
  - [`jco` example components][jco-example-components]（特别是 [Hono example][jco-example-component-hono]）
- [Jco book][jco-book]
- [`componentize-js` codebase][componentize-js]
- [StarlingMonkey codebase][sm]

要与 WebAssembly 社区联系，提出问题、评论、贡献或提交问题：

- [Bytecode Alliance Zulip](https://bytecodealliance.zulipchat.com)（考虑在 [#jco channel](https://bytecodealliance.zulipchat.com/#narrow/channel/409526-jco) 中发帖）
- [Jco repository](https://github.com/bytecodealliance/jco)
- [componentize-js repository](https://github.com/bytecodealliance/componentize-js)

[cm-book]: https://component-model.bytecodealliance.org/
[jco-book]: https://bytecodealliance.github.io/jco/
[jco-example-components]: https://github.com/bytecodealliance/jco/tree/main/examples/components
[jco-example-component-hono]: https://github.com/bytecodealliance/jco/tree/main/examples/components/http-server-hono
