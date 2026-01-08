import { Link, useLocation } from 'react-router-dom'
import DocsNav from '../DocsNav'
import PublicFooter from '../PublicFooter'
import MarkdownRenderer from './MarkdownRenderer'
import TableOfContents from './TableOfContents'

/**
 * Documentation sidebar sections with grouped navigation
 */
const docsSections = [
  {
    group: 'Getting Started',
    items: [
      { title: 'Overview', path: '/docs', icon: null },
      { title: 'Storage & Saving', path: '/docs/storage', icon: null },
    ]
  },
  {
    group: 'Elements',
    items: [
      { title: 'Images', path: '/docs/images', icon: null },
      { title: 'Speech Bubbles', path: '/docs/speech-bubbles', icon: null },
      { title: 'Text', path: '/docs/text', icon: null },
      { title: 'Text Effects', path: '/docs/text-effects', icon: null },
    ]
  },
  {
    group: 'Settings',
    items: [
      { title: 'Project Settings', path: '/docs/project-settings', icon: null },
      { title: 'Page Settings', path: '/docs/page-settings', icon: null },
    ]
  },
  {
    group: 'Tools & Export',
    items: [
      { title: 'Canvas Navigation', path: '/docs/canvas', icon: null },
      { title: 'Keyboard Shortcuts', path: '/docs/shortcuts', icon: null },
      { title: 'Exporting', path: '/docs/exporting', icon: null },
    ]
  },
]

/**
 * DocPageTemplate Component
 * Reusable template for documentation pages with sidebar and TOC
 */
export default function DocPageTemplate({ content }) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <DocsNav />

      <div className="flex-1 flex">
        {/* Left Sidebar - Navigation */}
        <aside className="hidden lg:block w-64 border-r border-slate-800 p-6 flex-shrink-0">
          <nav className="sticky top-24 space-y-6">
            {docsSections.map((section) => (
              <div key={section.group}>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  {section.group}
                </h4>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                        location.pathname === item.path
                          ? 'bg-indigo-500/20 text-indigo-400 font-medium'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {item.icon && <span>{item.icon}</span>}
                      <span>{item.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 px-6 py-8 lg:px-12">
          <div className="max-w-3xl">
            <MarkdownRenderer content={content} />
          </div>
        </main>

        {/* Right Sidebar - Table of Contents */}
        <aside className="hidden xl:block w-56 p-6 flex-shrink-0">
          <div className="sticky top-24">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              On This Page
            </h4>
            <TableOfContents content={content} />
          </div>
        </aside>
      </div>

      <PublicFooter />
    </div>
  )
}
