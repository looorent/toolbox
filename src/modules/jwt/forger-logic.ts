import type {
  AlgorithmFamily,
  AlgorithmInfo,
  ClaimEntry,
  HeaderClaimDefinition,
  LifetimeShortcut,
  SigningAlgorithm,
  StandardClaimDefinition,
  TokenPreset,
} from './forger-types'

// ---------------------------------------------------------------------------
// Base64url encoding
// ---------------------------------------------------------------------------

export function base64UrlEncode(input: string): string {
  const bytes = new TextEncoder().encode(input)
  const binary = Array.from(bytes, byte => String.fromCodePoint(byte)).join('')
  const base64 = btoa(binary)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// ---------------------------------------------------------------------------
// Algorithm catalog
// ---------------------------------------------------------------------------

export const ALGORITHM_FAMILIES: { value: AlgorithmFamily; label: string }[] = [
  { value: 'hmac', label: 'HMAC' },
  { value: 'rsa', label: 'RSA' },
  { value: 'ecdsa', label: 'ECDSA' },
  { value: 'rsa-pss', label: 'RSA-PSS' },
  { value: 'eddsa', label: 'EdDSA' },
  { value: 'none', label: 'None' },
]

export const ALGORITHM_CATALOG: AlgorithmInfo[] = [
  {
    value: 'HS256',
    label: 'HS256',
    family: 'hmac',
    description:
      'HMAC with SHA-256. A symmetric signing algorithm where the same secret key is used to both create and verify the signature. Fast, simple, and the most common choice for internal microservices and single-server applications where the secret can be kept safe.',
  },
  {
    value: 'HS384',
    label: 'HS384',
    family: 'hmac',
    description:
      'HMAC with SHA-384. Same as HS256 but with a longer hash, providing a higher security margin. Use when your security policy requires SHA-384 or above.',
  },
  {
    value: 'HS512',
    label: 'HS512',
    family: 'hmac',
    description:
      'HMAC with SHA-512. The strongest HMAC variant. The secret should be at least 64 bytes long for full security. Slightly slower than HS256 but still very fast.',
  },
  {
    value: 'RS256',
    label: 'RS256',
    family: 'rsa',
    description:
      'RSA PKCS#1 v1.5 with SHA-256. An asymmetric algorithm where the issuer signs with a private key and verifiers only need the public key. The most widely supported algorithm across identity providers (Okta, Auth0, Entra ID). Recommended key size: 2048+ bits.',
  },
  {
    value: 'RS384',
    label: 'RS384',
    family: 'rsa',
    description:
      'RSA PKCS#1 v1.5 with SHA-384. Same as RS256 but using a stronger hash function. Choose this when compliance requirements mandate SHA-384 or higher.',
  },
  {
    value: 'RS512',
    label: 'RS512',
    family: 'rsa',
    description:
      'RSA PKCS#1 v1.5 with SHA-512. The strongest RSA PKCS#1 variant. Produces larger signatures but provides the highest hash security margin.',
  },
  {
    value: 'ES256',
    label: 'ES256',
    family: 'ecdsa',
    description:
      'ECDSA with P-256 curve and SHA-256. An asymmetric algorithm that produces much smaller keys and signatures than RSA for equivalent security. A 256-bit ECDSA key is roughly equivalent to a 3072-bit RSA key. Increasingly preferred for new applications.',
  },
  {
    value: 'ES384',
    label: 'ES384',
    family: 'ecdsa',
    description:
      'ECDSA with P-384 curve and SHA-384. Provides a higher security level than ES256. Used in environments requiring CNSA Suite compliance or when extra security margin is desired.',
  },
  {
    value: 'ES512',
    label: 'ES512',
    family: 'ecdsa',
    description:
      'ECDSA with P-521 curve and SHA-512. The strongest ECDSA variant. Note: the curve is P-521 (not P-512). Offers the highest ECDSA security level but with slightly larger keys and signatures.',
  },
  {
    value: 'PS256',
    label: 'PS256',
    family: 'rsa-pss',
    description:
      'RSA-PSS with SHA-256. A more modern and provably secure variant of RSA signing compared to PKCS#1 v1.5. Recommended over RS256 for new systems. Uses probabilistic padding which provides better security properties.',
  },
  {
    value: 'PS384',
    label: 'PS384',
    family: 'rsa-pss',
    description:
      'RSA-PSS with SHA-384. Combines the improved security of PSS padding with a stronger hash function. Good choice when migrating from RS384 to a more modern signing scheme.',
  },
  {
    value: 'PS512',
    label: 'PS512',
    family: 'rsa-pss',
    description:
      'RSA-PSS with SHA-512. The strongest RSA-PSS variant. Recommended when both the signing scheme and hash strength must be maximized.',
  },
  {
    value: 'EdDSA',
    label: 'EdDSA',
    family: 'eddsa',
    description:
      'EdDSA using Ed25519 curve. The most modern signing algorithm — fast, produces compact 64-byte signatures, and is resistant to many side-channel attacks. Deterministic signing means no random number generator is needed. Requires browser support for Ed25519 (Chrome 113+, Safari 17+, Firefox 130+).',
  },
  {
    value: 'none',
    label: 'none',
    family: 'none',
    description:
      'No digital signature or MAC. The token has no integrity protection — anyone can modify the payload without detection. Only use for local testing or when transport-level security (e.g. mTLS) guarantees integrity. Never use in production with untrusted parties.',
  },
]

export function algorithmFamily(algorithm: SigningAlgorithm): AlgorithmFamily {
  const info = ALGORITHM_CATALOG.find(entry => entry.value === algorithm)
  return info?.family ?? 'none'
}

export function familyVariants(family: AlgorithmFamily): AlgorithmInfo[] {
  return ALGORITHM_CATALOG.filter(entry => entry.family === family)
}

// ---------------------------------------------------------------------------
// Standard claims catalog (educational)
// ---------------------------------------------------------------------------

export const STANDARD_CLAIMS: StandardClaimDefinition[] = [
  {
    key: 'iss',
    label: 'Issuer',
    description:
      'Identifies the principal that issued the JWT. Typically a URL pointing to the authorization server (e.g. "https://auth.example.com"). Verifiers should check this matches an expected issuer to prevent tokens from untrusted sources.',
    example: 'https://auth.example.com',
    inputType: 'text',
  },
  {
    key: 'sub',
    label: 'Subject',
    description:
      'Identifies the principal that is the subject of the JWT — typically a user ID or service account identifier. This is the "who" the token is about. Must be unique within the issuer\'s context. Often used as the primary key for user lookup.',
    example: 'user-1234',
    inputType: 'text',
  },
  {
    key: 'aud',
    label: 'Audience',
    description:
      'Identifies the intended recipients of the JWT. A resource server should reject any token whose audience does not include its own identifier. Can be a single string (e.g. "https://api.example.com") or an array of strings for multi-audience tokens.',
    example: 'https://api.example.com',
    inputType: 'text',
  },
  {
    key: 'exp',
    label: 'Expiration Time',
    description:
      'The timestamp (in seconds since Unix epoch) after which the JWT must not be accepted for processing. Essential for security — tokens without expiration effectively live forever. A common practice is to set this to 15 minutes to 1 hour for access tokens, or longer for refresh tokens.',
    example: '',
    inputType: 'timestamp',
  },
  {
    key: 'nbf',
    label: 'Not Before',
    description:
      'The timestamp (in seconds since Unix epoch) before which the JWT must not be accepted. Useful for tokens issued in advance that should only become valid at a scheduled time. Verifiers should reject the token if the current time is before this value.',
    example: '',
    inputType: 'timestamp',
  },
  {
    key: 'iat',
    label: 'Issued At',
    description:
      'The timestamp (in seconds since Unix epoch) when the JWT was created. Useful for determining the age of the token and for audit trails. Some verifiers use this together with a maximum age policy to reject stale tokens even before they expire.',
    example: '',
    inputType: 'timestamp',
  },
  {
    key: 'jti',
    label: 'JWT ID',
    description:
      'A unique identifier for the JWT, typically a UUID. Can be used to prevent replay attacks — the server tracks consumed JTI values and rejects duplicates. Especially important for single-use tokens like password reset or email verification links.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    inputType: 'text',
  },
  {
    key: 'name',
    label: 'Full Name',
    description:
      'The full display name of the user. Part of the OpenID Connect standard claims. Useful for personalizing UI without making additional API calls. Should not be used as a unique identifier — use "sub" instead.',
    example: 'Ada Lovelace',
    inputType: 'text',
  },
  {
    key: 'email',
    label: 'Email',
    description:
      'The user\'s email address. Part of the OpenID Connect standard claims. Note: unless "email_verified" is also present and true, this email should not be trusted for account matching. Some providers include unverified emails.',
    example: 'ada@example.com',
    inputType: 'text',
  },
  {
    key: 'roles',
    label: 'Roles',
    description:
      'An array of role names assigned to the user (e.g. ["admin", "editor"]). Not a registered IANA claim but widely used in practice for role-based access control (RBAC). Verifiers use this to make authorization decisions without querying a separate service.',
    example: '["admin", "editor"]',
    inputType: 'array',
  },
  {
    key: 'scope',
    label: 'Scope',
    description:
      'A space-delimited string of OAuth 2.0 scopes granted to this token (e.g. "openid profile email"). Defines what actions the token bearer is allowed to perform. Resource servers should verify the required scope is present before serving a request.',
    example: 'openid profile email',
    inputType: 'text',
  },
  {
    key: 'azp',
    label: 'Authorized Party',
    description:
      'The client ID of the application that requested the token. Used when the token audience contains multiple values to identify which party the token was issued to. Common in OpenID Connect flows with multiple relying parties.',
    example: 'my-client-app',
    inputType: 'text',
  },
  {
    key: 'nonce',
    label: 'Nonce',
    description:
      'A random string provided by the client during the authentication request to mitigate replay attacks. The client should verify that the nonce in the ID token matches the one it sent. Required in the OpenID Connect implicit flow.',
    example: 'n-0S6_WzA2Mj',
    inputType: 'text',
  },
  {
    key: 'sid',
    label: 'Session ID',
    description:
      "An identifier for the user's session at the identity provider. Used in back-channel logout and session management scenarios. When the IdP terminates a session, it can notify relying parties using this identifier.",
    example: 'sess_abc123',
    inputType: 'text',
  },
  {
    key: 'org_id',
    label: 'Organization ID',
    description:
      'An identifier for the organization or tenant the user belongs to. Common in multi-tenant SaaS applications. Used to scope data access and enforce tenant isolation. Not a registered IANA claim but widely adopted.',
    example: 'org_456',
    inputType: 'text',
  },
]

// ---------------------------------------------------------------------------
// Optional header claims
// ---------------------------------------------------------------------------

export const OPTIONAL_HEADER_CLAIMS: HeaderClaimDefinition[] = [
  {
    key: 'kid',
    label: 'Key ID',
    description:
      'Identifies which key was used to sign the token. Essential when the issuer rotates signing keys — verifiers use this to look up the correct public key from a JWKS endpoint.',
    placeholder: 'my-key-id-2024',
  },
  {
    key: 'jku',
    label: 'JWK Set URL',
    description:
      'A URL pointing to a JSON Web Key Set (JWKS) containing the public key used to verify the signature. Verifiers fetch keys from this URL. Must be served over HTTPS.',
    placeholder: 'https://auth.example.com/.well-known/jwks.json',
  },
  {
    key: 'x5u',
    label: 'X.509 URL',
    description:
      'A URL pointing to an X.509 certificate chain for the signing key. Similar to "jku" but uses X.509 certificates instead of JWK format.',
    placeholder: 'https://auth.example.com/cert.pem',
  },
  {
    key: 'x5t',
    label: 'X.509 Thumbprint',
    description:
      'The SHA-1 thumbprint (base64url-encoded) of the X.509 certificate used to sign the token. Allows verifiers to identify the certificate without fetching it from a URL.',
    placeholder: 'dGhpcyBpcyBhIHRodW1icHJpbnQ',
  },
  {
    key: 'cty',
    label: 'Content Type',
    description:
      'Declares the media type of the JWT payload. Only needed when the payload is not a standard JWT claims set — for example, when using nested JWTs (value should be "JWT").',
    placeholder: 'JWT',
  },
]

// ---------------------------------------------------------------------------
// Web Crypto signing
// ---------------------------------------------------------------------------

interface WebCryptoSignParams {
  importAlgorithm: AlgorithmIdentifier | RsaHashedImportParams | EcKeyImportParams
  signAlgorithm: AlgorithmIdentifier | RsaPssParams | EcdsaParams
}

function getWebCryptoParams(algorithm: SigningAlgorithm): WebCryptoSignParams {
  switch (algorithm) {
    case 'HS256':
      return {
        importAlgorithm: { name: 'HMAC', hash: 'SHA-256' },
        signAlgorithm: 'HMAC',
      }
    case 'HS384':
      return {
        importAlgorithm: { name: 'HMAC', hash: 'SHA-384' },
        signAlgorithm: 'HMAC',
      }
    case 'HS512':
      return {
        importAlgorithm: { name: 'HMAC', hash: 'SHA-512' },
        signAlgorithm: 'HMAC',
      }
    case 'RS256':
      return {
        importAlgorithm: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        signAlgorithm: 'RSASSA-PKCS1-v1_5',
      }
    case 'RS384':
      return {
        importAlgorithm: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-384' },
        signAlgorithm: 'RSASSA-PKCS1-v1_5',
      }
    case 'RS512':
      return {
        importAlgorithm: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-512' },
        signAlgorithm: 'RSASSA-PKCS1-v1_5',
      }
    case 'ES256':
      return {
        importAlgorithm: { name: 'ECDSA', namedCurve: 'P-256' },
        signAlgorithm: { name: 'ECDSA', hash: 'SHA-256' },
      }
    case 'ES384':
      return {
        importAlgorithm: { name: 'ECDSA', namedCurve: 'P-384' },
        signAlgorithm: { name: 'ECDSA', hash: 'SHA-384' },
      }
    case 'ES512':
      return {
        importAlgorithm: { name: 'ECDSA', namedCurve: 'P-521' },
        signAlgorithm: { name: 'ECDSA', hash: 'SHA-512' },
      }
    case 'PS256':
      return {
        importAlgorithm: { name: 'RSA-PSS', hash: 'SHA-256' },
        signAlgorithm: { name: 'RSA-PSS', saltLength: 32 },
      }
    case 'PS384':
      return {
        importAlgorithm: { name: 'RSA-PSS', hash: 'SHA-384' },
        signAlgorithm: { name: 'RSA-PSS', saltLength: 48 },
      }
    case 'PS512':
      return {
        importAlgorithm: { name: 'RSA-PSS', hash: 'SHA-512' },
        signAlgorithm: { name: 'RSA-PSS', saltLength: 64 },
      }
    case 'EdDSA':
      return {
        importAlgorithm: { name: 'Ed25519' },
        signAlgorithm: { name: 'Ed25519' },
      }
    case 'none':
      return {
        importAlgorithm: { name: 'HMAC', hash: 'SHA-256' },
        signAlgorithm: 'HMAC',
      }
  }
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  const binary = Array.from(bytes, byte => String.fromCodePoint(byte)).join('')
  const base64 = btoa(binary)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function parsePem(pem: string): ArrayBuffer {
  const lines = pem.trim().split('\n')
  const base64 = lines.filter(line => !line.startsWith('-----')).join('')
  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, char => char.codePointAt(0) ?? 0)
  return bytes.buffer
}

export async function signToken(headerJson: string, payloadJson: string, algorithm: SigningAlgorithm, key: string): Promise<string> {
  const encodedHeader = base64UrlEncode(headerJson)
  const encodedPayload = base64UrlEncode(payloadJson)
  const signingInput = `${encodedHeader}.${encodedPayload}`

  if (algorithm === 'none') {
    return `${signingInput}.`
  }

  const family = algorithmFamily(algorithm)
  const { importAlgorithm, signAlgorithm } = getWebCryptoParams(algorithm)

  let cryptoKey: CryptoKey
  if (family === 'hmac') {
    const keyBytes = new TextEncoder().encode(key)
    cryptoKey = await crypto.subtle.importKey('raw', keyBytes, importAlgorithm, false, ['sign'])
  } else {
    const keyBuffer = parsePem(key)
    cryptoKey = await crypto.subtle.importKey('pkcs8', keyBuffer, importAlgorithm, false, ['sign'])
  }

  const data = new TextEncoder().encode(signingInput)
  const signature = await crypto.subtle.sign(signAlgorithm, cryptoKey, data)
  const encodedSignature = base64UrlEncodeBytes(new Uint8Array(signature))

  return `${signingInput}.${encodedSignature}`
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function epochFromDatetime(datetime: string): number | null {
  if (!datetime) {
    return null
  }
  const date = new Date(datetime)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return Math.floor(date.getTime() / 1000)
}

export function datetimeFromEpoch(epoch: number): string {
  const date = new Date(epoch * 1000)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function nowEpoch(): number {
  return Math.floor(Date.now() / 1000)
}

export function generateDefaultClaims(): ClaimEntry[] {
  const now = nowEpoch()
  const oneHourFromNow = now + 3600

  return STANDARD_CLAIMS.map(claim => {
    switch (claim.key) {
      case 'iss':
        return { key: 'iss', value: 'https://auth.example.com', enabled: true }
      case 'sub':
        return { key: 'sub', value: 'user-1234', enabled: true }
      case 'aud':
        return { key: 'aud', value: 'https://api.example.com', enabled: true }
      case 'exp':
        return { key: 'exp', value: datetimeFromEpoch(oneHourFromNow), enabled: true }
      case 'iat':
        return { key: 'iat', value: datetimeFromEpoch(now), enabled: true }
      default:
        return { key: claim.key, value: claim.example, enabled: false }
    }
  })
}

export function buildHeaderJson(algorithm: SigningAlgorithm, extraClaims: ClaimEntry[]): string {
  const header: Record<string, unknown> = {
    alg: algorithm,
    typ: 'JWT',
  }

  for (const claim of extraClaims) {
    if (claim.enabled && claim.value.trim()) {
      header[claim.key] = claim.value.trim()
    }
  }

  return JSON.stringify(header, null, 2)
}

export function buildPayloadJson(standardClaims: ClaimEntry[], customClaims: ClaimEntry[]): string {
  const payload: Record<string, unknown> = {}

  for (const claim of standardClaims) {
    if (claim.enabled && claim.value.trim()) {
      const definition = STANDARD_CLAIMS.find(definition => definition.key === claim.key)

      if (definition?.inputType === 'timestamp') {
        const epoch = epochFromDatetime(claim.value)
        if (epoch !== null) {
          payload[claim.key] = epoch
        }
      } else if (definition?.inputType === 'array') {
        try {
          payload[claim.key] = JSON.parse(claim.value)
        } catch {
          payload[claim.key] = claim.value
        }
      } else {
        payload[claim.key] = claim.value
      }
    }
  }

  for (const claim of customClaims) {
    if (claim.key.trim() && claim.value.trim()) {
      try {
        payload[claim.key.trim()] = JSON.parse(claim.value)
      } catch {
        payload[claim.key.trim()] = claim.value
      }
    }
  }

  return JSON.stringify(payload, null, 2)
}

function arrayBufferToPem(buffer: ArrayBuffer, label: string): string {
  const bytes = new Uint8Array(buffer)
  const binary = Array.from(bytes, byte => String.fromCodePoint(byte)).join('')
  const base64 = btoa(binary)
  const lines: string[] = []
  for (let offset = 0; offset < base64.length; offset += 64) {
    lines.push(base64.slice(offset, offset + 64))
  }
  return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----`
}

function getKeyGenAlgorithm(algorithm: SigningAlgorithm): RsaHashedKeyGenParams | EcKeyGenParams | AlgorithmIdentifier {
  switch (algorithm) {
    case 'RS256':
      return { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }
    case 'RS384':
      return { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-384' }
    case 'RS512':
      return { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-512' }
    case 'PS256':
      return { name: 'RSA-PSS', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }
    case 'PS384':
      return { name: 'RSA-PSS', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-384' }
    case 'PS512':
      return { name: 'RSA-PSS', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-512' }
    case 'ES256':
      return { name: 'ECDSA', namedCurve: 'P-256' }
    case 'ES384':
      return { name: 'ECDSA', namedCurve: 'P-384' }
    case 'ES512':
      return { name: 'ECDSA', namedCurve: 'P-521' }
    case 'EdDSA':
      return { name: 'Ed25519' }
    default:
      return { name: 'ECDSA', namedCurve: 'P-256' }
  }
}

export async function generateKeyPair(algorithm: SigningAlgorithm): Promise<{ privateKeyPem: string; publicKeyPem: string }> {
  const keyGenAlgorithm = getKeyGenAlgorithm(algorithm)
  const keyPair = (await crypto.subtle.generateKey(keyGenAlgorithm, true, ['sign', 'verify'])) as CryptoKeyPair
  const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey)
  const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey)
  return {
    privateKeyPem: arrayBufferToPem(privateKeyBuffer, 'PRIVATE KEY'),
    publicKeyPem: arrayBufferToPem(publicKeyBuffer, 'PUBLIC KEY'),
  }
}

export function getKeyGenerationCommand(family: AlgorithmFamily, algorithm: SigningAlgorithm): string {
  switch (family) {
    case 'rsa':
    case 'rsa-pss':
      return 'openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private.pem'
    case 'ecdsa': {
      const curveMap: Record<string, string> = {
        ES256: 'prime256v1',
        ES384: 'secp384r1',
        ES512: 'secp521r1',
      }
      const curve = curveMap[algorithm] || 'prime256v1'
      return `openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:${curve} -out private.pem`
    }
    case 'eddsa':
      return 'openssl genpkey -algorithm Ed25519 -out private.pem'
    default:
      return ''
  }
}

// ---------------------------------------------------------------------------
// Preset templates
// ---------------------------------------------------------------------------

export const TOKEN_PRESETS: TokenPreset[] = [
  {
    label: 'OAuth2 Access Token',
    description: 'Standard OAuth 2.0 access token with scopes, issued by an authorization server.',
    algorithm: 'HS256',
    claims: [
      { key: 'iss', value: 'https://auth.example.com', enabled: true },
      { key: 'sub', value: 'user-1234', enabled: true },
      { key: 'aud', value: 'https://api.example.com', enabled: true },
      { key: 'exp', value: '__EXP_1H__', enabled: true },
      { key: 'iat', value: '__IAT__', enabled: true },
      { key: 'scope', value: 'openid profile email', enabled: true },
      { key: 'azp', value: 'my-client-app', enabled: true },
      { key: 'jti', value: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', enabled: true },
    ],
  },
  {
    label: 'OpenID Connect ID Token',
    description: 'OIDC ID token with identity claims, typically signed with an asymmetric key.',
    algorithm: 'RS256',
    claims: [
      { key: 'iss', value: 'https://accounts.example.com', enabled: true },
      { key: 'sub', value: 'user-1234', enabled: true },
      { key: 'aud', value: 'my-client-app', enabled: true },
      { key: 'exp', value: '__EXP_1H__', enabled: true },
      { key: 'iat', value: '__IAT__', enabled: true },
      { key: 'nonce', value: 'n-0S6_WzA2Mj', enabled: true },
      { key: 'name', value: 'Ada Lovelace', enabled: true },
      { key: 'email', value: 'ada@example.com', enabled: true },
    ],
  },
  {
    label: 'API Key Token',
    description: 'Long-lived API key token with role-based permissions for programmatic access.',
    algorithm: 'HS256',
    claims: [
      { key: 'iss', value: 'https://api.example.com', enabled: true },
      { key: 'sub', value: 'service-account-42', enabled: true },
      { key: 'exp', value: '__EXP_30D__', enabled: true },
      { key: 'iat', value: '__IAT__', enabled: true },
      { key: 'roles', value: '["api:read", "api:write"]', enabled: true },
      { key: 'jti', value: 'key-98765-abcde', enabled: true },
    ],
  },
  {
    label: 'Service-to-Service',
    description: 'Short-lived token for internal service communication with narrow scope.',
    algorithm: 'ES256',
    claims: [
      { key: 'iss', value: 'payment-service', enabled: true },
      { key: 'sub', value: 'order-service', enabled: true },
      { key: 'aud', value: 'https://internal.example.com', enabled: true },
      { key: 'exp', value: '__EXP_5MIN__', enabled: true },
      { key: 'iat', value: '__IAT__', enabled: true },
      { key: 'jti', value: 'req-abc-123', enabled: true },
      { key: 'scope', value: 'internal', enabled: true },
    ],
  },
]

export function applyPreset(preset: TokenPreset): {
  algorithm: SigningAlgorithm
  standardClaims: ClaimEntry[]
  customClaims: ClaimEntry[]
} {
  const now = nowEpoch()
  const standardKeys = new Set(STANDARD_CLAIMS.map(claim => claim.key))

  function resolveValue(value: string): string {
    switch (value) {
      case '__IAT__':
        return datetimeFromEpoch(now)
      case '__EXP_5MIN__':
        return datetimeFromEpoch(now + 300)
      case '__EXP_1H__':
        return datetimeFromEpoch(now + 3600)
      case '__EXP_30D__':
        return datetimeFromEpoch(now + 2592000)
      default:
        return value
    }
  }

  const presetMap = new Map(preset.claims.map(claim => [claim.key, claim]))

  const standardClaims = STANDARD_CLAIMS.map(definition => {
    const presetClaim = presetMap.get(definition.key)
    if (presetClaim) {
      return { key: definition.key, value: resolveValue(presetClaim.value), enabled: presetClaim.enabled }
    } else {
      return { key: definition.key, value: definition.example, enabled: false }
    }
  })

  const customClaims = preset.claims
    .filter(claim => !standardKeys.has(claim.key))
    .map(claim => ({ key: claim.key, value: resolveValue(claim.value), enabled: claim.enabled }))

  return { algorithm: preset.algorithm, standardClaims, customClaims }
}

// ---------------------------------------------------------------------------
// Lifetime shortcuts
// ---------------------------------------------------------------------------

export const LIFETIME_SHORTCUTS: LifetimeShortcut[] = [
  { label: '5min', seconds: 300 },
  { label: '15min', seconds: 900 },
  { label: '1h', seconds: 3600 },
  { label: '24h', seconds: 86400 },
  { label: '7d', seconds: 604800 },
  { label: '30d', seconds: 2592000 },
]

export function refreshTimestamps(claims: ClaimEntry[]): ClaimEntry[] {
  const now = nowEpoch()
  const iatClaim = claims.find(claim => claim.key === 'iat')
  const expClaim = claims.find(claim => claim.key === 'exp')

  const oldIat = iatClaim ? epochFromDatetime(iatClaim.value) : null
  const oldExp = expClaim ? epochFromDatetime(expClaim.value) : null
  const offset = oldIat !== null && oldExp !== null ? oldExp - oldIat : 3600

  return claims.map(claim => {
    switch (claim.key) {
      case 'iat':
        return { ...claim, value: datetimeFromEpoch(now) }
      case 'exp':
        return { ...claim, value: datetimeFromEpoch(now + offset) }
      case 'nbf':
        if (claim.enabled) {
          return { ...claim, value: datetimeFromEpoch(now) }
        } else {
          return claim
        }
      default:
        return claim
    }
  })
}

// ---------------------------------------------------------------------------
// JWKS endpoint mock
// ---------------------------------------------------------------------------

export async function publicKeyToJwk(publicKeyPem: string, algorithm: SigningAlgorithm): Promise<JsonWebKey> {
  const keyBuffer = parsePem(publicKeyPem)
  const { importAlgorithm } = getWebCryptoParams(algorithm)
  const cryptoKey = await crypto.subtle.importKey('spki', keyBuffer, importAlgorithm, true, ['verify'])
  return crypto.subtle.exportKey('jwk', cryptoKey)
}

export async function buildJwks(publicKeyPem: string, algorithm: SigningAlgorithm, kid?: string): Promise<string> {
  const jwk = await publicKeyToJwk(publicKeyPem, algorithm)
  const keyId = kid || crypto.randomUUID().slice(0, 8)
  const jwks = {
    keys: [
      {
        ...jwk,
        kid: keyId,
        alg: algorithm,
        use: 'sig',
      },
    ],
  }
  return JSON.stringify(jwks, null, 2)
}

// ---------------------------------------------------------------------------
// Signature verification
// ---------------------------------------------------------------------------

export async function verifyToken(token: string, algorithm: SigningAlgorithm, key: string): Promise<boolean> {
  if (algorithm === 'none') {
    const parts = token.split('.')
    return parts.length === 3 && parts[2] === ''
  }

  const parts = token.split('.')
  if (parts.length !== 3) {
    return false
  }

  const signingInput = `${parts[0]}.${parts[1]}`
  const signatureBase64 = parts[2]

  const signatureBytes = base64UrlDecodeBytes(signatureBase64)
  const data = new TextEncoder().encode(signingInput)

  const family = algorithmFamily(algorithm)
  const { importAlgorithm, signAlgorithm } = getWebCryptoParams(algorithm)

  let cryptoKey: CryptoKey
  if (family === 'hmac') {
    const keyBytes = new TextEncoder().encode(key)
    cryptoKey = await crypto.subtle.importKey('raw', keyBytes, importAlgorithm, false, ['verify'])
  } else {
    const keyBuffer = parsePem(key)
    cryptoKey = await crypto.subtle.importKey('spki', keyBuffer, importAlgorithm, false, ['verify'])
  }

  return crypto.subtle.verify(signAlgorithm, cryptoKey, signatureBytes.buffer as ArrayBuffer, data)
}

function base64UrlDecodeBytes(encoded: string): Uint8Array {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(padded)
  return Uint8Array.from(binary, char => char.codePointAt(0) ?? 0)
}
