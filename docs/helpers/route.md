# Route 辅助工具

Route 辅助工具为调试和中间件开发提供增强的路由信息。它允许你访问有关匹配路由和当前正在处理的路由的详细信息。

## 导入

```ts
import { Hono } from 'hono'
import {
  matchedRoutes,
  routePath,
  baseRoutePath,
  basePath,
} from 'hono/route'
```

## 用法

### 基本路由信息

```ts
const app = new Hono()

app.get('/posts/:id', (c) => {
  const currentPath = routePath(c) // '/posts/:id'
  const routes = matchedRoutes(c) // 匹配路由的数组

  return c.json({
    path: currentPath,
    totalRoutes: routes.length,
  })
})
```

### 与子应用程序一起使用

```ts
const app = new Hono()
const apiApp = new Hono()

apiApp.get('/posts/:id', (c) => {
  return c.json({
    routePath: routePath(c), // '/posts/:id'
    baseRoutePath: baseRoutePath(c), // '/api'
    basePath: basePath(c), // '/api'（带有实际参数）
  })
})

app.route('/api', apiApp)
```

## `matchedRoutes()`

返回与当前请求匹配的所有路由的数组，包括中间件。

```ts
app.all('/api/*', (c, next) => {
  console.log('API middleware')
  return next()
})

app.get('/api/users/:id', (c) => {
  const routes = matchedRoutes(c)
  // 返回：[
  //   { method: 'ALL', path: '/api/*', handler: [Function] },
  //   { method: 'GET', path: '/api/users/:id', handler: [Function] }
  // ]
  return c.json({ routes: routes.length })
})
```

## `routePath()`

返回为当前 handler 注册的路由路径模式。

```ts
app.get('/posts/:id', (c) => {
  console.log(routePath(c)) // '/posts/:id'
  return c.text('Post details')
})
```

### 与 index 参数一起使用

你可以选择传递 index 参数来获取特定位置的路由路径，类似于 `Array.prototype.at()`。

```ts
app.all('/api/*', (c, next) => {
  return next()
})

app.get('/api/users/:id', (c) => {
  console.log(routePath(c, 0)) // '/api/*'（第一个匹配的路由）
  console.log(routePath(c, -1)) // '/api/users/:id'（最后一个匹配的路由）
  return c.text('User details')
})
```

## `baseRoutePath()`

返回当前路由在路由中指定的基础路径模式。

```ts
const subApp = new Hono()
subApp.get('/posts/:id', (c) => {
  return c.text(baseRoutePath(c)) // '/:sub'
})

app.route('/:sub', subApp)
```

### 与 index 参数一起使用

你可以选择传递 index 参数来获取特定位置的基础路由路径，类似于 `Array.prototype.at()`。

```ts
app.all('/api/*', (c, next) => {
  return next()
})

const subApp = new Hono()
subApp.get('/users/:id', (c) => {
  console.log(baseRoutePath(c, 0)) // '/'（第一个匹配的路由）
  console.log(baseRoutePath(c, -1)) // '/api'（最后一个匹配的路由）
  return c.text('User details')
})

app.route('/api', subApp)
```

## `basePath()`

返回来自实际请求的带有嵌入式参数的基础路径。

```ts
const subApp = new Hono()
subApp.get('/posts/:id', (c) => {
  return c.text(basePath(c)) // '/api'（对于对 '/api/posts/123' 的请求）
})

app.route('/:sub', subApp)
```
