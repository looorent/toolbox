export interface Country {
  code: string
  totalPlates: number
  streamLicensePlates: () => Generator<string>
  sliceCount: number
  streamSlice: (sliceIndex: number) => Generator<string>
}

function makeCountry(
  code: string,
  totalPlates: number,
  sliceCount: number,
  streamSlice: (sliceIndex: number) => Generator<string>,
): Country {
  return {
    code,
    totalPlates,
    sliceCount,
    streamSlice,
    streamLicensePlates: function* () {
      for (let i = 0; i < sliceCount; i++) {
        yield* streamSlice(i)
      }
    },
  }
}

// ── Pattern helpers ──────────────────────────────────────────────────
// Each generates plates for one slice (sliced by first letter position).

const charCode = String.fromCharCode

// 3L+3D (e.g. ABC123): CY, FI, HU, LT, MT — 17,576,000 total
function* pattern3L3D(sliceIndex: number): Generator<string> {
  const c1 = charCode(65 + sliceIndex)
  for (let l2 = 0; l2 < 26; l2++) {
    for (let l3 = 0; l3 < 26; l3++) {
      const prefix = `${c1}${charCode(65 + l2)}${charCode(65 + l3)}`
      for (let num = 0; num < 1000; num++) {
        yield `${prefix}${String(num).padStart(3, '0')}`
      }
    }
  }
}

// 3D+3L (e.g. 123ABC): EE — 17,576,000 total
function* pattern3D3L(sliceIndex: number): Generator<string> {
  const c1 = charCode(65 + sliceIndex)
  for (let num = 0; num < 1000; num++) {
    const digits = String(num).padStart(3, '0')
    for (let l2 = 0; l2 < 26; l2++) {
      for (let l3 = 0; l3 < 26; l3++) {
        yield `${digits}${c1}${charCode(65 + l2)}${charCode(65 + l3)}`
      }
    }
  }
}

// 2L+5D (e.g. AB12345): DK, NO, PL, SI — 67,600,000 total
function* pattern2L5D(sliceIndex: number): Generator<string> {
  const c1 = charCode(65 + sliceIndex)
  for (let l2 = 0; l2 < 26; l2++) {
    const prefix = `${c1}${charCode(65 + l2)}`
    for (let num = 0; num < 100_000; num++) {
      yield `${prefix}${String(num).padStart(5, '0')}`
    }
  }
}

// 2L+4D (e.g. AB1234): LV — 6,760,000 total
function* pattern2L4D(sliceIndex: number): Generator<string> {
  const c1 = charCode(65 + sliceIndex)
  for (let l2 = 0; l2 < 26; l2++) {
    const prefix = `${c1}${charCode(65 + l2)}`
    for (let num = 0; num < 10_000; num++) {
      yield `${prefix}${String(num).padStart(4, '0')}`
    }
  }
}

// 2L+3D (e.g. AB123): IS — 676,000 total
function* pattern2L3D(sliceIndex: number): Generator<string> {
  const c1 = charCode(65 + sliceIndex)
  for (let l2 = 0; l2 < 26; l2++) {
    const prefix = `${c1}${charCode(65 + l2)}`
    for (let num = 0; num < 1000; num++) {
      yield `${prefix}${String(num).padStart(3, '0')}`
    }
  }
}

// 2L+3D+2L (e.g. AB123CD): FR, IT, RO, SK — 456,976,000 total
function* pattern2L3D2L(sliceIndex: number): Generator<string> {
  const c1 = charCode(65 + sliceIndex)
  for (let l2 = 0; l2 < 26; l2++) {
    const prefix = `${c1}${charCode(65 + l2)}`
    for (let num = 0; num < 1000; num++) {
      const digits = String(num).padStart(3, '0')
      for (let l3 = 0; l3 < 26; l3++) {
        for (let l4 = 0; l4 < 26; l4++) {
          yield `${prefix}${digits}${charCode(65 + l3)}${charCode(65 + l4)}`
        }
      }
    }
  }
}

