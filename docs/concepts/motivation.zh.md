# Philosophy

在本节中，我们讨论 Hono 的概念或哲学。

## Motivation

起初，我只是想在 Cloudflare Workers 上创建一个 web 应用程序。但是，没有适用于 Cloudflare Workers 的好框架。所以我开始构建 Hono。

我认为这将是一个学习如何使用 Trie 树构建 router 的好机会。然后一个朋友出现了，带来了超快的 router，叫做 "RegExpRouter"。我还有一个朋友创建了 Basic authentication middleware。

仅使用 Web Standard APIs，我们就可以让它在 Deno 和 Bun 上工作。当人们问"有 Bun 的 Express 吗？"时，我们可以回答："没有，但有 Hono"。（虽然 Express 现在可以在 Bun 上工作。）

我们还有朋友制作 GraphQL servers、Firebase authentication 和 Sentry middleware。我们还有一个 Node.js adapter。生态系统已经兴起。

换句话说，Hono 非常快，使很多事情成为可能，并且可以在任何地方工作。我们可以想象 Hono 可能成为 **Web Standards 的标准**。
