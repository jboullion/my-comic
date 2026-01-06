import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { slugify } from './slugify'

/**
 * Extract text content from React children (handles nested elements)
 */
function extractText(children) {
  if (typeof children === 'string') return children
  if (Array.isArray(children)) {
    return children.map(extractText).join('')
  }
  if (children?.props?.children) {
    return extractText(children.props.children)
  }
  return ''
}

/**
 * Custom components for markdown rendering with Tailwind styling
 */
const components = {
  h1: ({ children }) => (
    <h1 className="text-3xl font-bold mb-6 mt-2 text-white">
      {children}
    </h1>
  ),
  h2: ({ children }) => {
    const text = extractText(children)
    const id = slugify(text)
    return (
      <h2 id={id} className="text-2xl font-semibold mb-4 mt-10 text-white scroll-mt-24 border-b border-slate-700 pb-2">
        {children}
      </h2>
    )
  },
  h3: ({ children }) => {
    const text = extractText(children)
    const id = slugify(text)
    return (
      <h3 id={id} className="text-xl font-medium mb-3 mt-8 text-white scroll-mt-24">
        {children}
      </h3>
    )
  },
  h4: ({ children }) => (
    <h4 className="text-lg font-medium mb-2 mt-6 text-white">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="text-slate-300 mb-4 leading-relaxed">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-outside ml-6 mb-4 space-y-1 text-slate-300">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside ml-6 mb-4 space-y-1 text-slate-300">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-slate-300 leading-relaxed">
      {children}
    </li>
  ),
  pre: ({ children }) => (
    <pre className="bg-slate-800 p-4 rounded-lg overflow-x-auto mb-4 border border-slate-700 text-sm font-mono text-slate-300">
      {children}
    </pre>
  ),
  code: ({ className, children }) => {
    // Code blocks have a language-* className, inline code doesn't
    if (className) {
      return <code className={className}>{children}</code>
    }
    // Inline code - note: code inside pre will inherit pre's block styling
    return (
      <code className="bg-slate-700 px-1.5 py-0.5 rounded text-indigo-400 text-sm font-mono">
        {children}
      </code>
    )
  },
  table: ({ children }) => (
    <div className="overflow-x-auto mb-6">
      <table className="w-full border-collapse text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-slate-800">
      {children}
    </thead>
  ),
  th: ({ children }) => (
    <th className="text-left p-3 border border-slate-700 font-semibold text-white">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="p-3 border border-slate-700 text-slate-300">
      {children}
    </td>
  ),
  tr: ({ children }) => (
    <tr className="hover:bg-slate-800/50">
      {children}
    </tr>
  ),
  hr: () => (
    <hr className="border-slate-700 my-8" />
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-indigo-400 hover:text-indigo-300 hover:underline"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-white">
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em className="italic text-slate-200">
      {children}
    </em>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-indigo-500 pl-4 my-4 text-slate-400 italic">
      {children}
    </blockquote>
  ),
}

/**
 * MarkdownRenderer Component
 * Renders markdown content with Tailwind styling
 */
export default function MarkdownRenderer({ content }) {
  return (
    <div className="prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
