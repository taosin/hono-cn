import { defineConfig } from 'vitepress'
import type { DefaultTheme } from 'vitepress'
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
} from 'vitepress-plugin-group-icons'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { createFileSystemTypesCache } from '@shikijs/vitepress-twoslash/cache-fs'

const sidebars = (): DefaultTheme.SidebarItem[] => [
  {
    text: '核心概念',
    collapsed: true,
    items: [
      { text: '简介', link: '/zh/docs/concepts/motivation' },
      { text: '路由系统', link: '/zh/docs/concepts/routers' },
      { text: '性能对比', link: '/zh/docs/concepts/benchmarks' },
      { text: 'Web 标准', link: '/zh/docs/concepts/web-standard' },
      { text: '中间件', link: '/zh/docs/concepts/middleware' },
      {
        text: '开发体验',
        link: '/zh/docs/concepts/developer-experience',
      },
      { text: '技术栈', link: '/zh/docs/concepts/stacks' },
    ],
  },
  {
    text: '快速开始',
    collapsed: true,
    items: [
      { text: '基础用法', link: '/zh/docs/getting-started/basic' },
      {
        text: 'Cloudflare Workers',
        link: '/zh/docs/getting-started/cloudflare-workers',
      },
      {
        text: 'Cloudflare Pages',
        link: '/zh/docs/getting-started/cloudflare-pages',
      },
      { text: 'Deno', link: '/zh/docs/getting-started/deno' },
      { text: 'Bun', link: '/zh/docs/getting-started/bun' },
      {
        text: 'Fastly Compute',
        link: '/zh/docs/getting-started/fastly',
      },
      { text: 'Vercel', link: '/zh/docs/getting-started/vercel' },
      { text: 'Next.js', link: '/zh/docs/getting-started/nextjs' },
      { text: 'Netlify', link: '/zh/docs/getting-started/netlify' },
      {
        text: 'AWS Lambda',
        link: '/zh/docs/getting-started/aws-lambda',
      },
      {
        text: 'Lambda@Edge',
        link: '/zh/docs/getting-started/lambda-edge',
      },
      {
        text: 'Azure Functions',
        link: '/zh/docs/getting-started/azure-functions',
      },
      {
        text: 'Google Cloud Run',
        link: '/zh/docs/getting-started/google-cloud-run',
      },
      {
        text: 'Supabase Functions',
        link: '/zh/docs/getting-started/supabase-functions',
      },
      {
        text: '阿里云函数计算',
        link: '/zh/docs/getting-started/ali-function-compute',
      },
      {
        text: 'WebAssembly',
        link: '/zh/docs/getting-started/webassembly-wasi',
      },
      {
        text: 'Service Worker',
        link: '/zh/docs/getting-started/service-worker',
      },
      { text: 'Node.js', link: '/zh/docs/getting-started/nodejs' },
    ],
  },
  {
    text: 'API',
    collapsed: true,
    items: [
      { text: 'Hono', link: '/zh/docs/api/hono' },
      { text: '路由', link: '/zh/docs/api/routing' },
      { text: 'Context', link: '/zh/docs/api/context' },
      { text: 'HonoRequest', link: '/zh/docs/api/request' },
      { text: '异常处理', link: '/zh/docs/api/exception' },
      { text: '预设', link: '/zh/docs/api/presets' },
    ],
  },
  {
    text: '使用指南',
    collapsed: true,
    items: [
      { text: 'create-hono', link: '/zh/docs/guides/create-hono' },
      { text: '中间件', link: '/zh/docs/guides/middleware' },
      { text: '辅助工具', link: '/zh/docs/guides/helpers' },
      {
        text: 'JSX',
        link: '/zh/docs/guides/jsx',
      },
      {
        text: '客户端组件',
        link: '/zh/docs/guides/jsx-dom',
      },
      { text: '测试', link: '/zh/docs/guides/testing' },
      {
        text: '验证',
        link: '/zh/docs/guides/validation',
      },
      {
        text: 'RPC',
        link: '/zh/docs/guides/rpc',
      },
      {
        text: '最佳实践',
        link: '/zh/docs/guides/best-practices',
      },
      {
        text: '其他',
        link: '/zh/docs/guides/others',
      },
      {
        text: '常见问题',
        link: '/zh/docs/guides/faq',
      },
    ],
  },
  {
    text: '辅助工具',
    collapsed: true,
    items: [
      { text: 'Accepts', link: '/zh/docs/helpers/accepts' },
      { text: 'Adapter', link: '/zh/docs/helpers/adapter' },
      { text: 'ConnInfo', link: '/zh/docs/helpers/conninfo' },
      { text: 'Cookie', link: '/zh/docs/helpers/cookie' },
      { text: 'css', link: '/zh/docs/helpers/css' },
      { text: 'Dev', link: '/zh/docs/helpers/dev' },
      { text: 'Factory', link: '/zh/docs/helpers/factory' },
      { text: 'html', link: '/zh/docs/helpers/html' },
      { text: 'JWT', link: '/zh/docs/helpers/jwt' },
      { text: 'Proxy', link: '/zh/docs/helpers/proxy' },
      { text: 'Route', link: '/zh/docs/helpers/route' },
      { text: 'SSG', link: '/zh/docs/helpers/ssg' },
      { text: 'Streaming', link: '/zh/docs/helpers/streaming' },
      { text: 'Testing', link: '/zh/docs/helpers/testing' },
      { text: 'WebSocket', link: '/zh/docs/helpers/websocket' },
    ],
  },
  {
    text: '中间件',
    collapsed: true,
    items: [
      {
        text: '基础认证',
        link: '/zh/docs/middleware/builtin/basic-auth',
      },
      {
        text: 'Bearer 认证',
        link: '/zh/docs/middleware/builtin/bearer-auth',
      },
      {
        text: '请求体限制',
        link: '/zh/docs/middleware/builtin/body-limit',
      },
      { text: '缓存', link: '/zh/docs/middleware/builtin/cache' },
      { text: '合并', link: '/zh/docs/middleware/builtin/combine' },
      { text: '压缩', link: '/zh/docs/middleware/builtin/compress' },
      {
        text: '上下文存储',
        link: '/zh/docs/middleware/builtin/context-storage',
      },
      { text: 'CORS', link: '/zh/docs/middleware/builtin/cors' },
      {
        text: 'CSRF 保护',
        link: '/zh/docs/middleware/builtin/csrf',
      },
      { text: 'ETag', link: '/zh/docs/middleware/builtin/etag' },
      {
        text: 'IP 限制',
        link: '/zh/docs/middleware/builtin/ip-restriction',
      },
      {
        text: 'JSX 渲染器',
        link: '/zh/docs/middleware/builtin/jsx-renderer',
      },
      { text: 'JWK', link: '/zh/docs/middleware/builtin/jwk' },
      { text: 'JWT', link: '/zh/docs/middleware/builtin/jwt' },
      { text: '日志', link: '/zh/docs/middleware/builtin/logger' },
      { text: '语言', link: '/zh/docs/middleware/builtin/language' },
      {
        text: '方法重写',
        link: '/zh/docs/middleware/builtin/method-override',
      },
      {
        text: '美化 JSON',
        link: '/zh/docs/middleware/builtin/pretty-json',
      },
      {
        text: '请求 ID',
        link: '/zh/docs/middleware/builtin/request-id',
      },
      {
        text: '安全头',
        link: '/zh/docs/middleware/builtin/secure-headers',
      },
      { text: '超时', link: '/zh/docs/middleware/builtin/timeout' },
      { text: '计时', link: '/zh/docs/middleware/builtin/timing' },
      {
        text: '尾随斜杠',
        link: '/zh/docs/middleware/builtin/trailing-slash',
      },
      {
        text: '第三方中间件',
        link: '/zh/docs/middleware/third-party',
      },
    ],
  },
]

