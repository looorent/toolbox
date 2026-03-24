import { describe, expect, it } from 'vitest'
import {
  algorithmFamily,
  applyPreset,
  base64UrlEncode,
  buildHeaderJson,
  buildJwks,
  buildPayloadJson,
  datetimeFromEpoch,
  epochFromDatetime,
  familyVariants,
  generateDefaultClaims,
  generateKeyPair,
  LIFETIME_SHORTCUTS,
  nowEpoch,
  parsePem,
  publicKeyToJwk,
  refreshTimestamps,
  signToken,
  TOKEN_PRESETS,
  verifyToken,
} from './forger-logic'
import { decodeJwt } from './logic'

describe('base64UrlEncode', () => {
  it('encodes a simple string', () => {
    expect(base64UrlEncode('hello')).toBe('aGVsbG8')
  })

  it('encodes an empty string', () => {
    expect(base64UrlEncode('')).toBe('')
  })

  it('handles UTF-8 characters', () => {
    const encoded = base64UrlEncode('héllo wörld')
    expect(encoded).not.toContain('+')
    expect(encoded).not.toContain('/')
    expect(encoded).not.toContain('=')
  })

  it('replaces + with - and / with _', () => {
    // ">>>" encodes to "Pj4+" in standard base64
    const encoded = base64UrlEncode('>>>')
    expect(encoded).not.toContain('+')
    expect(encoded).not.toContain('/')
  })

  it('strips padding', () => {
    // "a" would have padding in standard base64
    const encoded = base64UrlEncode('a')
    expect(encoded).not.toContain('=')
  })
})

describe('base64UrlEncode + decodeJwt round-trip', () => {
  it('produces tokens decodable by decodeJwt', () => {
    const header = base64UrlEncode('{"alg":"none","typ":"JWT"}')
    const payload = base64UrlEncode('{"sub":"1234"}')
    const token = `${header}.${payload}.`

    const decoded = decodeJwt(token)
    expect(decoded).not.toBeNull()
    expect(decoded?.kind).toBe('success')
    if (decoded?.kind === 'success') {
      expect(decoded.header).toEqual({ alg: 'none', typ: 'JWT' })
      expect(decoded.payload).toEqual({ sub: '1234' })
    }
  })
})

describe('algorithmFamily', () => {
  it('returns hmac for HS256', () => {
    expect(algorithmFamily('HS256')).toBe('hmac')
  })

  it('returns rsa for RS256', () => {
    expect(algorithmFamily('RS256')).toBe('rsa')
  })

  it('returns ecdsa for ES256', () => {
    expect(algorithmFamily('ES256')).toBe('ecdsa')
  })

  it('returns none for none', () => {
    expect(algorithmFamily('none')).toBe('none')
  })

  it('returns eddsa for EdDSA', () => {
    expect(algorithmFamily('EdDSA')).toBe('eddsa')
  })

  it('returns rsa-pss for PS256', () => {
    expect(algorithmFamily('PS256')).toBe('rsa-pss')
  })
})

describe('familyVariants', () => {
  it('returns 3 variants for hmac', () => {
    expect(familyVariants('hmac')).toHaveLength(3)
  })

  it('returns 1 variant for eddsa', () => {
    expect(familyVariants('eddsa')).toHaveLength(1)
  })

  it('returns 1 variant for none', () => {
    expect(familyVariants('none')).toHaveLength(1)
  })
})

describe('buildHeaderJson', () => {
  it('builds a basic header', () => {
    const json = buildHeaderJson('HS256', [])
    const parsed = JSON.parse(json)
    expect(parsed).toEqual({ alg: 'HS256', typ: 'JWT' })
  })

  it('includes enabled extra claims', () => {
    const json = buildHeaderJson('RS256', [
      { key: 'kid', value: 'my-key', enabled: true },
      { key: 'jku', value: '', enabled: true },
    ])
    const parsed = JSON.parse(json)
    expect(parsed.kid).toBe('my-key')
    expect(parsed.jku).toBeUndefined()
  })

  it('excludes disabled extra claims', () => {
    const json = buildHeaderJson('RS256', [{ key: 'kid', value: 'my-key', enabled: false }])
    const parsed = JSON.parse(json)
    expect(parsed.kid).toBeUndefined()
  })
})