// 2L+4D+1L (e.g. AB1234C): AT, HR — 175,760,000 total
function* pattern2L4D1L(sliceIndex: number): Generator<string> {
  const c1 = charCode(65 + sliceIndex)
  for (let l2 = 0; l2 < 26; l2++) {
    const prefix = `${c1}${charCode(65 + l2)}`
    for (let num = 0; num < 10_000; num++) {
      const digits = String(num).padStart(4, '0')
      for (let l3 = 0; l3 < 26; l3++) {
        yield `${prefix}${digits}${charCode(65 + l3)}`
      }
    }
  }
}

// 1L+4D+2L (e.g. A1234BC): BG — 175,760,000 total
function* pattern1L4D2L(sliceIndex: number): Generator<string> {
  const c1 = charCode(65 + sliceIndex)
  for (let num = 0; num < 10_000; num++) {
    const digits = String(num).padStart(4, '0')
    for (let l2 = 0; l2 < 26; l2++) {
      for (let l3 = 0; l3 < 26; l3++) {
        yield `${c1}${digits}${charCode(65 + l2)}${charCode(65 + l3)}`
      }
    }
  }
}

// 3L+4D (e.g. ABC1234): GR — 175,760,000 total
function* pattern3L4D(sliceIndex: number): Generator<string> {
  const c1 = charCode(65 + sliceIndex)
  for (let l2 = 0; l2 < 26; l2++) {
    for (let l3 = 0; l3 < 26; l3++) {
      const prefix = `${c1}${charCode(65 + l2)}${charCode(65 + l3)}`
      for (let num = 0; num < 10_000; num++) {
        yield `${prefix}${String(num).padStart(4, '0')}`
      }
    }
  }
}

// 4D+3L (e.g. 1234ABC): ES — 175,760,000 total
function* pattern4D3L(sliceIndex: number): Generator<string> {
  const c1 = charCode(65 + sliceIndex)
  for (let num = 0; num < 10_000; num++) {
    const digits = String(num).padStart(4, '0')
    for (let l2 = 0; l2 < 26; l2++) {
      for (let l3 = 0; l3 < 26; l3++) {
        yield `${digits}${c1}${charCode(65 + l2)}${charCode(65 + l3)}`
      }
    }
  }
}

// 2L+2D+2L (e.g. AB12CD): PT, GB — 45,697,600 total
function* pattern2L2D2L(sliceIndex: number): Generator<string> {
  const c1 = charCode(65 + sliceIndex)
  for (let l2 = 0; l2 < 26; l2++) {
    const prefix = `${c1}${charCode(65 + l2)}`
    for (let num = 0; num < 100; num++) {
      const digits = String(num).padStart(2, '0')
      for (let l3 = 0; l3 < 26; l3++) {
        for (let l4 = 0; l4 < 26; l4++) {
          yield `${prefix}${digits}${charCode(65 + l3)}${charCode(65 + l4)}`
        }
      }
    }
  }
}

// 3L+2D+1L (e.g. ABC12D): SE — 45,697,600 total
function* pattern3L2D1L(sliceIndex: number): Generator<string> {
  const c1 = charCode(65 + sliceIndex)
  for (let l2 = 0; l2 < 26; l2++) {
    for (let l3 = 0; l3 < 26; l3++) {
      const prefix = `${c1}${charCode(65 + l2)}${charCode(65 + l3)}`
      for (let num = 0; num < 100; num++) {
        for (let l4 = 0; l4 < 26; l4++) {
          yield `${prefix}${String(num).padStart(2, '0')}${charCode(65 + l4)}`
        }
      }
    }
  }
}

// ── Belgium ──────────────────────────────────────────────────────────
// Format (since 2010): 1-ABC-123
// Digit: 1-9, Letters: A-Z³, Numbers: 000-999
// Total: 9 × 26³ × 1000 = 158,184,000 — Slices: 9

