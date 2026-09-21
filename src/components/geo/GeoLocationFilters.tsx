import { useMemo } from 'react'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { FALLBACK_COUNTRIES, findFallbackCountryByIso2 } from '@/data/fallbackCountries'
import { useGeoCities, useGeoStates } from '@/hooks/api/useGeo'

export interface GeoLocationFilterValue {
  country: string
  countryIso: string
  state: string
  city: string
}

interface GeoLocationFiltersProps {
  value: GeoLocationFilterValue
  onChange: (patch: Partial<GeoLocationFilterValue>) => void
  idPrefix?: string
}

export function GeoLocationFilters({ value, onChange, idPrefix = 'geo' }: GeoLocationFiltersProps) {
  const countryIso = value.countryIso || null
  const statesQuery = useGeoStates(countryIso)
  const states = statesQuery.data ?? []

  const selectedStateCode = useMemo(() => {
    if (!value.state.trim()) return null
    return states.find((s) => s.name === value.state.trim())?.code ?? null
  }, [states, value.state])

  const citiesQuery = useGeoCities(selectedStateCode)
  const cities = citiesQuery.data ?? []

  const countryOptions = useMemo(
    () =>
      FALLBACK_COUNTRIES.map((c) => ({
        value: c.iso2,
        label: `${c.unicodeFlag} ${c.name}`,
      })),
    [],
  )

  const stateOptions = useMemo(
    () => states.map((s) => ({ value: s.name, label: s.name })),
    [states],
  )

  const cityOptions = useMemo(
    () => cities.map((c) => ({ value: c.name, label: c.name })),
    [cities],
  )

  return (
    <>
      <label className="block min-w-0 text-sm text-slate-600">
        <span className="mb-1 block font-medium text-slate-800">Country</span>
        <SearchableSelect
          id={`${idPrefix}-country`}
          options={countryOptions}
          value={value.countryIso}
          placeholder="Search country…"
          emptyLabel="Any country"
          aria-label="Filter by country"
          onChange={(iso2) => {
            const match = iso2 ? findFallbackCountryByIso2(iso2) : undefined
            onChange({
              countryIso: iso2,
              country: match?.name ?? '',
              state: '',
              city: '',
            })
          }}
        />
      </label>
      <label className="block min-w-0 text-sm text-slate-600">
        <span className="mb-1 block font-medium text-slate-800">State</span>
        <SearchableSelect
          id={`${idPrefix}-state`}
          options={stateOptions}
          value={value.state}
          placeholder={countryIso ? 'Search state…' : 'Select a country first'}
          emptyLabel="Any state"
          disabled={!countryIso}
          aria-label="Filter by state"
          onChange={(stateName) => {
            onChange({
              state: stateName,
              city: '',
            })
          }}
        />
        {statesQuery.isFetching ? (
          <span className="mt-1 block text-xs text-slate-400">Loading states…</span>
        ) : null}
      </label>
      <label className="block min-w-0 text-sm text-slate-600">
        <span className="mb-1 block font-medium text-slate-800">City</span>
        <SearchableSelect
          id={`${idPrefix}-city`}
          options={cityOptions}
          value={value.city}
          placeholder={selectedStateCode ? 'Search city…' : 'Select a state first'}
          emptyLabel="Any city"
          disabled={!selectedStateCode}
          aria-label="Filter by city"
          onChange={(cityName) => onChange({ city: cityName })}
        />
        {citiesQuery.isFetching ? (
          <span className="mt-1 block text-xs text-slate-400">Loading cities…</span>
        ) : null}
      </label>
    </>
  )
}
