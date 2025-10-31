'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'

interface QRScannerProps {
  eventId: string
  onCheckInSuccess?: (data: any) => void
  onCheckInError?: (error: string) => void
}

interface CheckInResult {
  message: string
  attendee: {
    id: string
    user: {
      id: string
      name: string
      email: string
      image?: string
    }
    checkedIn: boolean
    checkedInAt: string | null
    alreadyCheckedIn: boolean
  }
  event: {
    id: string
    title: string
    date: string
    location: string
  }
}

export function QRScanner({ eventId, onCheckInSuccess, onCheckInError }: QRScannerProps) {
  const [qrCode, setQrCode] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleCheckIn = async (qrCodeValue: string) => {
    if (!qrCodeValue.trim()) {
      setError('Por favor ingresa un código QR')
      return
    }

    setIsProcessing(true)
    setError(null)
    setLastResult(null)

    try {
      const response = await fetch(`/api/events/${eventId}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrCode: qrCodeValue.trim() }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al procesar check-in')
      }

      setLastResult(result)
      setQrCode('')
      onCheckInSuccess?.(result)
      
      // Focus back to input for next scan
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al procesar check-in'
      setError(errorMessage)
      onCheckInError?.(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCheckIn(qrCode)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCheckIn(qrCode)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-orange-600 mb-2">
          📱 Check-in con QR
        </h3>
        <p className="text-gray-600">
          Escanea o ingresa el código QR del asistente para realizar el check-in
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="qrCode" className="block text-sm font-medium text-gray-700 mb-1">
            Código QR
          </label>
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              id="qrCode"
              type="text"
              placeholder="Escanea o pega el código QR aquí"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              autoFocus
            />
            <Button
              type="submit"
              disabled={isProcessing || !qrCode.trim()}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Procesando...
                </span>
              ) : (
                '✓ Check-in'
              )}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <p>{error}</p>
          </Alert>
        )}

        {lastResult && (
          <div className={`rounded-lg p-4 border-2 ${
            lastResult.attendee.alreadyCheckedIn 
              ? 'bg-yellow-50 border-yellow-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-start gap-4">
              <div className="text-4xl">
                {lastResult.attendee.alreadyCheckedIn ? '⚠️' : '✅'}
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold text-lg ${
                  lastResult.attendee.alreadyCheckedIn ? 'text-yellow-800' : 'text-green-800'
                }`}>
                  {lastResult.message}
                </h4>
                
                <div className="mt-2 space-y-1">
                  <p className="font-medium">
                    👤 {lastResult.attendee.user.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    📧 {lastResult.attendee.user.email}
                  </p>
                  {lastResult.attendee.checkedInAt && (
                    <p className="text-sm text-gray-600">
                      🕐 Check-in: {new Date(lastResult.attendee.checkedInAt).toLocaleString('es-ES')}
                    </p>
                  )}
                </div>

                {lastResult.attendee.alreadyCheckedIn && (
                  <div className="mt-2 text-sm text-yellow-700">
                    Este asistente ya había realizado check-in anteriormente.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </form>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Instrucciones:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Pide al asistente que muestre su código QR del email</li>
          <li>• Escanea el código o pégalo en el campo de texto</li>
          <li>• El sistema validará automáticamente el ticket</li>
          <li>• Los asistentes ya registrados aparecerán marcados</li>
        </ul>
      </div>
    </div>
  )
}