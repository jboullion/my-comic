import { useEffect, useState, useMemo } from 'react'
import { slugify } from './slugify'

/**
 * TableOfContents Component
 * Extracts headings from markdown content and displays as navigation
 */
export default function TableOfContents({ content }) {
  const [activeId, setActiveId] = useState('')

  // Extract h2 and h3 headings from markdown
  const headings = useMemo(() => {
    const result = []
    const lines = content.split('\n')

    for (const line of lines) {
      const h2Match = line.match(/^## (.+)$/)
      const h3Match = line.match(/^### (.+)$/)

      if (h2Match) {
        result.push({ level: 2, text: h2Match[1], id: slugify(h2Match[1]) })
      } else if (h3Match) {
        result.push({ level: 3, text: h3Match[1], id: slugify(h3Match[1]) })
      }
    }

    return result
  }, [content])

  // Track active heading based on scroll position
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0,
      }
    )

    // Observe all heading elements
    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      headings.forEach(({ id }) => {
        const element = document.getElementById(id)
        if (element) {
          observer.unobserve(element)
        }
      })
    }
  }, [headings])

  if (headings.length === 0) {
    return null
  }

  return (
    <nav className="space-y-1">
      {headings.map(({ level, text, id }) => (
        <a
          key={id}
          href={`#${id}`}
          className={`block text-sm transition-colors ${
            level === 3 ? 'pl-3' : ''
          } ${
            activeId === id
              ? 'text-indigo-400 font-medium'
              : 'text-slate-400 hover:text-white'
          }`}
          onClick={(e) => {
            e.preventDefault()
            const element = document.getElementById(id)
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' })
              setActiveId(id)
            }
          }}
        >
          {text}
        </a>
      ))}
    </nav>
  )
}
