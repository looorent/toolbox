import { afterEach, assert, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  computeFingerprints,
  daysUntil,
  decodePem,
  formatBasicConstraints,
  formatDate,
  keyDescription,
  validityMessage,
  validityStatus,
} from './logic'
import type { CertificateInfo } from './types'

// Self-signed RSA 2048 test certificate generated with:
// openssl req -x509 -newkey rsa:2048 -days 3650 -nodes
//   -subj "/CN=Test Certificate/O=Test Org/OU=Test Unit/C=US/ST=California/L=San Francisco"
//   -addext "subjectAltName=DNS:test.example.com,DNS:www.test.example.com"
//   -addext "basicConstraints=critical,CA:FALSE"
//   -addext "keyUsage=critical,digitalSignature,keyEncipherment"
//   -addext "extendedKeyUsage=serverAuth,clientAuth"
const TEST_CERT_PEM = `-----BEGIN CERTIFICATE-----
MIIEOjCCAyKgAwIBAgIUdJzgGWHxevn9ZZhkCtzxCEcqR+cwDQYJKoZIhvcNAQEL
BQAwfDEZMBcGA1UEAwwQVGVzdCBDZXJ0aWZpY2F0ZTERMA8GA1UECgwIVGVzdCBP
cmcxEjAQBgNVBAsMCVRlc3QgVW5pdDELMAkGA1UEBhMCVVMxEzARBgNVBAgMCkNh
bGlmb3JuaWExFjAUBgNVBAcMDVNhbiBGcmFuY2lzY28wHhcNMjYwMjE3MTUzODE5
WhcNMzYwMjE1MTUzODE5WjB8MRkwFwYDVQQDDBBUZXN0IENlcnRpZmljYXRlMREw
DwYDVQQKDAhUZXN0IE9yZzESMBAGA1UECwwJVGVzdCBVbml0MQswCQYDVQQGEwJV
UzETMBEGA1UECAwKQ2FsaWZvcm5pYTEWMBQGA1UEBwwNU2FuIEZyYW5jaXNjbzCC
ASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMnduLAZ06MdzqbciMIg2hZv
ZYVUpYJL3L3mBwvN4fen9v54kwApe7d+/FGVGsoimBfUnFb8kyg8blhR5QU0N5rW
4uvolfE+5jSfLBCqBvQnsVuvkVq6Vx7uUIKH2Jrx1HWaVKrPW2/PR0MgWciJbVBW
DEZA9siNOZensItcNDGlmclhDLSfjjrg7cG5K/tAW472yQhN0FeaqwERJyR7Cxat
vxFOYy7oCUaTrUxhjLc4auPWZod03w+U/lqUwkbrGRwPl06GJIXimK2ktYhIq5oB
Y10eNvmCpE9e0tiApEKvPT09ij8rEDaaX28v1JdImGHyrdlQQ2DijTM9MyFQDmUC
AwEAAaOBszCBsDAdBgNVHQ4EFgQUQ/dsFeAsUo363tgCl0kG9Nmc/+IwHwYDVR0j
BBgwFoAUQ/dsFeAsUo363tgCl0kG9Nmc/+IwMQYDVR0RBCowKIIQdGVzdC5leGFt
cGxlLmNvbYIUd3d3LnRlc3QuZXhhbXBsZS5jb20wDAYDVR0TAQH/BAIwADAOBgNV
HQ8BAf8EBAMCBaAwHQYDVR0lBBYwFAYIKwYBBQUHAwEGCCsGAQUFBwMCMA0GCSqG
SIb3DQEBCwUAA4IBAQCda/+P7AN27HOIkz/Lh2Shn/U0caNXcSDWu/r2Xmez64Fi
2aU9sioN7b6Ac43VM/8Mul6xl3GSlsyPeQTeC+VWMqMRDFxgbz+DO/EEvovE3iSc
Nfh3EGmJsta1PMhfpq0X/dt8c8xWqo0ZVa3kTXPaFHTzjjtYlGBNPzv0e5sW6Tb8
2/LV+CK2aJ9PNrrgag5wXLhTUXwcC5xlPHF+TCA20QziO/2KlPoyGmOBOBzuXLff
2VaLfnKPinRKQMXOUWUeQ+qi6PxpfXYeJnnA0ZZDq/S9YdGqjvs1P2C+8G4mVpXF
hempurY9UvKrjGeZjMemEx6NvZxmer0AZRmb2yem
-----END CERTIFICATE-----`

