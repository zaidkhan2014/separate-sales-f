import { jsPDF } from 'jspdf'
import type { UserProfile } from '@/api/types'
import {
  QURB_BIODATA_TAGLINE,
  QURB_LOGO_URL,
  getBiodataContent,
  sanitizePdfText,
  type BiodataContent,
  type BiodataContentOptions,
  type BiodataRow,
} from '@/utils/biodataPrompt'

const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 14
const CONTENT_W = PAGE_W - MARGIN * 2
const PLUM: [number, number, number] = [92, 51, 83]
const GOLD: [number, number, number] = [184, 148, 90]
const CREAM: [number, number, number] = [252, 248, 244]
const CARD: [number, number, number] = [255, 255, 255]
const INK: [number, number, number] = [45, 40, 45]
const MUTED: [number, number, number] = [110, 100, 110]

export type DownloadBiodataPdfResult = {
  ok: true
  photoIncluded: boolean
  logoIncluded: boolean
}

type ImageLoadMode = 'preserve' | 'squareCrop'

/**
 * Encode image for PDF embedding.
 * - preserve: JPEG, aspect kept
 * - squareCrop: center-crop to square, then circular PNG mask (no jsPDF clip needed)
 */
function imageToDataUrl(
  img: HTMLImageElement,
  mode: ImageLoadMode,
  maxEdge = 900,
): string | null {
  const srcW = img.naturalWidth
  const srcH = img.naturalHeight
  if (!srcW || !srcH) return null

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  if (mode === 'squareCrop') {
    const side = Math.min(srcW, srcH)
    const sx = Math.floor((srcW - side) / 2)
    const sy = Math.floor((srcH - side) / 2)
    const out = Math.min(maxEdge, side)
    canvas.width = out
    canvas.height = out
    ctx.drawImage(img, sx, sy, side, side, 0, 0, out, out)
    // Circular alpha mask so PDF viewers never need clip()
    ctx.globalCompositeOperation = 'destination-in'
    ctx.beginPath()
    ctx.arc(out / 2, out / 2, out / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'
    return canvas.toDataURL('image/png')
  }

  const scale = Math.min(1, maxEdge / Math.max(srcW, srcH))
  canvas.width = Math.max(1, Math.round(srcW * scale))
  canvas.height = Math.max(1, Math.round(srcH * scale))
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.92)
}

function loadImageElement(url: string, crossOrigin: boolean): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    if (crossOrigin) img.crossOrigin = 'anonymous'
    const timer = window.setTimeout(() => {
      img.src = ''
      resolve(null)
    }, 12000)
    img.onload = () => {
      window.clearTimeout(timer)
      resolve(img)
    }
    img.onerror = () => {
      window.clearTimeout(timer)
      resolve(null)
    }
    img.src = url
  })
}

async function loadViaImageElement(url: string, mode: ImageLoadMode): Promise<string | null> {
  const img = await loadImageElement(url, true)
  if (!img) return null
  try {
    return imageToDataUrl(img, mode)
  } catch {
    return null
  }
}

async function loadViaFetch(url: string, mode: ImageLoadMode): Promise<string | null> {
  try {
    const response = await fetch(url, { mode: 'cors' })
    if (!response.ok) return null
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    try {
      const img = await loadImageElement(objectUrl, false)
      if (!img) return null
      return imageToDataUrl(img, mode)
    } finally {
      URL.revokeObjectURL(objectUrl)
    }
  } catch {
    return null
  }
}