export const sidebarsExamples = (): DefaultTheme.SidebarItem[] => [
  {
    text: '应用示例',
    items: [
      {
        text: 'Web API',
        link: '/zh/examples/web-api',
      },
      {
        text: '代理',
        link: '/zh/examples/proxy',
      },
      {
        text: '文件上传',
        link: '/zh/examples/file-upload',
      },
      {
        text: '反向代理',
        link: '/zh/examples/behind-reverse-proxy',
      },
      {
        text: '验证器错误处理',
        link: '/zh/examples/validator-error-handling',
      },
      {
        text: 'RPC 路由分组',
        link: '/zh/examples/grouping-routes-rpc',
      },
      {
        text: 'CBOR',
        link: '/zh/examples/cbor',
      },
    ],
  },
  {
    text: '第三方中间件',
    items: [
      {
        text: 'Zod OpenAPI',
        link: '/zh/examples/zod-openapi',
      },
      {
        text: 'Hono OpenAPI',
        link: '/zh/examples/hono-openapi',
      },
      {
        text: 'Swagger UI',
        link: '/zh/examples/swagger-ui',
      },
      {
        text: 'Scalar',
        link: '/zh/examples/scalar',
      },
      {
        text: 'Hono 文档生成器',
        link: '/zh/examples/hono-docs',
      },
    ],
  },
  {
    text: '集成',
    items: [
      {
        text: 'Cloudflare Durable Objects',
        link: '/zh/examples/cloudflare-durable-objects',
      },
      {
        text: 'Cloudflare Queue',
        link: '/zh/examples/cloudflare-queue',
      },
      {
        text: 'Cloudflare 测试',
        link: '/zh/examples/cloudflare-vitest',
      },
      {
        text: 'Remix',
        link: '/zh/examples/with-remix',
      },
      {
        text: 'htmx',
        link: '/zh/examples/htmx',
      },
      {
        text: 'Stripe Webhook',
        link: '/zh/examples/stripe-webhook',
      },
      {
        text: 'Prisma',
        link: '/zh/examples/prisma',
      },
      {
        text: 'Better Auth',
        link: '/zh/examples/better-auth',
      },
      {
        text: 'Better Auth on Cloudflare',
        link: '/zh/examples/better-auth-on-cloudflare',
      },
      {
        text: 'Pylon (GraphQL)',
        link: '/zh/examples/pylon',
      },
      {
        text: 'Stytch 认证',
        link: '/zh/examples/stytch-auth',
      },
      {
        text: 'Auth.js',
        link: '/zh/examples/hono-authjs',
      },
      {
        text: 'Apitally (监控)',
        link: '/zh/examples/apitally',
      },
    ],
  },
]

