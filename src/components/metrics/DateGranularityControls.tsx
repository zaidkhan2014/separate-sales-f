import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { GranularityInput } from '@/api/types'
import { toDatetimeLocalInput, toUtcIso } from '@/utils/date'

interface DateGranularityControlsProps {
  start?: string
  end?: string
  granularity?: GranularityInput
  onChange: (next: { start?: string; end?: string; granularity?: GranularityInput }) => void
  showGranularity?: boolean
}

export function DateGranularityControls({
  start,
  end,
  granularity = 'daily',
  onChange,
  showGranularity = true,
}: DateGranularityControlsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-3 md:grid-cols-3">
      <label className="text-sm text-slate-600">
        <span className="mb-1 block">Start (UTC)</span>
        <Input
          aria-label="start-date"
          type="datetime-local"
          value={toDatetimeLocalInput(start)}
          onChange={(event) => onChange({ start: toUtcIso(event.target.value), end, granularity })}
        />
      </label>
      <label className="text-sm text-slate-600">
        <span className="mb-1 block">End (UTC)</span>
        <Input
          aria-label="end-date"
          type="datetime-local"
          value={toDatetimeLocalInput(end)}
          onChange={(event) => onChange({ start, end: toUtcIso(event.target.value), granularity })}
        />
      </label>
      {showGranularity ? (
        <label className="text-sm text-slate-600">
          <span className="mb-1 block">Granularity</span>
          <Select
            aria-label="granularity"
            value={granularity}
            onChange={(event) =>
              onChange({
                start,
                end,
                granularity: event.target.value as GranularityInput,
              })
            }
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </Select>
        </label>
      ) : null}
    </div>
  )
}
