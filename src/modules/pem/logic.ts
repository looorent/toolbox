import type { Asn1Node, CertificateInfo, ExpirationStatus, Fingerprints, PemResult } from './types'

export const SAMPLE_PEM = `-----BEGIN CERTIFICATE-----
MIID1DCCArygAwIBAgIUH/u/f6mmWHTpcx8UnlP9+ZGi7uIwDQYJKoZIhvcNAQEL
BQAwZjELMAkGA1UEBhMCVVMxEzARBgNVBAgMCkNhbGlmb3JuaWExFjAUBgNVBAcM
DVNhbiBGcmFuY2lzY28xFDASBgNVBAoMC0V4YW1wbGUgSW5jMRQwEgYDVQQDDAtl
eGFtcGxlLmNvbTAeFw0yNjAyMTcyMzU0MDZaFw0zNjAyMTUyMzU0MDZaMGYxCzAJ
BgNVBAYTAlVTMRMwEQYDVQQIDApDYWxpZm9ybmlhMRYwFAYDVQQHDA1TYW4gRnJh
bmNpc2NvMRQwEgYDVQQKDAtFeGFtcGxlIEluYzEUMBIGA1UEAwwLZXhhbXBsZS5j
b20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDd4/v/9RHc0LgacSSO
E39GHXjiCJsF8HxT3Z3o05c05c9Jg2FgCXoa1qJOQ+M+pw7qMMnmaK/hA5ghMBnc
/8V3W/jT9e6UYvNRLGnf2zTIUw16c2zRyMLN9TBduKOrF18iKget1f85aB8s7eN3
GrsI4gopshZSG635QibqqL0dibsF341lx6t4LfPGgy0SCF1duOx8xRg2R5EeonvO
UEwnx2fLNVwvvTH9kW2+Z8/3wJlEk7yRBBO1tO1hLlPJUVHIQvuLCBsMeipdoBVS
CclRipE56XFb9hJX99ri3F5GJjOrqR52Bzmuc8L1wHLoIaYgTQDIphBKtUjz9TgC
qrtHAgMBAAGjejB4MB0GA1UdDgQWBBQSS03q63LlQnwQFzKgIv9oLo4LVzAfBgNV
HSMEGDAWgBQSS03q63LlQnwQFzKgIv9oLo4LVzAPBgNVHRMBAf8EBTADAQH/MCUG
A1UdEQQeMByCC2V4YW1wbGUuY29tgg0qLmV4YW1wbGUuY29tMA0GCSqGSIb3DQEB
CwUAA4IBAQCpvsOgzrmCCAv6okatoYz9zhUbftCMI5FlYp/BGp7ss5bf0LqIbjwH
9NQmBToRIgmdGOODU6XaVAQebCgvZt0SZUcZXiqfdTpwi0Bw6fDdXJZ6gd8jpNKf
Co5Dx2RHEmzFeqCDTXAmxJnIbY96+/Dc2mkvCEORfb8qPOeJ13vUp6A8QpzScknZ
hVW/eoUV5MyrSOiUltTp0L2Jm4hCocJGcxIUz9/rQqf9CbEMRT3nlBYSPxuOPEAh
Wz1AF2BihyQkZyoZl4qLAIKwFcSEHqEFZguawDKS5B7ZF2BADOI6r69CNdhK7pfd
gA5jzXYEAzk8oesyYBWAsUgeTfHGYX0q
-----END CERTIFICATE-----`

export function decodePem(pemStr: string): PemResult {
  const lines = pemStr.trim().split('\n')
  const headerMatch = lines[0]?.match(/^-----BEGIN (.+)-----$/)
  const footerMatch = lines[lines.length - 1]?.match(/^-----END (.+)-----$/)

  if (!headerMatch || !footerMatch) {
    return { error: 'Invalid PEM format: missing BEGIN/END markers' }
  }

  const type = headerMatch[1] ?? 'UNKNOWN'
  const der = decodeBase64(lines.slice(1, -1).join(''))

  if (der === null) {
    return { error: 'Invalid Base64 content in PEM' }
  } else if (type !== 'CERTIFICATE') {
    return { type, der, byteLength: der.length }
  } else {
    return decodeCertificatePem(type, der)
  }
}