export default defineConfig({
  lang: 'zh-CN',
  title: 'Hono',
  description:
    '基于 Web 标准构建的 Web 框架，适用于 Cloudflare Workers、Fastly Compute、Deno、Bun、Vercel、Node.js 等平台。快速，但不止于快速。',
  lastUpdated: true,
  ignoreDeadLinks: true,
  cleanUrls: true,
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    config(md) {
      md.use(groupIconMdPlugin)
    },
    codeTransformers: [
      transformerTwoslash({
        typesCache: createFileSystemTypesCache(),
      }),
    ],
  },
  themeConfig: {
    logo: '/images/logo.svg',
    siteTitle: 'Hono',
    algolia: {
      appId: '1GIFSU1REV',
      apiKey: 'c6a0f86b9a9f8551654600f28317a9e9',
      indexName: 'hono',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/honojs' },
      { icon: 'discord', link: 'https://discord.gg/KMh2eNSdxV' },
      { icon: 'x', link: 'https://x.com/honojs' },
      { icon: 'bluesky', link: 'https://bsky.app/profile/hono.dev' },
    ],
    editLink: {
      pattern: 'https://github.com/taosin/hono-cn/edit/main/:path',
      text: '在 GitHub 上编辑此页面',
    },
    footer: {
      message: '基于 MIT 许可证发布',
      copyright:
        '版权所有 © 2022-present Yusuke Wada & Hono 贡献者。"kawaii" logo 由 SAWARATSUKI 创作。',
    },
    nav: [
      { text: '文档', link: '/zh/docs/' },
      { text: '示例', link: '/zh/examples/' },
      {
        text: '讨论区',
        link: 'https://github.com/orgs/honojs/discussions',
      },
    ],
    sidebar: {
      '/zh/': sidebars(),
      '/zh/examples/': sidebarsExamples(),
    },
  },
  head: [
    [
      'meta',
      {
        property: 'og:image',
        content: 'https://hono.dev/images/hono-title.png',
      },
    ],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'twitter:domain', content: 'hono.dev' }],
    [
      'meta',
      {
        property: 'twitter:image',
        content: 'https://hono.dev/images/hono-title.png',
      },
    ],
    [
      'meta',
      { property: 'twitter:card', content: 'summary_large_image' },
    ],
    ['link', { rel: 'shortcut icon', href: '/favicon.ico' }],
  ],
  titleTemplate: ':title - Hono',
  vite: {
    plugins: [
      groupIconVitePlugin({
        customIcon: {
          cloudflare: 'logos:cloudflare-workers-icon',
        },
      }),
    ],
    server: {
      allowedHosts: true,
    },
  },
})