describe('buildPayloadJson', () => {
  it('includes enabled claims', () => {
    const json = buildPayloadJson(
      [
        { key: 'iss', value: 'https://test.com', enabled: true },
        { key: 'sub', value: 'user-1', enabled: true },
        { key: 'name', value: '', enabled: true },
      ],
      [],
    )
    const parsed = JSON.parse(json)
    expect(parsed.iss).toBe('https://test.com')
    expect(parsed.sub).toBe('user-1')
    expect(parsed.name).toBeUndefined()
  })

  it('converts timestamp claims to epoch', () => {
    const json = buildPayloadJson([{ key: 'iat', value: '2024-01-01T00:00', enabled: true }], [])
    const parsed = JSON.parse(json)
    expect(typeof parsed.iat).toBe('number')
  })

  it('parses array claims as JSON', () => {
    const json = buildPayloadJson([{ key: 'roles', value: '["admin", "user"]', enabled: true }], [])
    const parsed = JSON.parse(json)
    expect(parsed.roles).toEqual(['admin', 'user'])
  })

  it('includes custom claims', () => {
    const json = buildPayloadJson(
      [],
      [
        { key: 'custom', value: '42', enabled: true },
        { key: 'obj', value: '{"nested": true}', enabled: true },
      ],
    )
    const parsed = JSON.parse(json)
    expect(parsed.custom).toBe(42)
    expect(parsed.obj).toEqual({ nested: true })
  })
})

describe('epochFromDatetime', () => {
  it('converts a valid datetime string', () => {
    const epoch = epochFromDatetime('2024-01-01T00:00')
    expect(epoch).toBeTypeOf('number')
    expect(epoch).toBeGreaterThan(0)
  })

  it('returns null for empty string', () => {
    expect(epochFromDatetime('')).toBeNull()
  })

  it('returns null for invalid datetime', () => {
    expect(epochFromDatetime('not-a-date')).toBeNull()
  })
})

describe('datetimeFromEpoch', () => {
  it('converts epoch to datetime-local format', () => {
    const result = datetimeFromEpoch(1704067200)
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })

  it('round-trips with epochFromDatetime', () => {
    const original = '2024-06-15T14:30'
    const epoch = epochFromDatetime(original)
    expect(epoch).not.toBeNull()
    if (epoch !== null) {
      const roundTripped = datetimeFromEpoch(epoch)
      expect(roundTripped).toBe(original)
    }
  })
})

describe('generateDefaultClaims', () => {
  it('returns an array of claim entries', () => {
    const claims = generateDefaultClaims()
    expect(claims.length).toBeGreaterThan(0)
  })

  it('enables iss, sub, aud, exp, iat by default', () => {
    const claims = generateDefaultClaims()
    const enabledKeys = claims.filter(claim => claim.enabled).map(claim => claim.key)
    expect(enabledKeys).toContain('iss')
    expect(enabledKeys).toContain('sub')
    expect(enabledKeys).toContain('aud')
    expect(enabledKeys).toContain('exp')
    expect(enabledKeys).toContain('iat')
  })

  it('disables optional claims by default', () => {
    const claims = generateDefaultClaims()
    const jti = claims.find(claim => claim.key === 'jti')
    expect(jti?.enabled).toBe(false)
  })
})

describe('signToken', () => {
  it('produces a token with empty signature for none algorithm', async () => {
    const token = await signToken('{"alg":"none","typ":"JWT"}', '{"sub":"test"}', 'none', '')
    expect(token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.$/)
  })

  it('produces a valid 3-part token for HS256', async () => {
    const token = await signToken('{"alg":"HS256","typ":"JWT"}', '{"sub":"test"}', 'HS256', 'secret')
    const parts = token.split('.')
    expect(parts).toHaveLength(3)
    expect(parts[2].length).toBeGreaterThan(0)

    const decoded = decodeJwt(token)
    expect(decoded?.kind).toBe('success')
    if (decoded?.kind === 'success') {
      expect(decoded.header.alg).toBe('HS256')
      expect(decoded.payload.sub).toBe('test')
    }
  })

  it('produces different signatures for different secrets', async () => {
    const header = '{"alg":"HS256","typ":"JWT"}'
    const payload = '{"sub":"test"}'
    const token1 = await signToken(header, payload, 'HS256', 'secret1')
    const token2 = await signToken(header, payload, 'HS256', 'secret2')
    expect(token1.split('.')[2]).not.toBe(token2.split('.')[2])
  })
})