export async function loadImageAsDataUrl(
  url: string,
  mode: ImageLoadMode = 'preserve',
): Promise<string | null> {
  const fromImage = await loadViaImageElement(url, mode)
  if (fromImage) return fromImage
  return loadViaFetch(url, mode)
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

  // Pre-masked circular PNG — never use doc.clip() (breaks page-1 text in many desktop viewers)
  if (dataUrl) {
    try {
      doc.addImage(dataUrl, imageFormatFromDataUrl(dataUrl), x, y, diameter, diameter)
      doc.setDrawColor(...GOLD)
      doc.setLineWidth(1.4)
      doc.circle(cx, cy, radius, 'S')
      return
    } catch {
      // fall through to initials
    }
  }

  doc.setFillColor(230, 220, 228)
  doc.circle(cx, cy, radius, 'F')
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(1.4)
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

function drawTextLogo(doc: jsPDF, y: number): number {
  doc.setTextColor(...PLUM)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('Qurb', PAGE_W / 2, y + 5, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text('Muslim marriage app', PAGE_W / 2, y + 10, { align: 'center' })
  return y + 14
}

function splitPoints(value: string): string[] {
  return value
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
}

function isPointsRow(row: BiodataRow): boolean {
  return /points/i.test(row.label)
}

export async function downloadBiodataPdf(
  profile: UserProfile,
  options: BiodataContentOptions = {},
): Promise<DownloadBiodataPdfResult> {
  const content = getBiodataContent(profile, options)
  const [logoDataUrl, photoDataUrl] = await Promise.all([
    loadImageAsDataUrl(QURB_LOGO_URL, 'preserve'),
    content.photoUrls[0]
      ? loadImageAsDataUrl(content.photoUrls[0], 'squareCrop')
      : Promise.resolve(null),
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
    doc.setFillColor(...PLUM)
    doc.rect(0, 0, PAGE_W, 8, 'F')
  }

  fillPage()
  let y = 14

  if (logoDataUrl) {
    try {
      const logoW = 46
      const logoH = 15
      doc.addImage(
        logoDataUrl,
        imageFormatFromDataUrl(logoDataUrl),
        (PAGE_W - logoW) / 2,
        y,
        logoW,
        logoH,
      )
      y += logoH + 5
    } catch {
      y = drawTextLogo(doc, y)
    }
  } else {
    y = drawTextLogo(doc, y)
  }

  const portraitR = 32
  const cx = PAGE_W / 2
  const cy = y + portraitR
  drawPortrait(doc, photoDataUrl, content.displayName, cx, cy, portraitR)
  y = cy + portraitR + 8

  doc.setTextColor(...PLUM)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text(sanitizePdfText(content.displayName), PAGE_W / 2, y, { align: 'center' })
  y += 6

  if (content.locationLine) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...MUTED)
    doc.text(sanitizePdfText(content.locationLine), PAGE_W / 2, y, { align: 'center' })
    y += 7
  } else {
    y += 2
  }

  const ensureSpace = (needed: number) => {
    if (y + needed > PAGE_H - MARGIN - 10) {
      doc.addPage()
      fillPage()
      y = 14
    }
  }

  // Key facts card (2 columns) — label stacked above value with enough pitch to avoid overlap
  if (content.keyFacts.length) {
    const colW = (CONTENT_W - 6) / 2
    const rowPitch = 11
    const padTop = 5
    const padBottom = 4
    const rowsNeeded = Math.ceil(content.keyFacts.length / 2)
    const blockH = padTop + rowsNeeded * rowPitch + padBottom
    ensureSpace(blockH + 4)

    doc.setFillColor(...CARD)
    doc.setDrawColor(230, 220, 228)
    doc.roundedRect(MARGIN, y, CONTENT_W, blockH, 2, 2, 'FD')
    const factY = y + padTop + 3
    content.keyFacts.forEach((fact, index) => {
      const col = index % 2
      const rowIndex = Math.floor(index / 2)
      const x = MARGIN + 4 + col * (colW + 6)
      const fy = factY + rowIndex * rowPitch
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(...MUTED)
      doc.text(sanitizePdfText(fact.label), x, fy)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...INK)
      const valueLines = doc.splitTextToSize(sanitizePdfText(fact.value), colW - 2) as string[]
      doc.text(valueLines[0] ?? '', x, fy + 4.5)
    })
    y += blockH + 6
  }

  // Remaining sections (skip Basic details since covered by key facts + location)
  const detailSections = content.sections.filter((s) => s.title !== 'Basic details')

  for (const section of detailSections) {
    const estimated =
      10 +
      section.rows.reduce((sum, row) => {
        if (isPointsRow(row)) return sum + Math.max(1, splitPoints(row.value).length) * 4.5 + 3
        return sum + 7
      }, 0)
    ensureSpace(Math.min(estimated, 40))

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...PLUM)
    doc.text(sanitizePdfText(section.title), MARGIN, y)
    y += 4
    doc.setDrawColor(...GOLD)
    doc.setLineWidth(0.45)
    doc.line(MARGIN, y, MARGIN + 36, y)
    y += 5

    for (const item of section.rows) {
      if (isPointsRow(item)) {
        const points = splitPoints(item.value)
        ensureSpace(6 + points.length * 4.5)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(...MUTED)
        doc.text(sanitizePdfText(item.label), MARGIN, y)
        y += 4
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(...INK)
        for (const point of points) {
          ensureSpace(5)
          const lines = doc.splitTextToSize(`• ${sanitizePdfText(point)}`, CONTENT_W - 2) as string[]
          doc.text(lines, MARGIN + 1, y)
          y += lines.length * 4.2
        }
        y += 2
        continue
      }

      const label = sanitizePdfText(`${item.label}: `)
      const value = sanitizePdfText(item.value)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(...MUTED)
      const labelWidth = doc.getTextWidth(label)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const valueLines = doc.splitTextToSize(value, CONTENT_W - labelWidth) as string[]
      ensureSpace(valueLines.length * 4.4 + 2)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...MUTED)
      doc.text(label, MARGIN, y)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...INK)
      doc.text(valueLines[0] ?? '', MARGIN + labelWidth, y)
      for (let i = 1; i < valueLines.length; i += 1) {
        y += 4.2
        doc.text(valueLines[i], MARGIN, y)
      }
      y += 5
    }
    y += 3
  }

  ensureSpace(10)
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(9)
  doc.setTextColor(...PLUM)
  doc.text(QURB_BIODATA_TAGLINE, PAGE_W / 2, Math.min(y + 2, PAGE_H - MARGIN), {
    align: 'center',
  })
}
