import { useEffect, useId, useRef, useState } from 'react'

interface BioCellProps {
  bio: string | null | undefined
}

/** Truncated bio with full-text popup on hover (desktop) or tap (touch). */
export function BioCell({ bio }: BioCellProps) {
  const text = bio?.trim()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const panelId = useId()

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current
      if (!root) return
      if (event.target instanceof Node && root.contains(event.target)) return
      setOpen(false)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!text) return <span>—</span>

  return (
    <div
      ref={rootRef}
      className="relative max-w-[220px]"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="line-clamp-2 w-full cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
      >
        {text}
      </button>
      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Full bio"
          className="absolute left-0 top-full z-40 mt-1 max-h-64 w-80 max-w-[min(20rem,70vw)] overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-800 shadow-lg"
        >
          {text}
        </div>
      ) : null}
    </div>
  )
}
