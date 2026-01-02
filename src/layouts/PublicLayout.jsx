import PublicNav from '../components/PublicNav'
import PublicFooter from '../components/PublicFooter'

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <PublicNav />
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      <PublicFooter />
    </div>
  )
}