export function validityStatus(validFrom: Date, validTo: Date): ExpirationStatus {
  const now = new Date()
  if (now < validFrom) {
    return 'not-yet'
  } else if (now > validTo) {
    return 'expired'
  } else {
    return 'valid'
  }
}

export function validityMessage(validFrom: Date, validTo: Date): string {
  const status = validityStatus(validFrom, validTo)
  switch (status) {
    case 'valid':
      return `Certificate is valid (expires in ${daysUntil(validTo)} days)`
    case 'expired':
      return `Certificate has expired (${formatDate(validTo)})`
    case 'not-yet':
      return `Certificate is not yet valid (starts ${formatDate(validFrom)})`
  }
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  })
}

export function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export function keyDescription(certificate: CertificateInfo): string {
  const sizePart = certificate.publicKeySize ? ` ${certificate.publicKeySize} bits` : ''
  const curvePart = certificate.publicKeyCurve ? ` (${certificate.publicKeyCurve})` : ''
  return `${certificate.publicKeyAlgorithm}${sizePart}${curvePart}`
}

export async function computeFingerprints(der: Uint8Array): Promise<Fingerprints> {
  const [sha256Buffer, sha1Buffer] = await Promise.all([
    crypto.subtle.digest('SHA-256', der as BufferSource),
    crypto.subtle.digest('SHA-1', der as BufferSource),
  ])
  return {
    sha256: toHex(new Uint8Array(sha256Buffer)),
    sha1: toHex(new Uint8Array(sha1Buffer)),
  }
}

export function formatBasicConstraints(basicConstraints: { ca: boolean; pathLen?: number }): string {
  const pathLenPart = basicConstraints.pathLen !== undefined ? `, pathLen=${basicConstraints.pathLen}` : ''
  return `CA=${basicConstraints.ca}${pathLenPart}`
}

const EMPTY_NODE: Asn1Node = { tag: 0, constructed: false, cls: 0, value: new Uint8Array(), children: undefined }

function safeGet(data: Uint8Array, index: number): number {
  return data[index] ?? 0
}

function safeChild(node: Asn1Node, index: number): Asn1Node {
  return node.children?.[index] ?? EMPTY_NODE
}

function decodeUtf8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes)
}

function toHex(bytes: Uint8Array, separator = ':'): string {
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0').toUpperCase())
    .join(separator)
}

function parseAsn1Length(data: Uint8Array, position: number): { length: number; endPosition: number } {
  const firstByte = safeGet(data, position)
  if (firstByte & 0x80) {
    const byteCount = firstByte & 0x7f
    let length = 0
    for (let offset = 1; offset <= byteCount; offset++) {
      length = (length << 8) | safeGet(data, position + offset)
    }
    return { length, endPosition: position + 1 + byteCount }
  } else {
    return { length: firstByte, endPosition: position + 1 }
  }
}

function parseAsn1Children(data: Uint8Array, start: number, end: number): Asn1Node[] {
  const children: Asn1Node[] = []
  let childPosition = start
  while (childPosition < end) {
    const result = parseAsn1(data, childPosition)
    children.push(result.node)
    childPosition = result.next
  }
  return children
}

function parseAsn1(data: Uint8Array, position = 0): { node: Asn1Node; next: number } {
  const tagByte = safeGet(data, position)
  const tag = tagByte & 0x1f
  const constructed = !!(tagByte & 0x20)
  const cls = (tagByte >> 6) & 0x03

  const { length, endPosition } = parseAsn1Length(data, position + 1)
  const value = data.slice(endPosition, endPosition + length)
  const children = constructed ? parseAsn1Children(data, endPosition, endPosition + length) : undefined

  return { node: { tag, constructed, cls, value, children }, next: endPosition + length }
}

function parseOid(bytes: Uint8Array): string {
  const firstByte = safeGet(bytes, 0)
  const parts = [Math.floor(firstByte / 40), firstByte % 40]
  let accumulator = 0
  for (let index = 1; index < bytes.length; index++) {
    const currentByte = safeGet(bytes, index)
    accumulator = (accumulator << 7) | (currentByte & 0x7f)
    if (!(currentByte & 0x80)) {
      parts.push(accumulator)
      accumulator = 0
    }
  }
  return parts.join('.')
}

