import { describe, expect, it } from 'vitest'
import type { UserProfile } from '@/api/types'
import { buildBiodataPrompt, getBiodataContent, getGalleryImageUrls } from '@/utils/biodataPrompt'

const profile: UserProfile = {
  id: 'profile-id-secret',
  userId: 'user-should-not-appear',
  memberId: 'Q999',
  phone: '+919876543210',
  bio: 'Looking for a kind partner.',
  basicDetails: {
    fullName: 'Aisha Khan',
    gender: 'Female',
    dateOfBirth: '1992-04-15',
    maritalStatus: 'Never Married',
    height: 165,
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    country: 'India',
    ethnicity: 'Indian',
  },
  careerEducation: {
    education: "Bachelor's Degree",
    profession: 'Software Engineer',
    industry: 'Technology',
    incomeBandId: 'INC_IN_30_40',
    incomeLabel: '₹30–₹40 Lakh',
    savingAssetsBandId: 'SAV_1',
    savingAssetsLabel: 'Some savings',
  },
  faithPractice: {
    sect: 'Sunni',
    religiousPractice: 'Practicing',
  },
  mediaGallery: {
    items: [
      { type: 'image', url: 'https://example.com/b.jpg', orderIndex: 2 },
      { type: 'image', url: 'https://example.com/a.jpg', orderIndex: 0 },
      { type: 'video', url: 'https://example.com/v.mp4', orderIndex: 1 },
    ],
  },
}

describe('getGalleryImageUrls', () => {
  it('returns image urls sorted by orderIndex and skips videos', () => {
    expect(getGalleryImageUrls(profile)).toEqual([
      'https://example.com/a.jpg',
      'https://example.com/b.jpg',
    ])
  })
})

describe('getBiodataContent', () => {
  it('includes name/education and excludes phone/ids/band ids', () => {
    const content = getBiodataContent(profile)
    expect(content.displayName).toBe('Aisha Khan')
    expect(content.photoUrls[0]).toBe('https://example.com/a.jpg')
    const flat = content.sections.flatMap((s) => s.rows.map((r) => `${r.label}:${r.value}`)).join('|')
    expect(flat).toContain("Education:Bachelor's Degree")
    expect(flat).toContain('Income:₹30–₹40 Lakh')
    expect(flat).not.toContain('+919876543210')
    expect(flat).not.toContain('user-should-not-appear')
    expect(flat).not.toContain('Q999')
    expect(flat).not.toContain('INC_IN_30_40')
  })
})

describe('buildBiodataPrompt', () => {
  it('includes biodata fields, brand, photos and excludes ids/phone/band ids', () => {
    const prompt = buildBiodataPrompt(profile)

    expect(prompt).toContain('Qurb Muslim marriage app')
    expect(prompt).toContain('https://www.getqurb.com/assets/qurb-logo-full-DJfb8tQl.jpg')
    expect(prompt).toContain('STRICTLY use')
    expect(prompt).toContain('Do NOT generate')
    expect(prompt).toContain('stock/AI faces')
    expect(prompt).toContain('exactly as given')
    expect(prompt).toContain('Aisha Khan')
    expect(prompt).toContain("Bachelor's Degree")
    expect(prompt).toContain('Software Engineer')
    expect(prompt).toContain('₹30–₹40 Lakh')
    expect(prompt).toContain('Looking for a kind partner.')
    expect(prompt).toContain('https://example.com/a.jpg')
    expect(prompt).toContain('https://example.com/b.jpg')

    expect(prompt).not.toContain('+919876543210')
    expect(prompt).not.toContain('user-should-not-appear')
    expect(prompt).not.toContain('Q999')
    expect(prompt).not.toContain('profile-id-secret')
    expect(prompt).not.toContain('INC_IN_30_40')
    expect(prompt).not.toContain('SAV_1')
    expect(prompt).not.toContain('https://example.com/v.mp4')
  })
})
