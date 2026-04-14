# JWT 认证辅助工具

此辅助工具提供用于编码、解码、签名和验证 JSON Web Tokens (JWTs) 的函数。JWTs 通常在 Web 应用程序中用于认证和授权。此辅助工具提供强大的 JWT 功能，支持各种加密算法。

## 导入

要使用此辅助工具，你可以按以下方式导入：

```ts
import { decode, sign, verify } from 'hono/jwt'
```

::: info
[JWT 中间件](/docs/middleware/builtin/jwt) 也从 `hono/jwt` 导入 `jwt` 函数。
:::

## `sign()`

此函数通过使用指定的算法和密钥对 payload 进行编码和签名来生成 JWT 令牌。

```ts
sign(
  payload: unknown,
  secret: string,
  alg?: 'HS256';

): Promise<string>;
```

### 示例

```ts
import { sign } from 'hono/jwt'

const payload = {
  sub: 'user123',
  role: 'admin',
  exp: Math.floor(Date.now() / 1000) + 60 * 5, // 令牌 5 分钟后过期
}
const secret = 'mySecretKey'
const token = await sign(payload, secret)
```

### 选项

<br/>

#### <Badge type="danger" text="required" /> payload: `unknown`

要签名的 JWT payload。你可以包含其他 claims，如 [Payload Validation](#payload-validation) 中所述。

#### <Badge type="danger" text="required" /> secret: `string`

用于 JWT 验证或签名的密钥。

#### <Badge type="info" text="optional" /> alg: [AlgorithmTypes](#supported-algorithmtypes)

用于 JWT 签名或验证的算法。默认是 HS256。

## `verify()`

此函数检查 JWT 令牌是否真实且仍然有效。它确保令牌未被篡改，并且仅在你添加了 [Payload Validation](#payload-validation) 时检查有效性。

```ts
verify(
  token: string,
  secret: string,
  alg: 'HS256';
  issuer?: string | RegExp;
): Promise<any>;

```

### 示例

```ts
import { verify } from 'hono/jwt'

const tokenToVerify = 'token'
const secretKey = 'mySecretKey'

const decodedPayload = await verify(tokenToVerify, secretKey, 'HS256')
console.log(decodedPayload)
```

### 选项

<br/>

#### <Badge type="danger" text="required" /> token: `string`

要验证的 JWT 令牌。

#### <Badge type="danger" text="required" /> secret: `string`

用于 JWT 验证或签名的密钥。

#### <Badge type="danger" text="required" /> alg: [AlgorithmTypes](#supported-algorithmtypes)

用于 JWT 签名或验证的算法。

#### <Badge type="info" text="optional" /> issuer: `string | RegExp`

用于 JWT 验证的预期颁发者。

## `decode()`

此函数在不执行签名验证的情况下解码 JWT 令牌。它从令牌中提取并返回 header 和 payload。

```ts
decode(token: string): { header: any; payload: any };
```

### 示例

```ts
import { decode } from 'hono/jwt'

// 解码 JWT 令牌
const tokenToDecode =
  'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJzdWIiOiAidXNlcjEyMyIsICJyb2xlIjogImFkbWluIn0.JxUwx6Ua1B0D1B0FtCrj72ok5cm1Pkmr_hL82sd7ELA'

const { header, payload } = decode(tokenToDecode)

console.log('Decoded Header:', header)
console.log('Decoded Payload:', payload)
```

### 选项

<br/>

#### <Badge type="danger" text="required" /> token: `string`

要解码的 JWT 令牌。

> `decode` 函数允许你在_**不**_ 执行验证的情况下检查 JWT 令牌的 header 和 payload。这对于调试或从 JWT 令牌中提取信息很有用。

## Payload 验证

验证 JWT 令牌时，会执行以下 payload 验证：

- `exp`：检查令牌是否未过期。
- `nbf`：检查令牌是否在指定时间之前未被使用。
- `iat`：检查令牌是否未在未来签发。
- `iss`：检查令牌是否由受信任的颁发者签发。

如果你打算在验证期间执行这些检查，请确保你的 JWT payload 包含这些字段（作为对象）。

## 自定义错误类型

该模块还定义了自定义错误类型来处理 JWT 相关错误。

- `JwtAlgorithmNotImplemented`：表示未实现请求的 JWT 算法。
- `JwtTokenInvalid`：表示 JWT 令牌无效。
- `JwtTokenNotBefore`：表示令牌在其有效日期之前被使用。
- `JwtTokenExpired`：表示令牌已过期。
- `JwtTokenIssuedAt`：表示令牌中的 "iat" claim 不正确。
- `JwtTokenIssuer`：表示令牌中的 "iss" claim 不正确。
- `JwtTokenSignatureMismatched`：表示令牌中的签名不匹配。

## 支持的 AlgorithmTypes

该模块支持以下 JWT 加密算法：

- `HS256`：使用 SHA-256 的 HMAC
- `HS384`：使用 SHA-384 的 HMAC
- `HS512`：使用 SHA-512 的 HMAC
- `RS256`：使用 SHA-256 的 RSASSA-PKCS1-v1_5
- `RS384`：使用 SHA-384 的 RSASSA-PKCS1-v1_5
- `RS512`：使用 SHA-512 的 RSASSA-PKCS1-v1_5
- `PS256`：使用 SHA-256 和 MGF1 with SHA-256 的 RSASSA-PSS
- `PS384`：使用 SHA-386 和 MGF1 with SHA-386 的 RSASSA-PSS
- `PS512`：使用 SHA-512 和 MGF1 with SHA-512 的 RSASSA-PSS
- `ES256`：使用 P-256 和 SHA-256 的 ECDSA
- `ES384`：使用 P-384 和 SHA-384 的 ECDSA
- `ES512`：使用 P-521 和 SHA-512 的 ECDSA
- `EdDSA`：使用 Ed25519 的 EdDSA