describe('decodePem', () => {
  describe('error handling', () => {
    it('returns error for empty input', () => {
      expect(decodePem('')).toEqual({ error: 'Invalid PEM format: missing BEGIN/END markers' })
    })

    it('returns error for missing BEGIN marker', () => {
      expect(decodePem('not a pem')).toEqual({ error: 'Invalid PEM format: missing BEGIN/END markers' })
    })

    it('returns error for missing END marker', () => {
      const input = '-----BEGIN CERTIFICATE-----\nABC'
      expect(decodePem(input)).toEqual({ error: 'Invalid PEM format: missing BEGIN/END markers' })
    })

    it('returns error for invalid base64 content', () => {
      const input = '-----BEGIN CERTIFICATE-----\n!!!invalid!!!\n-----END CERTIFICATE-----'
      expect(decodePem(input)).toEqual({ error: 'Invalid Base64 content in PEM' })
    })
  })

  describe('non-certificate PEM', () => {
    it('returns type and byte length for RSA private key', () => {
      const input = '-----BEGIN RSA PRIVATE KEY-----\ndGVzdA==\n-----END RSA PRIVATE KEY-----'
      const result = decodePem(input)
      expect(result.error).toBeUndefined()
      expect(result.type).toBe('RSA PRIVATE KEY')
      expect(result.byteLength).toBe(4)
      expect(result.cert).toBeUndefined()
    })

    it('returns type and byte length for EC private key', () => {
      const input = '-----BEGIN EC PRIVATE KEY-----\nYWJj\n-----END EC PRIVATE KEY-----'
      const result = decodePem(input)
      expect(result.type).toBe('EC PRIVATE KEY')
      expect(result.byteLength).toBe(3)
    })
  })

  describe('certificate parsing', () => {
    it('parses version 3', () => {
      const result = decodePem(TEST_CERT_PEM)
      expect(result.cert?.version).toBe(3)
    })

    it('parses serial number', () => {
      const result = decodePem(TEST_CERT_PEM)
      expect(result.cert?.serialNumber).toBe('74:9C:E0:19:61:F1:7A:F9:FD:65:98:64:0A:DC:F1:08:47:2A:47:E7')
    })

    it('parses signature algorithm', () => {
      const result = decodePem(TEST_CERT_PEM)
      expect(result.cert?.signatureAlgorithm).toBe('SHA-256 with RSA')
    })

    it('parses subject distinguished name parts', () => {
      const result = decodePem(TEST_CERT_PEM)
      expect(result.cert?.subject.parts).toEqual({
        CN: 'Test Certificate',
        O: 'Test Org',
        OU: 'Test Unit',
        C: 'US',
        ST: 'California',
        L: 'San Francisco',
      })
    })

    it('parses issuer distinguished name parts', () => {
      const result = decodePem(TEST_CERT_PEM)
      // Self-signed: issuer === subject
      expect(result.cert?.issuer.parts).toEqual(result.cert?.subject.parts)
    })

    it('parses validity dates', () => {
      const result = decodePem(TEST_CERT_PEM)
      expect(result.cert?.validFrom).toEqual(new Date('2026-02-17T15:38:19Z'))
      expect(result.cert?.validTo).toEqual(new Date('2036-02-15T15:38:19Z'))
    })

    it('parses RSA public key info', () => {
      const result = decodePem(TEST_CERT_PEM)
      expect(result.cert?.publicKeyAlgorithm).toBe('RSA')
      expect(result.cert?.publicKeySize).toBe(2048)
      expect(result.cert?.publicKeyCurve).toBeNull()
    })

    it('parses subject alternative names', () => {
      const result = decodePem(TEST_CERT_PEM)
      expect(result.cert?.subjectAltNames).toEqual(['test.example.com', 'www.test.example.com'])
    })

    it('parses basic constraints', () => {
      const result = decodePem(TEST_CERT_PEM)
      expect(result.cert?.basicConstraints).toEqual({ ca: false })
    })

    it('parses key usage', () => {
      const result = decodePem(TEST_CERT_PEM)
      expect(result.cert?.keyUsage).toEqual(['Digital Signature', 'Key Encipherment'])
    })

    it('parses extended key usage', () => {
      const result = decodePem(TEST_CERT_PEM)
      expect(result.cert?.extendedKeyUsage).toEqual(['Server Authentication', 'Client Authentication'])
    })

    it('parses extension metadata', () => {
      const result = decodePem(TEST_CERT_PEM)
      const extensionNames = result.cert?.extensions.map(ext => ext.name) ?? []
      expect(extensionNames).toContain('Subject Key Identifier')
      expect(extensionNames).toContain('Authority Key Identifier')
      expect(extensionNames).toContain('Subject Alternative Name')
      expect(extensionNames).toContain('Basic Constraints')
      expect(extensionNames).toContain('Key Usage')
      expect(extensionNames).toContain('Extended Key Usage')
    })

    it('marks critical extensions', () => {
      const result = decodePem(TEST_CERT_PEM)
      const basicConstraints = result.cert?.extensions.find(ext => ext.name === 'Basic Constraints')
      const keyUsage = result.cert?.extensions.find(ext => ext.name === 'Key Usage')
      const eku = result.cert?.extensions.find(ext => ext.name === 'Extended Key Usage')
      expect(basicConstraints?.critical).toBe(true)
      expect(keyUsage?.critical).toBe(true)
      expect(eku?.critical).toBe(false)
    })

    it('returns type and DER alongside cert', () => {
      const result = decodePem(TEST_CERT_PEM)
      expect(result.type).toBe('CERTIFICATE')
      expect(result.der).toBeInstanceOf(Uint8Array)
      expect(result.byteLength).toBeGreaterThan(0)
    })
  })
})

