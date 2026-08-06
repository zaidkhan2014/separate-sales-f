import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  useAdminSalesSavedViews,
  useCreateSalesSavedView,
  useDeleteSalesSavedView,
} from '@/hooks/api/useAdminSales'
import { parseSalesListSearchParams } from '@/pages/sales/salesListSearchParams'

interface SalesSavedViewsProps {
  currentSearch: string
  onLoadView: (search: string) => void
}

export function SalesSavedViews({ currentSearch, onLoadView }: SalesSavedViewsProps) {
  const viewsQuery = useAdminSalesSavedViews()
  const createView = useCreateSalesSavedView()
  const deleteView = useDeleteSalesSavedView()
  const [newViewName, setNewViewName] = useState('')
  const [selectedViewId, setSelectedViewId] = useState('')

  const items = viewsQuery.data?.items ?? []

  return (
    <div className="flex min-w-0 flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:flex-wrap sm:items-end">
      <label className="block min-w-0 flex-1 text-sm text-slate-600 sm:max-w-xs">
        <span className="mb-1 block font-medium text-slate-800">Saved views</span>
        <Select
          value={selectedViewId}
          onChange={(event) => {
            const id = event.target.value
            setSelectedViewId(id)
            const view = items.find((v) => v.id === id)
            if (view) onLoadView(view.filtersJson)
          }}
          aria-label="Load saved filter view"
        >
          <option value="">Select a view…</option>
          {items.map((view) => (
            <option key={view.id} value={view.id}>
              {view.name}
            </option>
          ))}
        </Select>
      </label>
      <label className="block min-w-0 flex-1 text-sm text-slate-600 sm:max-w-xs">
        <span className="mb-1 block font-medium text-slate-800">Save current filters</span>
        <Input
          placeholder="View name"
          value={newViewName}
          onChange={(event) => setNewViewName(event.target.value)}
          aria-label="New saved view name"
        />
      </label>
      <Button
        type="button"
        disabled={createView.isPending || newViewName.trim().length === 0}
        onClick={() => {
          const filtersJson = currentSearch.startsWith('?') ? currentSearch.slice(1) : currentSearch
          createView.mutate(
            { name: newViewName.trim(), filtersJson },
            {
              onSuccess: () => setNewViewName(''),
            },
          )
        }}
      >
        Save view
      </Button>
      {selectedViewId ? (
        <Button
          type="button"
          variant="outline"
          disabled={deleteView.isPending}
          onClick={() => {
            deleteView.mutate(selectedViewId, {
              onSuccess: () => setSelectedViewId(''),
            })
          }}
        >
          Delete view
        </Button>
      ) : null}
      {viewsQuery.error ? (
        <p className="w-full text-xs text-red-700">Could not load saved views.</p>
      ) : null}
    </div>
  )
}

/** Validate saved view JSON before applying */
export function parseSavedViewFilters(raw: string): URLSearchParams | null {
  try {
    const params = new URLSearchParams(raw)
    parseSalesListSearchParams(params)
    return params
  } catch {
    return null
  }
}