function resolveOid(bytes: Uint8Array): string {
  const oid = parseOid(bytes)
  return OID_NAMES[oid] ?? oid
}

const OID_NAMES: Record<string, string> = {
  '2.5.4.3': 'CN',
  '2.5.4.5': 'serialNumber',
  '2.5.4.6': 'C',
  '2.5.4.7': 'L',
  '2.5.4.8': 'ST',
  '2.5.4.10': 'O',
  '2.5.4.11': 'OU',
  '0.9.2342.19200300.100.1.25': 'DC',
  '1.2.840.113549.1.9.1': 'emailAddress',
  '1.2.840.113549.1.1.1': 'RSA',
  '1.2.840.113549.1.1.4': 'MD5 with RSA',
  '1.2.840.113549.1.1.5': 'SHA-1 with RSA',
  '1.2.840.113549.1.1.11': 'SHA-256 with RSA',
  '1.2.840.113549.1.1.12': 'SHA-384 with RSA',
  '1.2.840.113549.1.1.13': 'SHA-512 with RSA',
  '1.2.840.113549.1.1.10': 'RSASSA-PSS',
  '1.2.840.10045.2.1': 'EC',
  '1.2.840.10045.4.3.2': 'ECDSA with SHA-256',
  '1.2.840.10045.4.3.3': 'ECDSA with SHA-384',
  '1.2.840.10045.4.3.4': 'ECDSA with SHA-512',
  '1.3.101.112': 'Ed25519',
  '1.3.101.113': 'Ed448',
  '1.2.840.10045.3.1.7': 'P-256',
  '1.3.132.0.34': 'P-384',
  '1.3.132.0.35': 'P-521',
  '2.5.29.14': 'Subject Key Identifier',
  '2.5.29.15': 'Key Usage',
  '2.5.29.17': 'Subject Alternative Name',
  '2.5.29.19': 'Basic Constraints',
  '2.5.29.31': 'CRL Distribution Points',
  '2.5.29.32': 'Certificate Policies',
  '2.5.29.35': 'Authority Key Identifier',
  '2.5.29.37': 'Extended Key Usage',
  '1.3.6.1.5.5.7.1.1': 'Authority Information Access',
  '1.3.6.1.5.5.7.3.1': 'Server Authentication',
  '1.3.6.1.5.5.7.3.2': 'Client Authentication',
  '1.3.6.1.5.5.7.3.3': 'Code Signing',
  '1.3.6.1.5.5.7.3.4': 'Email Protection',
  '1.3.6.1.5.5.7.3.8': 'Time Stamping',
  '1.3.6.1.5.5.7.3.9': 'OCSP Signing',
  '1.3.6.1.5.5.7.48.1': 'OCSP',
  '1.3.6.1.5.5.7.48.2': 'CA Issuers',
}

const KEY_USAGE_BITS = [
  'Digital Signature',
  'Non Repudiation',
  'Key Encipherment',
  'Data Encipherment',
  'Key Agreement',
  'Certificate Sign',
  'CRL Sign',
  'Encipher Only',
  'Decipher Only',
]

const CURVE_SIZES: Record<string, number> = {
  'P-256': 256,
  'P-384': 384,
  'P-521': 521,
}

function parseDn(node: Asn1Node): { dn: string; parts: Record<string, string> } {
  const entries = (node.children ?? []).flatMap(set =>
    (set.children ?? []).map(seq => ({
      name: resolveOid(safeChild(seq, 0).value),
      value: decodeUtf8(safeChild(seq, 1).value),
    })),
  )
  return {
    dn: entries.map(entry => `${entry.name}=${entry.value}`).join(', '),
    parts: Object.fromEntries(entries.map(entry => [entry.name, entry.value])),
  }
}

