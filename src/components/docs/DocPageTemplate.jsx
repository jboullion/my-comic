import PublicNav from '../PublicNav'
import PublicFooter from '../PublicFooter'
import MarkdownRenderer from './MarkdownRenderer'
import TableOfContents from './TableOfContents'
import DocsSidebar from './DocsSidebar'

/**
 * DocPageTemplate Component
 * Reusable template for documentation pages with sidebar and TOC
 */
export default function DocPageTemplate({ content }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <PublicNav />

      <div className="flex-1 flex">
        {/* Left Sidebar - Navigation (collapsible like AppSidebar) */}
        <DocsSidebar />

        {/* Main Content - add left padding on mobile for docs menu button */}
        <main className="flex-1 min-w-0 px-6 py-8 lg:px-12 pt-16 lg:pt-8">
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
