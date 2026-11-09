import { useRef, useState } from 'react'
import { exportPdf, exportPng, programFileName } from './exportProgram'

/** Ref for the off-screen export copy + PNG/PDF actions with busy and error state. */
export const useProgramExport = (title: string, memberName?: string) => {
  const exportRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState<'png' | 'pdf' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = async (kind: 'png' | 'pdf') => {
    const node = exportRef.current
    if (!node || busy) return
    try {
      setBusy(kind)
      setError(null)
      const name = programFileName(title, memberName)
      await (kind === 'png' ? exportPng(node, name) : exportPdf(node, name))
    } catch {
      setError('Could not create the download. Please try again.')
    } finally {
      setBusy(null)
    }
  }

  return { exportRef, busy, error, downloadPng: () => run('png'), downloadPdf: () => run('pdf') }
}

export type ProgramExport = ReturnType<typeof useProgramExport>
