import { Card, CardContent } from '@/components/ui/card'

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Card>
      <CardContent className="py-10 text-center">
        <p className="text-sm font-medium text-slate-700">{title}</p>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </CardContent>
    </Card>
  )
}