describe('parsePem', () => {
  it('strips PEM headers and decodes base64', () => {
    const pem = '-----BEGIN PRIVATE KEY-----\naGVsbG8=\n-----END PRIVATE KEY-----'
    const buffer = parsePem(pem)
    expect(buffer.byteLength).toBe(5)
    const text = new TextDecoder().decode(buffer)
    expect(text).toBe('hello')
  })

  it('handles multi-line base64', () => {
    const pem = '-----BEGIN PRIVATE KEY-----\naGVs\nbG8=\n-----END PRIVATE KEY-----'
    const buffer = parsePem(pem)
    const text = new TextDecoder().decode(buffer)
    expect(text).toBe('hello')
  })
})

describe('generateKeyPair', () => {
  it('generates an ES256 key pair in PEM format', async () => {
    const { privateKeyPem, publicKeyPem } = await generateKeyPair('ES256')
    expect(privateKeyPem).toContain('-----BEGIN PRIVATE KEY-----')
    expect(privateKeyPem).toContain('-----END PRIVATE KEY-----')
    expect(publicKeyPem).toContain('-----BEGIN PUBLIC KEY-----')
    expect(publicKeyPem).toContain('-----END PUBLIC KEY-----')
  })

  it('generates a key that can sign a token', async () => {
    const { privateKeyPem } = await generateKeyPair('ES256')
    const token = await signToken('{"alg":"ES256","typ":"JWT"}', '{"sub":"test"}', 'ES256', privateKeyPem)
    const parts = token.split('.')
    expect(parts).toHaveLength(3)
    expect(parts[2].length).toBeGreaterThan(0)
  })
})

describe('TOKEN_PRESETS', () => {
  it('has at least 4 presets', () => {
    expect(TOKEN_PRESETS.length).toBeGreaterThanOrEqual(4)
  })

  it('each preset has a label, description, algorithm, and claims', () => {
    for (const preset of TOKEN_PRESETS) {
      expect(preset.label).toBeTruthy()
      expect(preset.description).toBeTruthy()
      expect(preset.algorithm).toBeTruthy()
      expect(preset.claims.length).toBeGreaterThan(0)
    }
  })
})

