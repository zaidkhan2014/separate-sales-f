import { describe, expect, it } from 'vitest'
import type { UserProfile } from '@/api/types'
import { EmptyGalleryError, downloadAllGalleryImages } from '@/utils/downloadGalleryImages'
import { getGalleryImageUrls } from '@/utils/biodataPrompt'

describe('downloadGalleryImages', () => {
  it('getGalleryImageUrls returns only image urls sorted by orderIndex', () => {
    const profile = {
      mediaGallery: {
        items: [
          { type: 'image', url: 'https://cdn.example/b.jpg', orderIndex: 2 },
          { type: 'video', url: 'https://cdn.example/v.mp4', orderIndex: 0 },
          { type: 'image', url: 'https://cdn.example/a.jpg', orderIndex: 1 },
        ],
      },
    } as UserProfile
    expect(getGalleryImageUrls(profile)).toEqual([
      'https://cdn.example/a.jpg',
      'https://cdn.example/b.jpg',
    ])
  })

  it('throws EmptyGalleryError when there are no gallery images', async () => {
    await expect(downloadAllGalleryImages({} as UserProfile)).rejects.toBeInstanceOf(EmptyGalleryError)
  })
})
