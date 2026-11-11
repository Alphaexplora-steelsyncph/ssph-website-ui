import { useEffect } from 'react'

/** Adds a schema.org JSON-LD block to <head> while mounted (e.g. FAQ markup built from the FAQ shown on the page). */
export const JsonLd = ({ id, data }: { id: string; data: object }) => {
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = id
    script.text = JSON.stringify(data)
    document.head.appendChild(script)
    return () => script.remove()
  }, [id, data])
  return null
}