describe('validityStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2030-06-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns valid when now is between validFrom and validTo', () => {
    const validFrom = new Date('2025-01-01T00:00:00Z')
    const validTo = new Date('2035-01-01T00:00:00Z')
    expect(validityStatus(validFrom, validTo)).toBe('valid')
  })

  it('returns expired when now is after validTo', () => {
    const validFrom = new Date('2020-01-01T00:00:00Z')
    const validTo = new Date('2025-01-01T00:00:00Z')
    expect(validityStatus(validFrom, validTo)).toBe('expired')
  })

  it('returns not-yet when now is before validFrom', () => {
    const validFrom = new Date('2035-01-01T00:00:00Z')
    const validTo = new Date('2040-01-01T00:00:00Z')
    expect(validityStatus(validFrom, validTo)).toBe('not-yet')
  })
})

describe('validityMessage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2030-06-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('includes days remaining for valid certificate', () => {
    const validFrom = new Date('2025-01-01T00:00:00Z')
    const validTo = new Date('2035-01-01T00:00:00Z')
    const message = validityMessage(validFrom, validTo)
    expect(message).toMatch(/^Certificate is valid \(expires in \d+ days\)$/)
  })

  it('includes formatted date for expired certificate', () => {
    const validFrom = new Date('2020-01-01T00:00:00Z')
    const validTo = new Date('2025-06-15T00:00:00Z')
    const message = validityMessage(validFrom, validTo)
    expect(message).toMatch(/^Certificate has expired \(.+\)$/)
  })

  it('includes formatted date for not-yet-valid certificate', () => {
    const validFrom = new Date('2035-03-01T00:00:00Z')
    const validTo = new Date('2040-01-01T00:00:00Z')
    const message = validityMessage(validFrom, validTo)
    expect(message).toMatch(/^Certificate is not yet valid \(starts .+\)$/)
  })
})

