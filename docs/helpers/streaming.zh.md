# Streaming 辅助工具

Streaming 辅助工具提供用于流式响应的方法。

## 导入

```ts
import { Hono } from 'hono'
import { stream, streamText, streamSSE } from 'hono/streaming'
```

## `stream()`

它返回简单的流式响应作为 `Response` 对象。

```ts
app.get('/stream', (c) => {
  return stream(c, async (stream) => {
    // 写入中止时执行的过程。
    stream.onAbort(() => {
      console.log('Aborted!')
    })
    // 写入 Uint8Array。
    await stream.write(new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]))
    // 管道可读流。
    await stream.pipe(anotherReadableStream)
  })
})
```

## `streamText()`

它返回带有 `Content-Type:text/plain`、`Transfer-Encoding:chunked` 和 `X-Content-Type-Options:nosniff` headers 的流式响应。

```ts
app.get('/streamText', (c) => {
  return streamText(c, async (stream) => {
    // 写入带有新行 ('\n') 的文本。
    await stream.writeln('Hello')
    // 等待 1 秒。
    await stream.sleep(1000)
    // 写入不带新行的文本。
    await stream.write(`Hono!`)
  })
})
```

::: warning

如果你正在为 Cloudflare Workers 开发应用程序，流式可能在 Wrangler 上无法正常工作。如果是这样，请为 `Content-Encoding` header 添加 `Identity`。

```ts
app.get('/streamText', (c) => {
  c.header('Content-Encoding', 'Identity')
  return streamText(c, async (stream) => {
    // ...
  })
})
```

:::

## `streamSSE()`

它允许你无缝流式传输 Server-Sent Events (SSE)。

```ts
const app = new Hono()
let id = 0

app.get('/sse', async (c) => {
  return streamSSE(c, async (stream) => {
    while (true) {
      const message = `It is ${new Date().toISOString()}`
      await stream.writeSSE({
        data: message,
        event: 'time-update',
        id: String(id++),
      })
      await stream.sleep(1000)
    }
  })
})
```

## 错误处理

流式辅助工具的第三个参数是错误处理器。
此参数是可选的，如果你不指定它，错误将作为控制台错误输出。

```ts
app.get('/stream', (c) => {
  return stream(
    c,
    async (stream) => {
      // 写入中止时执行的过程。
      stream.onAbort(() => {
        console.log('Aborted!')
      })
      // 写入 Uint8Array。
      await stream.write(
        new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f])
      )
      // 管道可读流。
      await stream.pipe(anotherReadableStream)
    },
    (err, stream) => {
      stream.writeln('An error occurred!')
      console.error(err)
    }
  )
})
```

流将在回调执行后自动关闭。

::: warning

如果流式辅助工具的回调函数抛出错误，Hono 的 `onError` 事件将不会触发。

`onError` 是在发送响应之前处理错误并覆盖响应的钩子。但是，当回调函数执行时，流式已经开始，因此无法覆盖。

:::
