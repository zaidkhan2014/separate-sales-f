interface BioCellProps {
  bio: string | null | undefined
}

/** Truncated bio with hover/focus popup showing the full text. */
export function BioCell({ bio }: BioCellProps) {
  const text = bio?.trim()
  if (!text) return <span>—</span>

  return (
    <div className="group relative max-w-[220px]">
      <p className="line-clamp-2 cursor-default outline-none" tabIndex={0}>
        {text}
      </p>
      <div
        role="tooltip"
        className="pointer-events-none absolute left-0 top-full z-40 mt-1 hidden max-h-64 w-80 max-w-[min(20rem,70vw)] overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-800 shadow-lg group-hover:block group-focus-within:block"
      >
        {text}
      </div>
    </div>
  )
}
