/**
 * Builds the Philippine address data used by the "Contact us" form (type-ahead region → province → city → barangay)
 * from the PSA's PSGC release packaged in @jobuntux/psgc (dev dependency).
 *
 *   npm run psgc:build
 *
 * Output: public/psgc/<release>/places.json (regions, provinces, cities) and one barangay file per region
 * (brgy-<regCode>.json), so the browser only downloads the barangays of the region the visitor picked.
 * The folder name carries the release, so the files can be cached forever. Bump PSGC_RELEASE in
 * src/shared/location/phLocations.ts after building a new release.
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkgDir = dirname(createRequire(import.meta.url).resolve('@jobuntux/psgc/package.json'))
const releases = readdirSync(join(pkgDir, 'data')).sort()
const release = process.argv[2] ?? releases.at(-1)
const read = (name) => JSON.parse(readFileSync(join(pkgDir, 'data', release, `${name}.json`), 'utf8'))

const clean = (s = '') => s.replace(/\s+/g, ' ').trim()
const byName = (a, b) => a.localeCompare(b, 'en', { sensitivity: 'base', numeric: true })

const regions = read('regions')
const provinces = read('provinces')
const cities = read('muncities')
const barangays = read('barangays')

// Places without a province row (e.g. Pateros in NCR) become their own "province" so every city has a parent.
const provKeys = new Set(provinces.map((p) => p.provCode))
for (const c of cities) {
  if (!provKeys.has(c.provCode)) {
    provinces.push({ regCode: c.regCode, provCode: c.provCode, provName: c.munCityName, cityClass: 'IND' })
    provKeys.add(c.provCode)
  }
}

const brgyCount = {}
for (const b of barangays) brgyCount[b.munCityCode] = (brgyCount[b.munCityCode] ?? 0) + 1

const places = {
  release,
  // [regCode, name]
  regions: regions.map((r) => [r.regCode, clean(r.regionName)]).sort((a, b) => a[0].localeCompare(b[0])),
  // [provCode, regCode, name, isCity (1 = highly urbanized / independent city)]
  provinces: provinces.map((p) => [p.provCode, p.regCode, clean(p.provName), p.cityClass ? 1 : 0]).sort((a, b) => byName(a[2], b[2])),
  // [munCityCode, provCode, name, barangay count]
  cities: cities.map((c) => [c.munCityCode, c.provCode, clean(c.munCityName), brgyCount[c.munCityCode] ?? 0]).sort((a, b) => byName(a[2], b[2])),
}

const outDir = join(root, 'public', 'psgc', release.toLowerCase().replace(/-/g, ''))
rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'places.json'), JSON.stringify(places))

const cityRegion = Object.fromEntries(cities.map((c) => [c.munCityCode, c.regCode]))
const perRegion = {}
for (const b of barangays) {
  const reg = cityRegion[b.munCityCode] ?? b.regCode
  ;((perRegion[reg] ??= {})[b.munCityCode] ??= []).push(clean(b.brgyName))
}
for (const [reg, map] of Object.entries(perRegion)) {
  for (const list of Object.values(map)) list.sort(byName)
  writeFileSync(join(outDir, `brgy-${reg}.json`), JSON.stringify(map))
}
console.log(`PSGC ${release}: ${places.regions.length} regions, ${places.provinces.length} provinces/cities, ${places.cities.length} cities/municipalities, ${barangays.length} barangays → ${outDir}`)