describe('daysUntil', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2030-01-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns positive days for future date', () => {
    expect(daysUntil(new Date('2030-01-11T00:00:00Z'))).toBe(10)
  })

  it('returns negative days for past date', () => {
    expect(daysUntil(new Date('2029-12-22T00:00:00Z'))).toBe(-10)
  })

  it('returns 0 for current day', () => {
    expect(daysUntil(new Date('2030-01-01T00:00:00Z'))).toBe(0)
  })

  it('rounds up partial days', () => {
    expect(daysUntil(new Date('2030-01-02T12:00:00Z'))).toBe(2)
  })
})

describe('keyDescription', () => {
  it('formats RSA key with size', () => {
    const certificate = { publicKeyAlgorithm: 'RSA', publicKeySize: 2048, publicKeyCurve: null } as CertificateInfo
    expect(keyDescription(certificate)).toBe('RSA 2048 bits')
  })

  it('formats EC key with curve', () => {
    const certificate = { publicKeyAlgorithm: 'EC', publicKeySize: 256, publicKeyCurve: 'P-256' } as CertificateInfo
    expect(keyDescription(certificate)).toBe('EC 256 bits (P-256)')
  })

  it('formats Ed25519 key with size only', () => {
    const certificate = { publicKeyAlgorithm: 'Ed25519', publicKeySize: 256, publicKeyCurve: null } as CertificateInfo
    expect(keyDescription(certificate)).toBe('Ed25519 256 bits')
  })

  it('formats algorithm alone when no size or curve', () => {
    const certificate = { publicKeyAlgorithm: 'Unknown', publicKeySize: null, publicKeyCurve: null } as CertificateInfo
    expect(keyDescription(certificate)).toBe('Unknown')
  })
})

describe('formatBasicConstraints', () => {
  it('formats CA false without pathLen', () => {
    expect(formatBasicConstraints({ ca: false })).toBe('CA=false')
  })

  it('formats CA true without pathLen', () => {
    expect(formatBasicConstraints({ ca: true })).toBe('CA=true')
  })

  it('formats CA true with pathLen', () => {
    expect(formatBasicConstraints({ ca: true, pathLen: 0 })).toBe('CA=true, pathLen=0')
  })

  it('formats CA true with non-zero pathLen', () => {
    expect(formatBasicConstraints({ ca: true, pathLen: 3 })).toBe('CA=true, pathLen=3')
  })
})

describe('computeFingerprints', () => {
  it('computes SHA-256 and SHA-1 fingerprints', async () => {
    const result = decodePem(TEST_CERT_PEM)
    assert.exists(result.der)
    const fingerprints = await computeFingerprints(result.der)
    expect(fingerprints.sha256).toBe('C8:13:EF:BE:07:01:2B:0C:62:F5:B9:36:43:D9:C1:D9:95:D4:8D:32:8B:C7:2A:84:F0:D1:D3:FD:97:5C:BF:E2')
    expect(fingerprints.sha1).toBe('35:6A:1B:B2:45:8D:52:E1:57:8C:99:9C:F8:6D:04:ED:FE:EA:E5:48')
  })
})

describe('formatDate', () => {
  it('includes year, month, day, and time components', () => {
    const date = new Date('2030-06-15T14:30:00Z')
    const formatted = formatDate(date)
    expect(formatted).toContain('2030')
    expect(formatted).toContain('June')
    expect(formatted).toContain('15')
  })
})
