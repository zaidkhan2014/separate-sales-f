interface LeadPhotoThumbProps {
  url: string | null | undefined
  alt: string
}

export function LeadPhotoThumb({ url, alt }: LeadPhotoThumbProps) {
  if (!url) {
    return <span className="text-xs text-slate-400">--</span>
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" title="Open full size">
      <img
        src={url}
        alt={alt}
        className="h-16 w-16 rounded-md border border-slate-200 object-cover"
        loading="lazy"
      />
    </a>
  )
}