function parseTime(node: Asn1Node): Date {
  const timeString = decodeUtf8(node.value)
  if (node.tag === 0x17) {
    const year2Digit = Number.parseInt(timeString.slice(0, 2), 10)
    const year = year2Digit >= 50 ? 1900 + year2Digit : 2000 + year2Digit
    return new Date(
      `${year}-${timeString.slice(2, 4)}-${timeString.slice(4, 6)}T${timeString.slice(6, 8)}:${timeString.slice(8, 10)}:${timeString.slice(10, 12)}Z`,
    )
  } else {
    return new Date(
      `${timeString.slice(0, 4)}-${timeString.slice(4, 6)}-${timeString.slice(6, 8)}T${timeString.slice(8, 10)}:${timeString.slice(10, 12)}:${timeString.slice(12, 14)}Z`,
    )
  }
}

function parseVersion(tbs: Asn1Node): { version: number; fieldOffset: number } {
  const firstChild = safeChild(tbs, 0)
  if (firstChild.cls === 2 && firstChild.tag === 0) {
    return { version: safeGet(safeChild(firstChild, 0).value, 0) + 1, fieldOffset: 1 }
  } else {
    return { version: 1, fieldOffset: 0 }
  }
}

function parsePublicKeyInfo(spki: Asn1Node): { algorithm: string; keySize: number | null; curve: string | null } {
  const keyAlgOid = parseOid(safeChild(safeChild(spki, 0), 0).value)
  const algorithm = OID_NAMES[keyAlgOid] ?? keyAlgOid
  const { keySize, curve } = parseKeyDetails(spki, keyAlgOid)
  return { algorithm, keySize, curve }
}

function parseKeyDetails(spki: Asn1Node, keyAlgOid: string): { keySize: number | null; curve: string | null } {
  switch (keyAlgOid) {
    case '1.2.840.113549.1.1.1': {
      return { keySize: parseRsaKeySize(spki), curve: null }
    }
    case '1.2.840.10045.2.1': {
      return parseEcKeyDetails(spki)
    }
    case '1.3.101.112': {
      return { keySize: 256, curve: null }
    }
    case '1.3.101.113': {
      return { keySize: 448, curve: null }
    }
    default: {
      return { keySize: null, curve: null }
    }
  }
}

function parseRsaKeySize(spki: Asn1Node): number {
  const bitStr = safeChild(spki, 1).value
  const { node: rsaSeq } = parseAsn1(bitStr.slice(1))
  const modulus = safeChild(rsaSeq, 0).value
  return (safeGet(modulus, 0) === 0 ? modulus.length - 1 : modulus.length) * 8
}

function parseEcKeyDetails(spki: Asn1Node): { keySize: number | null; curve: string | null } {
  const curveOid = parseOid(safeChild(safeChild(spki, 0), 1).value)
  const curve = OID_NAMES[curveOid] ?? curveOid
  return { keySize: CURVE_SIZES[curve] ?? null, curve }
}

interface RawExtension {
  oid: string
  name: string
  critical: boolean
  value: Uint8Array
}

function parseRawExtension(ext: Asn1Node): RawExtension {
  const oid = parseOid(safeChild(ext, 0).value)
  const name = OID_NAMES[oid] ?? oid
  const { critical, valueIndex } = parseExtensionCriticalFlag(ext)
  const value = safeChild(ext, valueIndex).value
  return { oid, name, critical, value }
}

function parseExtensionCriticalFlag(ext: Asn1Node): { critical: boolean; valueIndex: number } {
  const candidate = safeChild(ext, 1)
  if (candidate.tag === 0x01) {
    return { critical: safeGet(candidate.value, 0) !== 0, valueIndex: 2 }
  } else {
    return { critical: false, valueIndex: 1 }
  }
}

function findExtensionValue<T>(extensions: RawExtension[], oid: string, parser: (value: Uint8Array) => T): T | null {
  const extension = extensions.find(ext => ext.oid === oid)
  if (extension) {
    try {
      return parser(extension.value)
    } catch {
      return null
    }
  } else {
    return null
  }
}

function parseSanEntry(san: Asn1Node): string | null {
  switch (san.tag) {
    case 1:
    case 2: {
      return decodeUtf8(san.value)
    }
    case 7: {
      return san.value.length === 4 ? Array.from(san.value).join('.') : null
    }
    default: {
      return null
    }
  }
}

function parseSanExtension(extValue: Uint8Array): string[] {
  const { node: sanSeq } = parseAsn1(extValue)
  return (sanSeq.children ?? []).map(parseSanEntry).filter((entry): entry is string => entry !== null)
}

