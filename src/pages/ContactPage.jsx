import PublicLayout from '../layouts/PublicLayout'

export default function ContactPage() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
        
        <div className="space-y-8">
          <p className="text-lg text-slate-400">
            Have questions, feedback, or need help? We'd love to hear from you.
          </p>

          {/* Contact Form Placeholder */}
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Subject
              </label>
              <select className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <option>General Question</option>
                <option>Bug Report</option>
                <option>Feature Request</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Message
              </label>
              <textarea
                rows={5}
                placeholder="How can we help?"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
            >
              Send Message
            </button>
          </form>

          {/* Placeholder Notice */}
          <div className="mt-8 p-4 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-slate-400 text-sm">
              🚧 This is a placeholder form. Backend integration coming in Phase 2.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
