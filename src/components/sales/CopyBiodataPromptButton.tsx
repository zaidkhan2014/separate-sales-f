import { useState } from 'react'
import type { UserProfile } from '@/api/types'
import { IncludePhoneConfirm } from '@/components/sales/IncludePhoneConfirm'
import { Button } from '@/components/ui/button'
import { buildBiodataPrompt } from '@/utils/biodataPrompt'

interface CopyBiodataPromptButtonProps {
  profile: UserProfile
}

export function CopyBiodataPromptButton({ profile }: CopyBiodataPromptButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle')

  async function runCopy(includePhone: boolean) {
    setConfirmOpen(false)
    try {
      await navigator.clipboard.writeText(buildBiodataPrompt(profile, { includePhone }))
      setStatus('copied')
      window.setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setStatus('error')
      window.setTimeout(() => setStatus('idle'), 2500)
    }
  }

  const label = status === 'copied' ? 'Copied' : status === 'error' ? 'Copy failed' : 'Copy biodata prompt'

  return (
    <>
      <Button type="button" variant="outline" className="shrink-0" onClick={() => setConfirmOpen(true)}>
        {label}
      </Button>
      <IncludePhoneConfirm
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onExclude={() => void runCopy(false)}
        onInclude={() => void runCopy(true)}
      />
    </>
  )
}