function* streamBelgiumSlice(sliceIndex: number): Generator<string> {
  const digit = sliceIndex + 1
  for (let l1 = 0; l1 < 26; l1++) {
    for (let l2 = 0; l2 < 26; l2++) {
      for (let l3 = 0; l3 < 26; l3++) {
        const letters = `${charCode(65 + l1)}${charCode(65 + l2)}${charCode(65 + l3)}`
        for (let num = 0; num < 1000; num++) {
          yield `${digit}${letters}${String(num).padStart(3, '0')}`
        }
      }
    }
  }
}

// ── Luxembourg ───────────────────────────────────────────────────────
// Numeric plates: 1 to 999999
// Total: 999,999 — Slices: 9

const LU_SLICE_COUNT = 9

function* streamLuxembourgSlice(sliceIndex: number): Generator<string> {
  const sliceSize = Math.ceil(999_999 / LU_SLICE_COUNT)
  const start = sliceIndex * sliceSize + 1
  const end = Math.min((sliceIndex + 1) * sliceSize, 999_999)
  for (let num = start; num <= end; num++) {
    yield String(num)
  }
}

// ── Netherlands ──────────────────────────────────────────────────────
// Sidecodes 6-9:
//   6: 99XXXX (45,697,600)  7: XX99XX (45,697,600)
//   8: 9XXX99 (17,576,000)  9: X999XX (17,576,000)
// Total: 126,547,200 — Slices: 26

const NL_TOTAL = 45_697_600 + 45_697_600 + 17_576_000 + 17_576_000

function* streamNetherlandsSlice(sliceIndex: number): Generator<string> {
  yield* streamNlSidecode6(sliceIndex)
  yield* streamNlSidecode7(sliceIndex)
  yield* streamNlSidecode8(sliceIndex)
  yield* streamNlSidecode9(sliceIndex)
}

function* streamNlSidecode6(l1: number): Generator<string> {
  const c1 = charCode(65 + l1)
  for (let d1 = 0; d1 < 10; d1++) {
    for (let d2 = 0; d2 < 10; d2++) {
      for (let l2 = 0; l2 < 26; l2++) {
        for (let l3 = 0; l3 < 26; l3++) {
          for (let l4 = 0; l4 < 26; l4++) {
            yield `${d1}${d2}${c1}${charCode(65 + l2)}${charCode(65 + l3)}${charCode(65 + l4)}`
          }
        }
      }
    }
  }
}

function* streamNlSidecode7(l1: number): Generator<string> {
  const c1 = charCode(65 + l1)
  for (let l2 = 0; l2 < 26; l2++) {
    for (let d1 = 0; d1 < 10; d1++) {
      for (let d2 = 0; d2 < 10; d2++) {
        for (let l3 = 0; l3 < 26; l3++) {
          for (let l4 = 0; l4 < 26; l4++) {
            yield `${c1}${charCode(65 + l2)}${d1}${d2}${charCode(65 + l3)}${charCode(65 + l4)}`
          }
        }
      }
    }
  }
}

function* streamNlSidecode8(l1: number): Generator<string> {
  const c1 = charCode(65 + l1)
  for (let d1 = 0; d1 < 10; d1++) {
    for (let l2 = 0; l2 < 26; l2++) {
      for (let l3 = 0; l3 < 26; l3++) {
        for (let d2 = 0; d2 < 10; d2++) {
          for (let d3 = 0; d3 < 10; d3++) {
            yield `${d1}${c1}${charCode(65 + l2)}${charCode(65 + l3)}${d2}${d3}`
          }
        }
      }
    }
  }
}

function* streamNlSidecode9(l1: number): Generator<string> {
  const c1 = charCode(65 + l1)
  for (let d1 = 0; d1 < 10; d1++) {
    for (let d2 = 0; d2 < 10; d2++) {
      for (let d3 = 0; d3 < 10; d3++) {
        for (let l2 = 0; l2 < 26; l2++) {
          for (let l3 = 0; l3 < 26; l3++) {
            yield `${c1}${d1}${d2}${d3}${charCode(65 + l2)}${charCode(65 + l3)}`
          }
        }
      }
    }
  }
}

