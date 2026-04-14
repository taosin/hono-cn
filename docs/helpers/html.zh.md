# html 辅助工具

html 辅助工具让你可以在名为 `html` 的 JavaScript 模板字面量中编写 HTML。使用 `raw()`，内容将按原样渲染。你必须自己转义这些字符串。

## 导入

```ts
import { Hono } from 'hono'
import { html, raw } from 'hono/html'
```

## `html`

```ts
const app = new Hono()

app.get('/:username', (c) => {
  const { username } = c.req.param()
  return c.html(
    html`<!doctype html>
      <h1>Hello! ${username}!</h1>`
  )
})
```

### 将代码片段插入 JSX

将内联脚本插入 JSX：

```tsx
app.get('/', (c) => {
  return c.html(
    <html>
      <head>
        <title>Test Site</title>
        {html`
          <script>
            // 无需使用 dangerouslySetInnerHTML。
            // 如果你写在这里，它不会被转义。
          </script>
        `}
      </head>
      <body>Hello!</body>
    </html>
  )
})
```

### 作为功能组件

由于 `html` 返回 HtmlEscapedString，它可以作为完全功能组件而无需使用 JSX。

#### 使用 `html` 来加速处理而不是 `memo`

```typescript
const Footer = () => html`
  <footer>
    <address>My Address...</address>
  </footer>
`
```

### 接收 props 并嵌入值

```typescript
interface SiteData {
  title: string
  description: string
  image: string
  children?: any
}
const Layout = (props: SiteData) => html`
<html>
<head>
  <meta charset="UTF-8">
  <title>${props.title}</title>
  <meta name="description" content="${props.description}">
  <head prefix="og: http://ogp.me/ns#">
  <meta property="og:type" content="article">
  <!-- 更多元素会减慢 JSX，但不会减慢模板字面量。 -->
  <meta property="og:title" content="${props.title}">
  <meta property="og:image" content="${props.image}">
</head>
<body>
  ${props.children}
</body>
</html>
`

const Content = (props: { siteData: SiteData; name: string }) => (
  <Layout {...props.siteData}>
    <h1>Hello {props.name}</h1>
  </Layout>
)

app.get('/', (c) => {
  const props = {
    name: 'World',
    siteData: {
      title: 'Hello <> World',
      description: 'This is a description',
      image: 'https://example.com/image.png',
    },
  }
  return c.html(<Content {...props} />)
})
```

## `raw()`

```ts
app.get('/', (c) => {
  const name = 'John &quot;Johnny&quot; Smith'
  return c.html(html`<p>I'm ${raw(name)}.</p>`)
})
```

## 技巧

由于这些库，Visual Studio Code 和 vim 也将模板字面量解释为 HTML，允许应用语法高亮和格式化。

- <https://marketplace.visualstudio.com/items?itemName=bierner.lit-html>
- <https://github.com/MaxMEllon/vim-jsx-pretty>
