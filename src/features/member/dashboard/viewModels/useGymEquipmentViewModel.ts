import { useEffect, useState } from 'react'
import { ApiError, fetchMyEquipment } from '../../../../shared/models/apiService'
import type { Equipment } from '../../../../shared/models/types'

/** Member: which machines are working (Equipment Status add-on). Problems first, the full list on demand. */
export const useGymEquipmentViewModel = () => {
  const [items, setItems] = useState<Equipment[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  // Report dialog: undefined = closed, null = general report, string = the machine's name.
  const [reporting, setReporting] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    fetchMyEquipment()
      .then(setItems)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the equipment list.'))
  }, [])

  const list = items ?? []
  const problems = list
    .filter((i) => i.status !== 'Available')
    .sort((a, b) => (a.status === 'Broken' ? -1 : 1) - (b.status === 'Broken' ? -1 : 1))
  return {
    isLoading: items === null && !error,
    error,
    total: list.length,
    available: list.length - problems.length,
    problems,
    all: list,
    showAll,
    toggleAll: () => setShowAll((v) => !v),
    isReporting: reporting !== undefined,
    reportingName: reporting ?? null,
    openReport: (name: string | null = null) => setReporting(name),
    closeReport: () => setReporting(undefined),
  }
}
