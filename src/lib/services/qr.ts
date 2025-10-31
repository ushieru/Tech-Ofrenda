import QRCode from 'qrcode'
import { randomBytes } from 'crypto'

export interface QRTicket {
  qrCode: string
  qrDataUrl: string
}

/**
 * Generates a unique QR code for an attendee
 * @param attendeeId - The unique attendee ID
 * @param eventId - The event ID
 * @returns Promise with QR code string and data URL
 */
export async function generateQRTicket(attendeeId: string, eventId: string): Promise<QRTicket> {
  try {
    // Generate a unique QR code string combining attendee ID, event ID, and random bytes
    const randomSuffix = randomBytes(8).toString('hex')
    const qrCode = `${attendeeId}-${eventId}-${randomSuffix}`
    
    // Generate QR code as data URL for embedding in emails
    const qrDataUrl = await QRCode.toDataURL(qrCode, {
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    })

    return {
      qrCode,
      qrDataUrl
    }
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Validates a QR code format
 * @param qrCode - The QR code string to validate
 * @returns boolean indicating if the format is valid
 */
export function validateQRCodeFormat(qrCode: string): boolean {
  // QR code should have format: attendeeId-eventId-randomSuffix
  const parts = qrCode.split('-')
  return parts.length === 3 && parts.every(part => part.length > 0)
}

/**
 * Extracts attendee and event IDs from QR code
 * @param qrCode - The QR code string
 * @returns Object with attendeeId and eventId, or null if invalid
 */
export function parseQRCode(qrCode: string): { attendeeId: string; eventId: string } | null {
  if (!validateQRCodeFormat(qrCode)) {
    return null
  }

  const parts = qrCode.split('-')
  return {
    attendeeId: parts[0],
    eventId: parts[1]
  }
}