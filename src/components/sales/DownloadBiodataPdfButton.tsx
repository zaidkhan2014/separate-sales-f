import { useState } from 'react'
import type { UserProfile } from '@/api/types'
import { IncludePhoneConfirm } from '@/components/sales/IncludePhoneConfirm'
import { Button } from '@/components/ui/button'
import { downloadBiodataPdf } from '@/utils/biodataPdf'

interface DownloadBiodataPdfButtonProps {
  profile: UserProfile
}

export function DownloadBiodataPdfButton({ profile }: DownloadBiodataPdfButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'partial' | 'error'>('idle')

  async function runDownload(includePhone: boolean) {
    setConfirmOpen(false)
    setStatus('loading')
    try {
      const result = await downloadBiodataPdf(profile, { includePhone })
      setStatus(result.photoIncluded ? 'done' : 'partial')
      window.setTimeout(() => setStatus('idle'), 2500)
    } catch {
      setStatus('error')
      window.setTimeout(() => setStatus('idle'), 2500)
    }
  }

  const label =
    status === 'loading'
      ? 'Preparing PDF…'
      : status === 'done'
        ? 'Downloaded'
        : status === 'partial'
          ? 'Downloaded (no photo)'
          : status === 'error'
            ? 'Download failed'
            : 'Download biodata PDF'

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="shrink-0"
        disabled={status === 'loading'}
        onClick={() => setConfirmOpen(true)}
      >
        {label}
      </Button>
      <IncludePhoneConfirm
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onExclude={() => void runDownload(false)}
        onInclude={() => void runDownload(true)}
      />
    </>
  )
}
