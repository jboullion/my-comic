import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiSend, FiLoader, FiCheck } from 'react-icons/fi'
import PublicLayout from '../layouts/PublicLayout'

/**
 * ContactPage
 *
 * Contact form with Netlify form integration.
 * Displays success/error states and allows users to submit feedback.
 */
export default function ContactPage() {
  const [formData, setFormData] = useState({
    subject: 'General Question',
    email: '',
    message: ''
  })
  const [status, setStatus] = useState('idle') // 'idle' | 'submitting' | 'success' | 'error'

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          'form-name': 'contact',
          ...formData
        }).toString()
      })

      if (!response.ok) throw new Error('Submission failed')

      setStatus('success')
    } catch (error) {
      setStatus('error')
      console.error('Form submission error:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      subject: 'General Question',
      email: '',
      message: ''
    })
    setStatus('idle')
  }

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-slate-400">
            Have questions, found a bug, or want to share feedback? We'd love to hear from you!
          </p>
        </div>

        {status === 'success' ? (
          /* Success state */
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Message Sent!</h3>
            <p className="text-slate-400 mb-6">
              Thank you for contacting us. We'll get back to you soon.
            </p>
            <button
              onClick={resetForm}
              className="px-6 py-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Send another message
            </button>
          </div>
        ) : (
          /* Contact form */
          <form
            name="contact"
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Hidden fields for Netlify */}
            <input type="hidden" name="form-name" value="contact" />

            {/* Honeypot field for spam protection */}
            <div className="hidden">
              <label>
                Don't fill this out: <input name="bot-field" />
              </label>
            </div>

            {/* Subject Dropdown */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                disabled={status === 'submitting'}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent disabled:opacity-50"
              >
                <option value="General Question">General Question</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Feature Request">Feature Request</option>
                {/* <option value="Pricing Inquiry">Pricing Inquiry</option> */}
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Email (Optional) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={status === 'submitting'}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent disabled:opacity-50"
              />
              <p className="text-xs text-slate-500 mt-1">Provide your email if you'd like a response</p>
            </div>

            {/* Message (Required) */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                required
                value={formData.message}
                onChange={handleChange}
                disabled={status === 'submitting'}
                placeholder="Tell us what's on your mind..."
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent resize-none disabled:opacity-50"
              />
            </div>

            {/* Error Message */}
            {status === 'error' && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
                Failed to send message. Please try again.
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {status === 'submitting' ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <FiSend className="w-5 h-5" />
                  Send Message
                </>
              )}
            </button>

            {/* Privacy Notice */}
            <p className="text-xs text-center text-slate-500 mt-6">
              We respect your privacy. See our{' '}
              <Link to="/privacy" className="text-indigo-400 hover:text-indigo-300 underline">
                Privacy Policy
              </Link>{' '}
              for details.
            </p>
          </form>
        )}
      </div>
    </PublicLayout>
  )
}
