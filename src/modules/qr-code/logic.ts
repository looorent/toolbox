import QrScanner from 'qr-scanner'
import QRCode from 'qrcode'
import type { QrErrorCorrectionLevel, QrScanResult } from './types'

const QR_DARK_COLOR = '#e2e8f0'
const QR_LIGHT_COLOR = '#0f1117'

export async function generateQrToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  errorCorrectionLevel: QrErrorCorrectionLevel,
  width: number,
): Promise<void> {
  await QRCode.toCanvas(canvas, text, {
    errorCorrectionLevel,
    width,
    margin: 2,
    color: {
      dark: QR_DARK_COLOR,
      light: QR_LIGHT_COLOR,
    },
  })
}

export async function generateQrDataUri(text: string, errorCorrectionLevel: QrErrorCorrectionLevel, width: number): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel,
    width,
    margin: 2,
    color: {
      dark: QR_DARK_COLOR,
      light: QR_LIGHT_COLOR,
    },
  })
}

export async function scanQrFromFile(file: File): Promise<QrScanResult | null> {
  try {
    const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true })
    return { data: result.data }
  } catch (error: unknown) {
    console.error(`[QR Code Generator] Error reading QR Code from file '${file.name}'. Returning null.`, error)
    return null
  }
}

export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string): HTMLCanvasElement {
  canvas.toBlob(blob => {
    if (blob) {
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      anchor.click()
      URL.revokeObjectURL(url)
    }
  }, 'image/png')
  return canvas
}
