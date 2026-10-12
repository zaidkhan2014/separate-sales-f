import { describe, expect, it } from 'vitest'
import { jsPDF } from 'jspdf'
import { renderBiodataPdf } from '@/utils/biodataPdf'
import type { BiodataContent } from '@/utils/biodataPrompt'
import { sanitizePdfText } from '@/utils/biodataPrompt'

describe('renderBiodataPdf', () => {
  it('renders without throwing for structured content', () => {
    const content: BiodataContent = {
      displayName: 'Aisha Khan',
      locationLine: 'Lucknow, Uttar Pradesh, India',
      photoUrls: [],
      keyFacts: [
        { label: 'Gender', value: 'Female' },
        { label: 'Height', value: '165 cm' },
      ],
      sections: [
        {
          title: 'Career & education',
          rows: [{ label: 'Education', value: "Bachelor's Degree" }, { label: 'Income', value: '₹30–₹40 Lakh' }],
        },
        {
          title: 'Faith',
          rows: [{ label: 'Faith points', value: 'Prays daily, Values family' }],
        },
      ],
    }
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    expect(() => renderBiodataPdf(doc, content, null, null)).not.toThrow()
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1)
  })
})

describe('sanitizePdfText in PDF context', () => {
  it('keeps rupee amounts readable for Helvetica', () => {
    expect(sanitizePdfText('Income: ₹0–₹5 lakh')).toBe('Income: Rs 0-Rs 5 lakh')
  })
})
