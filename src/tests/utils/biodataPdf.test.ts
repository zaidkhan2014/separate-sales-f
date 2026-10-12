import { describe, expect, it } from 'vitest'
import { jsPDF } from 'jspdf'
import { renderBiodataPdf } from '@/utils/biodataPdf'
import type { BiodataContent } from '@/utils/biodataPrompt'

describe('renderBiodataPdf', () => {
  it('renders without throwing for structured content', () => {
    const content: BiodataContent = {
      displayName: 'Aisha Khan',
      photoUrls: [],
      sections: [
        {
          title: 'Career & education',
          rows: [{ label: 'Education', value: "Bachelor's Degree" }],
        },
      ],
    }
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    expect(() => renderBiodataPdf(doc, content, null, null)).not.toThrow()
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1)
  })
})
