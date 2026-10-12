import { Button } from '@/components/ui/button'

interface IncludePhoneConfirmProps {
  open: boolean
  onInclude: () => void
  onExclude: () => void
  onCancel: () => void
}

export function IncludePhoneConfirm({ open, onInclude, onExclude, onCancel }: IncludePhoneConfirmProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="include-phone-title"
    >
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
        <h3 id="include-phone-title" className="text-sm font-semibold text-slate-900">
          Include phone number?
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Choose whether the biodata should include this member&apos;s phone number.
        </p>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="outline" onClick={onExclude}>
            Exclude
          </Button>
          <Button type="button" onClick={onInclude}>
            Include
          </Button>
        </div>
      </div>
    </div>
  )
}
