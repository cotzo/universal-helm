const URL_RE = /(https?:\/\/[^\s)]+)/g

export function HelpText({ text, className = 'text-xs text-gray-500' }: { text: string; className?: string }) {
  const parts = text.split(URL_RE)
  return (
    <p className={className}>
      {parts.map((part, i) =>
        URL_RE.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {simplifyUrl(part)}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </p>
  )
}

function simplifyUrl(url: string): string {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')
    // Show just the domain + last meaningful path segment
    const segments = u.pathname.split('/').filter(Boolean)
    if (segments.length === 0) return host
    const last = segments[segments.length - 1].replace(/#.*$/, '')
    return `${host}/.../${last}`
  } catch {
    return url
  }
}
