import PublicLayout from '../layouts/PublicLayout'

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert prose-slate max-w-none space-y-6 text-slate-300">
          <p className="text-lg text-slate-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Your Data Stays With You</h2>
            <p>
              Comic Book Maker is designed with privacy-first principles. Your comic projects 
              are stored locally in your browser and on your device—we don't have access to them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">What We Don't Collect</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Your comic projects and artwork</li>
              <li>Images you upload to the editor</li>
              <li>Personal information (no account required)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Local Storage</h2>
            <p>
              We use IndexedDB (browser storage) to auto-save your work. This data never 
              leaves your device unless you explicitly export or share it.
            </p>
          </section>

          {/* TODO: Add more sections as needed */}
          <div className="mt-12 p-4 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-slate-400 text-sm">
              🚧 This is a placeholder page. Full privacy policy coming soon.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
