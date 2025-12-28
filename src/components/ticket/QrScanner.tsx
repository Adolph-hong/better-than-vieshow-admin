import { useEffect, useRef } from "react"
import { Html5Qrcode } from "html5-qrcode"

interface QrScannerProps {
  onScan: (decodedText: string) => void
  onError?: (error: Error | string) => void
}

const QrScanner = ({ onScan, onError }: QrScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isRunningRef = useRef(false)

  const onScanRef = useRef(onScan)
  const onErrorRef = useRef(onError)
  onScanRef.current = onScan
  onErrorRef.current = onError

  useEffect(() => {
    if (!containerRef.current) {
      return undefined
    }

    const currentScanner = new Html5Qrcode(containerRef.current.id)
    scannerRef.current = currentScanner

    const startScanning = async () => {
      try {
        await currentScanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText) => {
            if (isRunningRef.current) {
              isRunningRef.current = false
              try {
                await currentScanner.stop()
                currentScanner.clear()
              } catch (err) {
                // 忽略清理錯誤
              }
            }
            onScanRef.current(decodedText)
          },
          () => {
            // 忽略掃描錯誤
          }
        )

        isRunningRef.current = true
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        isRunningRef.current = false
        onErrorRef.current?.(error)
      }
    }

    startScanning()

    return () => {
      const s = scannerRef.current
      scannerRef.current = null

      if (!s) return

      if (isRunningRef.current) {
        isRunningRef.current = false
        s.stop()
          .then(() => {
            s.clear()
          })
          .catch(() => {
            // 忽略清理錯誤
          })
      } else {
        try {
          s.clear()
        } catch {
          // 忽略清理錯誤
        }
      }
    }
  }, [])

  return <div id="qr-reader" ref={containerRef} className="flex" />
}

export default QrScanner
