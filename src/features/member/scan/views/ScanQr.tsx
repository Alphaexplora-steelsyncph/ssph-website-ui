import { memo } from 'react'
import { QrScannerPanel } from './QrScannerPanel'

/** Page container: full-screen camera view for checking in. */
const ScanQr = memo(() => (
  <main className="flex min-h-screen flex-col bg-black">
    <QrScannerPanel />
  </main>
))
ScanQr.displayName = 'ScanQr'

export default ScanQr