// ── Germany ──────────────────────────────────────────────────────────
// 2-letter district + 1 letter + 1-4 digits (no padding)
// Total: 676 × 26 × 9999 = 175,742,424 — Slices: 26

const DE_TOTAL = 676 * 26 * 9999

function* streamGermanySlice(sliceIndex: number): Generator<string> {
  const c1 = charCode(65 + sliceIndex)
  for (let l2 = 0; l2 < 26; l2++) {
    const district = `${c1}${charCode(65 + l2)}`
    for (let l3 = 0; l3 < 26; l3++) {
      const prefix = `${district}${charCode(65 + l3)}`
      for (let num = 1; num <= 9999; num++) {
        yield `${prefix}${num}`
      }
    }
  }
}

// ── Switzerland ───────────────────────────────────────────────────────
// Canton code (2 letters) + 1-6 digit number
// 26 cantons × 999,999 = 25,999,974 — Slices: 26

const CH_CANTONS = [
  'AG',
  'AI',
  'AR',
  'BE',
  'BL',
  'BS',
  'FR',
  'GE',
  'GL',
  'GR',
  'JU',
  'LU',
  'NE',
  'NW',
  'OW',
  'SG',
  'SH',
  'SO',
  'SZ',
  'TG',
  'TI',
  'UR',
  'VD',
  'VS',
  'ZG',
  'ZH',
] as const
const CH_TOTAL = CH_CANTONS.length * 999_999

function* streamSwitzerlandSlice(sliceIndex: number): Generator<string> {
  const canton = CH_CANTONS[sliceIndex]
  for (let num = 1; num <= 999_999; num++) {
    yield `${canton}${num}`
  }
}

// ── Czech Republic ───────────────────────────────────────────────────
// 1 digit (region) + 2 letters + 4 padded digits (e.g. 1AB2345)
// Total: 10 × 676 × 10000 = 67,600,000 — Slices: 26

const CZ_TOTAL = 10 * 676 * 10_000

function* streamCzechSlice(sliceIndex: number): Generator<string> {
  const c1 = charCode(65 + sliceIndex)
  for (let d1 = 0; d1 < 10; d1++) {
    for (let l2 = 0; l2 < 26; l2++) {
      const prefix = `${d1}${c1}${charCode(65 + l2)}`
      for (let num = 0; num < 10_000; num++) {
        yield `${prefix}${String(num).padStart(4, '0')}`
      }
    }
  }
}

// ── Ireland ──────────────────────────────────────────────────────────
// 3 padded digits (year) + 1 letter (county) + 4 padded digits (sequence)
// Total: 1000 × 26 × 10000 = 260,000,000 — Slices: 26

const IE_TOTAL = 1000 * 26 * 10_000

function* streamIrelandSlice(sliceIndex: number): Generator<string> {
  const c1 = charCode(65 + sliceIndex)
  for (let year = 0; year < 1000; year++) {
    const prefix = `${String(year).padStart(3, '0')}${c1}`
    for (let seq = 0; seq < 10_000; seq++) {
      yield `${prefix}${String(seq).padStart(4, '0')}`
    }
  }
}

// ── Liechtenstein ────────────────────────────────────────────────────
// "FL" prefix + 1-5 digit number
// Total: 99,999 — Slices: 9

const LI_SLICE_COUNT = 9

function* streamLiechtensteinSlice(sliceIndex: number): Generator<string> {
  const sliceSize = Math.ceil(99_999 / LI_SLICE_COUNT)
  const start = sliceIndex * sliceSize + 1
  const end = Math.min((sliceIndex + 1) * sliceSize, 99_999)
  for (let num = start; num <= end; num++) {
    yield `FL${num}`
  }
}

// ── Registry ─────────────────────────────────────────────────────────

