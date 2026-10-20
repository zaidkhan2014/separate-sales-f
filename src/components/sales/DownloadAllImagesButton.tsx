import { useMemo, useState } from 'react'
import type { UserProfile } from '@/api/types'
import { Button } from '@/components/ui/button'
import { downloadAllGalleryImages, EmptyGalleryError } from '@/utils/downloadGalleryImages'
import { getGalleryImageUrls } from '@/utils/biodataPrompt'

interface DownloadAllImagesButtonProps {
  profile: UserProfile
}

export function DownloadAllImagesButton({ profile }: DownloadAllImagesButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'partial' | 'error' | 'empty'>('idle')
  const imageCount = useMemo(() => getGalleryImageUrls(profile).length, [profile])

  async function runDownload() {
    setStatus('loading')
    try {
      const result = await downloadAllGalleryImages(profile)
      setStatus(result.failed > 0 ? 'partial' : 'done')
      window.setTimeout(() => setStatus('idle'), 2500)
    } catch (error) {
      setStatus(error instanceof EmptyGalleryError ? 'empty' : 'error')
      window.setTimeout(() => setStatus('idle'), 2500)
    }
  }

  const label =
    status === 'loading'
      ? 'Preparing images…'
      : status === 'done'
        ? 'Downloaded'
        : status === 'partial'
          ? 'Downloaded (some failed)'
          : status === 'empty'
            ? 'No images'
            : status === 'error'
              ? 'Download failed'
              : 'Download all images'

  return (
    <Button
      type="button"
      variant="outline"
      className="shrink-0"
      disabled={status === 'loading' || imageCount === 0}
      onClick={() => void runDownload()}
    >
      {label}
    </Button>
  )
}
