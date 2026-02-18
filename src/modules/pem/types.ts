export interface Asn1Node {
  tag: number
  constructed: boolean
  cls: number
  value: Uint8Array
  children?: Asn1Node[]
}

export interface CertificateInfo {
  version: number
  serialNumber: string
  signatureAlgorithm: string
  issuer: { dn: string; parts: Record<string, string> }
  subject: { dn: string; parts: Record<string, string> }
  validFrom: Date
  validTo: Date
  publicKeyAlgorithm: string
  publicKeySize: number | null
  publicKeyCurve: string | null
  subjectAltNames: string[]
  basicConstraints: { ca: boolean; pathLen?: number } | null
  keyUsage: string[] | null
  extendedKeyUsage: string[] | null
  extensions: { name: string; critical: boolean; oid: string }[]
}

export interface PemResult {
  error?: string
  type?: string
  cert?: CertificateInfo
  der?: Uint8Array
  byteLength?: number
}

export interface Fingerprints {
  sha256: string
  sha1: string
}

export type ExpirationStatus = 'valid' | 'expired' | 'not-yet'