export const countriesByCode: Record<string, Country> = {
  // Custom generators
  BE: makeCountry('BE', 9 * 26 ** 3 * 1000, 9, streamBelgiumSlice),
  LU: makeCountry('LU', 999_999, LU_SLICE_COUNT, streamLuxembourgSlice),
  NL: makeCountry('NL', NL_TOTAL, 26, streamNetherlandsSlice),
  DE: makeCountry('DE', DE_TOTAL, 26, streamGermanySlice),
  CH: makeCountry('CH', CH_TOTAL, CH_CANTONS.length, streamSwitzerlandSlice),
  CZ: makeCountry('CZ', CZ_TOTAL, 26, streamCzechSlice),
  IE: makeCountry('IE', IE_TOTAL, 26, streamIrelandSlice),
  LI: makeCountry('LI', 99_999, LI_SLICE_COUNT, streamLiechtensteinSlice),

  // 2L+3D+2L (456,976,000)
  FR: makeCountry('FR', 26 ** 2 * 1000 * 26 ** 2, 26, pattern2L3D2L),
  IT: makeCountry('IT', 26 ** 2 * 1000 * 26 ** 2, 26, pattern2L3D2L),
  RO: makeCountry('RO', 26 ** 2 * 1000 * 26 ** 2, 26, pattern2L3D2L),
  SK: makeCountry('SK', 26 ** 2 * 1000 * 26 ** 2, 26, pattern2L3D2L),

  // 2L+4D+1L (175,760,000)
  AT: makeCountry('AT', 26 ** 2 * 10_000 * 26, 26, pattern2L4D1L),
  HR: makeCountry('HR', 26 ** 2 * 10_000 * 26, 26, pattern2L4D1L),

  // 1L+4D+2L (175,760,000)
  BG: makeCountry('BG', 26 * 10_000 * 26 ** 2, 26, pattern1L4D2L),

  // 3L+4D (175,760,000)
  GR: makeCountry('GR', 26 ** 3 * 10_000, 26, pattern3L4D),

  // 4D+3L (175,760,000)
  ES: makeCountry('ES', 10_000 * 26 ** 3, 26, pattern4D3L),

  // 3L+3D (17,576,000)
  CY: makeCountry('CY', 26 ** 3 * 1000, 26, pattern3L3D),
  FI: makeCountry('FI', 26 ** 3 * 1000, 26, pattern3L3D),
  HU: makeCountry('HU', 26 ** 3 * 1000, 26, pattern3L3D),
  LT: makeCountry('LT', 26 ** 3 * 1000, 26, pattern3L3D),
  MT: makeCountry('MT', 26 ** 3 * 1000, 26, pattern3L3D),

  // 3D+3L (17,576,000)
  EE: makeCountry('EE', 1000 * 26 ** 3, 26, pattern3D3L),

  // 2L+5D (67,600,000)
  DK: makeCountry('DK', 26 ** 2 * 100_000, 26, pattern2L5D),
  NO: makeCountry('NO', 26 ** 2 * 100_000, 26, pattern2L5D),
  PL: makeCountry('PL', 26 ** 2 * 100_000, 26, pattern2L5D),
  SI: makeCountry('SI', 26 ** 2 * 100_000, 26, pattern2L5D),

  // 2L+4D (6,760,000)
  LV: makeCountry('LV', 26 ** 2 * 10_000, 26, pattern2L4D),

  // 2L+3D (676,000)
  IS: makeCountry('IS', 26 ** 2 * 1000, 26, pattern2L3D),

  // 2L+2D+2L (45,697,600)
  GB: makeCountry('GB', 26 ** 2 * 100 * 26 ** 2, 26, pattern2L2D2L),
  PT: makeCountry('PT', 26 ** 2 * 100 * 26 ** 2, 26, pattern2L2D2L),

  // 3L+2D+1L (45,697,600)
  SE: makeCountry('SE', 26 ** 3 * 100 * 26, 26, pattern3L2D1L),
}
