import { jsPDF } from 'jspdf'
import type { UserProfile } from '@/api/types'
import {
  QURB_BIODATA_TAGLINE,
  QURB_LOGO_URL,
  getBiodataContent,
  type BiodataContent,
} from '@/utils/biodataPrompt'

const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 16
const CONTENT_W = PAGE_W - MARGIN * 2
const PLUM: [number, number, number] = [92, 51, 83]
const GOLD: [number, number, number] = [184, 148, 90]
const CREAM: [number, number, number] = [252, 248, 244]
const INK: [number, number, number] = [40, 36, 40]

export type DownloadBiodataPdfResult = {
  ok: true
  photoIncluded: boolean
  logoIncluded: boolean
}

export async function loadImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { mode: 'cors' })
    if (!response.ok) return null
    const blob = await response.blob()
    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve(typeof reader.result === 'string' ? reader.result : null)
      }
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

function slugifyName(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'member'
}

function imageFormatFromDataUrl(dataUrl: string): 'PNG' | 'JPEG' | 'WEBP' {
  if (dataUrl.startsWith('data:image/png')) return 'PNG'
  if (dataUrl.startsWith('data:image/webp')) return 'WEBP'
  return 'JPEG'
}

/**
 * Draw portrait with gold ring. Tries circular clip; falls back to square image + ring.
 */
function drawPortrait(
  doc: jsPDF,
  dataUrl: string | null,
  displayName: string,
  cx: number,
  cy: number,
  radius: number,
) {
  const diameter = radius * 2
  const x = cx - radius
  const y = cy - radius

  if (dataUrl) {
    try {
      doc.saveGraphicsState()
      doc.circle(cx, cy, radius)
      ;(doc as jsPDF & { clip: () => void }).clip()
      doc.addImage(dataUrl, imageFormatFromDataUrl(dataUrl), x, y, diameter, diameter)
      doc.restoreGraphicsState()
      doc.setDrawColor(...GOLD)
      doc.setLineWidth(1.2)
      doc.circle(cx, cy, radius, 'S')
      return
    } catch {
      try {
        doc.restoreGraphicsState()
      } catch {
        // ignore
      }
      try {
        doc.addImage(dataUrl, imageFormatFromDataUrl(dataUrl), x, y, diameter, diameter)
        doc.setDrawColor(...GOLD)
        doc.setLineWidth(1.2)
        doc.circle(cx, cy, radius, 'S')
        return
      } catch {
        // initials below
      }
    }
  }

  doc.setFillColor(230, 220, 228)
  doc.circle(cx, cy, radius, 'F')
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(1.2)
  doc.circle(cx, cy, radius, 'S')
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
  doc.setTextColor(...PLUM)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text(initials || 'Q', cx, cy + 2, { align: 'center' })
}

export async function downloadBiodataPdf(profile: UserProfile): Promise<DownloadBiodataPdfResult> {
  const content = getBiodataContent(profile)
  const [logoDataUrl, photoDataUrl] = await Promise.all([
    loadImageAsDataUrl(QURB_LOGO_URL),
    content.photoUrls[0] ? loadImageAsDataUrl(content.photoUrls[0]) : Promise.resolve(null),
  ])

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  renderBiodataPdf(doc, content, logoDataUrl, photoDataUrl)
  doc.save(`biodata-${slugifyName(content.displayName)}.pdf`)

  return {
    ok: true,
    photoIncluded: Boolean(photoDataUrl),
    logoIncluded: Boolean(logoDataUrl),
  }
}

export function renderBiodataPdf(
  doc: jsPDF,
  content: BiodataContent,
  logoDataUrl: string | null,
  photoDataUrl: string | null,
) {
  const fillPage = () => {
    doc.setFillColor(...CREAM)
    doc.rect(0, 0, PAGE_W, PAGE_H, 'F')
  }

  fillPage()
  let y = MARGIN

  if (logoDataUrl) {
    try {
      const logoW = 42
      const logoH = 14
      doc.addImage(
        logoDataUrl,
        imageFormatFromDataUrl(logoDataUrl),
        (PAGE_W - logoW) / 2,
        y,
        logoW,
        logoH,
      )
      y += logoH + 6
    } catch {
      y = drawTextLogo(doc, y)
    }
  } else {
    y = drawTextLogo(doc, y)
  }

  const portraitR = 28
  const cx = PAGE_W / 2
  const cy = y + portraitR
  drawPortrait(doc, photoDataUrl, content.displayName, cx, cy, portraitR)
  y = cy + portraitR + 10

  doc.setTextColor(...PLUM)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(content.displayName, PAGE_W / 2, y, { align: 'center' })
  y += 10

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...INK)

  const ensureSpace = (needed: number) => {
    if (y + needed > PAGE_H - MARGIN - 12) {
      doc.addPage()
      fillPage()
      y = MARGIN
    }
  }

  for (const section of content.sections) {
    ensureSpace(16)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...PLUM)
    doc.text(section.title, MARGIN, y)
    y += 6
    doc.setDrawColor(...GOLD)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, y, MARGIN + 28, y)
    y += 5

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...INK)

    for (const row of section.rows) {
      const label = `${row.label}: `
      const lines = doc.splitTextToSize(`${label}${row.value}`, CONTENT_W) as string[]
      ensureSpace(lines.length * 5 + 2)
      doc.text(lines, MARGIN, y)
      y += lines.length * 5 + 1.5
    }
    y += 4
  }

  ensureSpace(12)
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(9)
  doc.setTextColor(...PLUM)
  doc.text(QURB_BIODATA_TAGLINE, PAGE_W / 2, Math.min(y + 4, PAGE_H - MARGIN), {
    align: 'center',
  })
}

function drawTextLogo(doc: jsPDF, y: number): number {
  doc.setTextColor(...PLUM)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('Qurb', PAGE_W / 2, y + 4, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('Muslim marriage app', PAGE_W / 2, y + 9, { align: 'center' })
  return y + 14
}