describe('applyPreset', () => {
  it('returns the correct algorithm', () => {
    const result = applyPreset(TOKEN_PRESETS[0])
    expect(result.algorithm).toBe(TOKEN_PRESETS[0].algorithm)
  })

  it('enables claims from the preset', () => {
    const result = applyPreset(TOKEN_PRESETS[0])
    const enabledKeys = result.standardClaims.filter(claim => claim.enabled).map(claim => claim.key)
    expect(enabledKeys).toContain('iss')
    expect(enabledKeys).toContain('sub')
    expect(enabledKeys).toContain('exp')
    expect(enabledKeys).toContain('iat')
  })

  it('resolves timestamp placeholders to valid datetimes', () => {
    const result = applyPreset(TOKEN_PRESETS[0])
    const expClaim = result.standardClaims.find(claim => claim.key === 'exp')
    expect(expClaim).toBeDefined()
    expect(expClaim?.value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })

  it('disables claims not in the preset', () => {
    const result = applyPreset(TOKEN_PRESETS[0])
    const nameClaim = result.standardClaims.find(claim => claim.key === 'name')
    expect(nameClaim?.enabled).toBe(false)
  })
})

describe('LIFETIME_SHORTCUTS', () => {
  it('has at least 5 shortcuts', () => {
    expect(LIFETIME_SHORTCUTS.length).toBeGreaterThanOrEqual(5)
  })

  it('each shortcut has a label and seconds', () => {
    for (const shortcut of LIFETIME_SHORTCUTS) {
      expect(shortcut.label).toBeTruthy()
      expect(shortcut.seconds).toBeGreaterThan(0)
    }
  })
})

describe('refreshTimestamps', () => {
  it('updates iat to now', () => {
    const claims = [
      { key: 'iss', value: 'test', enabled: true },
      { key: 'iat', value: '2020-01-01T00:00', enabled: true },
      { key: 'exp', value: '2020-01-01T01:00', enabled: true },
    ]
    const result = refreshTimestamps(claims)
    const iatClaim = result.find(claim => claim.key === 'iat')
    expect(iatClaim).toBeDefined()
    const expectedDatetime = datetimeFromEpoch(nowEpoch())
    expect(iatClaim?.value).toBe(expectedDatetime)
  })

  it('preserves the exp-iat offset', () => {
    const claims = [
      { key: 'iat', value: '2020-01-01T00:00', enabled: true },
      { key: 'exp', value: '2020-01-01T02:00', enabled: true },
    ]
    const result = refreshTimestamps(claims)
    const iatEpoch = epochFromDatetime(result.find(claim => claim.key === 'iat')?.value ?? '')
    const expEpoch = epochFromDatetime(result.find(claim => claim.key === 'exp')?.value ?? '')
    expect(iatEpoch).not.toBeNull()
    expect(expEpoch).not.toBeNull()
    expect((expEpoch ?? 0) - (iatEpoch ?? 0)).toBe(7200)
  })

  it('updates nbf if enabled', () => {
    const claims = [
      { key: 'iat', value: '2020-01-01T00:00', enabled: true },
      { key: 'exp', value: '2020-01-01T01:00', enabled: true },
      { key: 'nbf', value: '2020-01-01T00:00', enabled: true },
    ]
    const result = refreshTimestamps(claims)
    const nbfClaim = result.find(claim => claim.key === 'nbf')
    expect(nbfClaim).toBeDefined()
    const expectedDatetime = datetimeFromEpoch(nowEpoch())
    expect(nbfClaim?.value).toBe(expectedDatetime)
  })

  it('does not touch nbf if disabled', () => {
    const claims = [
      { key: 'iat', value: '2020-01-01T00:00', enabled: true },
      { key: 'exp', value: '2020-01-01T01:00', enabled: true },
      { key: 'nbf', value: '2020-01-01T00:00', enabled: false },
    ]
    const result = refreshTimestamps(claims)
    const nbfClaim = result.find(claim => claim.key === 'nbf')
    expect(nbfClaim?.value).toBe('2020-01-01T00:00')
  })
})

describe('publicKeyToJwk', () => {
  it('exports an ES256 public key as JWK', async () => {
    const { publicKeyPem } = await generateKeyPair('ES256')
    const jwk = await publicKeyToJwk(publicKeyPem, 'ES256')
    expect(jwk.kty).toBe('EC')
    expect(jwk.crv).toBe('P-256')
    expect(jwk.x).toBeTruthy()
    expect(jwk.y).toBeTruthy()
  })

  it('exports an RS256 public key as JWK', async () => {
    const { publicKeyPem } = await generateKeyPair('RS256')
    const jwk = await publicKeyToJwk(publicKeyPem, 'RS256')
    expect(jwk.kty).toBe('RSA')
    expect(jwk.n).toBeTruthy()
    expect(jwk.e).toBeTruthy()
  })
})

describe('buildJwks', () => {
  it('wraps a public key in JWKS format', async () => {
    const { publicKeyPem } = await generateKeyPair('ES256')
    const jwksString = await buildJwks(publicKeyPem, 'ES256', 'my-key-id')
    const jwks = JSON.parse(jwksString)
    expect(jwks.keys).toHaveLength(1)
    expect(jwks.keys[0].kid).toBe('my-key-id')
    expect(jwks.keys[0].alg).toBe('ES256')
    expect(jwks.keys[0].use).toBe('sig')
  })

  it('auto-generates a kid when not provided', async () => {
    const { publicKeyPem } = await generateKeyPair('ES256')
    const jwksString = await buildJwks(publicKeyPem, 'ES256')
    const jwks = JSON.parse(jwksString)
    expect(jwks.keys[0].kid).toBeTruthy()
  })
})

describe('verifyToken', () => {
  it('verifies an HS256 token with the correct secret', async () => {
    const token = await signToken('{"alg":"HS256","typ":"JWT"}', '{"sub":"test"}', 'HS256', 'my-secret')
    const result = await verifyToken(token, 'HS256', 'my-secret')
    expect(result).toBe(true)
  })

  it('rejects an HS256 token with the wrong secret', async () => {
    const token = await signToken('{"alg":"HS256","typ":"JWT"}', '{"sub":"test"}', 'HS256', 'my-secret')
    const result = await verifyToken(token, 'HS256', 'wrong-secret')
    expect(result).toBe(false)
  })

  it('verifies an ES256 token with the correct public key', async () => {
    const { privateKeyPem, publicKeyPem } = await generateKeyPair('ES256')
    const token = await signToken('{"alg":"ES256","typ":"JWT"}', '{"sub":"test"}', 'ES256', privateKeyPem)
    const result = await verifyToken(token, 'ES256', publicKeyPem)
    expect(result).toBe(true)
  })

  it('verifies a none token with empty signature', async () => {
    const token = await signToken('{"alg":"none","typ":"JWT"}', '{"sub":"test"}', 'none', '')
    const result = await verifyToken(token, 'none', '')
    expect(result).toBe(true)
  })

  it('rejects a none token with non-empty signature', async () => {
    const result = await verifyToken('eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJzdWIiOiJ0ZXN0In0.fakesig', 'none', '')
    expect(result).toBe(false)
  })
})