function parseBasicConstraintsExtension(extValue: Uint8Array): { ca: boolean; pathLen?: number } {
  const { node: bcSeq } = parseAsn1(extValue)
  const firstChild = bcSeq.children?.length ? safeChild(bcSeq, 0) : null
  const ca = firstChild !== null && firstChild.tag === 0x01 && safeGet(firstChild.value, 0) !== 0
  const pathLen = bcSeq.children?.length === 2 ? safeGet(safeChild(bcSeq, 1).value, 0) : undefined
  return { ca, pathLen }
}

function parseKeyUsageExtension(extValue: Uint8Array): string[] {
  const { node: bitstringNode } = parseAsn1(extValue)
  const usageBits = bitstringNode.value.slice(1)
  return KEY_USAGE_BITS.filter((_, bitIndex) => {
    const byteIndex = Math.floor(bitIndex / 8)
    const bitPosition = 7 - (bitIndex % 8)
    return byteIndex < usageBits.length && safeGet(usageBits, byteIndex) & (1 << bitPosition)
  })
}

function parseExtendedKeyUsageExtension(extValue: Uint8Array): string[] {
  const { node: ekuSeq } = parseAsn1(extValue)
  return (ekuSeq.children ?? []).map(ekuNode => resolveOid(ekuNode.value))
}

function findExtensionNodes(tbs: Asn1Node, startIndex: number): Asn1Node[] {
  const extensionContainer = (tbs.children ?? []).slice(startIndex).find(child => child.cls === 2 && child.tag === 3)
  if (extensionContainer) {
    return safeChild(extensionContainer, 0).children ?? []
  } else {
    return []
  }
}

function parseCertificateExtensions(tbs: Asn1Node, startIndex: number) {
  const raw = findExtensionNodes(tbs, startIndex).map(parseRawExtension)

  return {
    subjectAltNames: findExtensionValue(raw, '2.5.29.17', parseSanExtension) ?? [],
    basicConstraints: findExtensionValue(raw, '2.5.29.19', parseBasicConstraintsExtension),
    keyUsage: findExtensionValue(raw, '2.5.29.15', parseKeyUsageExtension),
    extendedKeyUsage: findExtensionValue(raw, '2.5.29.37', parseExtendedKeyUsageExtension),
    extensions: raw.map(({ name, critical, oid }) => ({ name, critical, oid })),
  }
}

function parseCertificate(der: Uint8Array): CertificateInfo {
  const { node: cert } = parseAsn1(der)
  const tbs = safeChild(cert, 0)
  const { version, fieldOffset } = parseVersion(tbs)

  let index = fieldOffset
  const serialNumber = toHex(safeChild(tbs, index++).value)
  const signatureAlgorithm = resolveOid(safeChild(safeChild(tbs, index++), 0).value)
  const issuer = parseDn(safeChild(tbs, index++))
  const validity = safeChild(tbs, index++)
  const validFrom = parseTime(safeChild(validity, 0))
  const validTo = parseTime(safeChild(validity, 1))
  const subject = parseDn(safeChild(tbs, index++))
  const { algorithm: publicKeyAlgorithm, keySize: publicKeySize, curve: publicKeyCurve } = parsePublicKeyInfo(safeChild(tbs, index++))
  const { subjectAltNames, basicConstraints, keyUsage, extendedKeyUsage, extensions } = parseCertificateExtensions(tbs, index)

  return {
    version,
    serialNumber,
    signatureAlgorithm,
    issuer,
    subject,
    validFrom,
    validTo,
    publicKeyAlgorithm,
    publicKeySize,
    publicKeyCurve,
    subjectAltNames,
    basicConstraints,
    keyUsage,
    extendedKeyUsage,
    extensions,
  }
}

function decodeBase64(base64Content: string): Uint8Array | null {
  try {
    const binary = atob(base64Content)
    return Uint8Array.from(binary, character => character.charCodeAt(0))
  } catch {
    return null
  }
}

function decodeCertificatePem(type: string, der: Uint8Array): PemResult {
  try {
    const cert = parseCertificate(der)
    return { type, cert, der, byteLength: der.length }
  } catch (error: unknown) {
    return { error: `Failed to parse certificate: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}
