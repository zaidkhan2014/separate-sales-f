import JSZip from 'jszip'
import type { UserProfile } from '@/api/types'
import { getGalleryImageUrls } from '@/utils/biodataPrompt'

export class EmptyGalleryError extends Error {
  constructor() {
    super('No gallery images to download')
    this.name = 'EmptyGalleryError'
  }
}

function slugifyName(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'member'
}

function extensionFromContentType(contentType: string | null): string {
  if (!contentType) return 'jpg'
  const type = contentType.split(';')[0]?.trim().toLowerCase() ?? ''
  if (type === 'image/png') return 'png'
  if (type === 'image/webp') return 'webp'
  if (type === 'image/gif') return 'gif'
  if (type === 'image/jpeg' || type === 'image/jpg') return 'jpg'
  return 'jpg'
}

function extensionFromUrl(url: string): string | null {
  try {
    const path = new URL(url).pathname
    const match = path.match(/\.(jpe?g|png|webp|gif)$/i)
    return match ? match[1]!.toLowerCase().replace('jpeg', 'jpg') : null
  } catch {
    return null
  }
}

async function fetchImageBlob(url: string): Promise<{ blob: Blob; ext: string } | null> {
  try {
    const response = await fetch(url, { mode: 'cors' })
    if (!response.ok) return null
    const blob = await response.blob()
    if (!blob.size) return null
    const ext =
      extensionFromUrl(url) ?? extensionFromContentType(blob.type || response.headers.get('content-type'))
    return { blob, ext }
  } catch {
    return null
  }
}

function triggerBrowserDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}

export interface DownloadGalleryImagesResult {
  downloaded: number
  failed: number
  filename: string
}

export async function downloadAllGalleryImages(profile: UserProfile): Promise<DownloadGalleryImagesResult> {
  const urls = getGalleryImageUrls(profile)
  if (!urls.length) {
    throw new EmptyGalleryError()
  }

  const zip = new JSZip()
  let downloaded = 0
  let failed = 0

  for (let i = 0; i < urls.length; i += 1) {
    const url = urls[i]!
    const loaded = await fetchImageBlob(url)
    if (!loaded) {
      failed += 1
      continue
    }
    const index = String(downloaded + 1).padStart(2, '0')
    zip.file(`photo-${index}.${loaded.ext}`, loaded.blob)
    downloaded += 1
  }

  if (downloaded === 0) {
    throw new Error('Could not download any gallery images')
  }

  const displayName = profile.basicDetails?.fullName?.trim() || 'member'
  const userId = profile.userId?.trim() || 'user'
  const filename = `photos-${slugifyName(displayName)}-${slugifyName(userId)}.zip`
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  triggerBrowserDownload(zipBlob, filename)

  return { downloaded, failed, filename }
}
