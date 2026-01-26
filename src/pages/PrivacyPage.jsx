import PublicLayout from '../layouts/PublicLayout'

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-lg text-slate-400 mb-12">
          Last updated: January 2026
        </p>

        <div className="prose prose-invert prose-slate max-w-none space-y-6 text-slate-300">

          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Introduction</h2>
            <p>
              Comic Book Maker ("we," "our," or "us") is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, and safeguard information when
              you use our browser-based comic creation application (the "Service").
            </p>
          </section>

          {/* Privacy Highlight Box */}
          <div className="p-4 bg-indigo-900/30 rounded-lg border border-indigo-700/50 my-8">
            <h3 className="font-bold text-indigo-300 mb-2">Privacy-First Design</h3>
            <p className="text-sm text-slate-300">
              Your comic projects are stored locally in your browser using IndexedDB—we never
              have access to your creative work. All editing and processing happens on your
              device. Create with peace of mind!
            </p>
          </div>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Information We Collect</h2>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Local Data (Your Device Only)</h3>
            <p>
              Comic Book Maker is designed to work entirely in your browser. When you use our app:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li><strong className="text-white">Project data:</strong> All comic projects, pages, images, and elements are stored in your browser's IndexedDB and never transmitted to our servers</li>
              <li><strong className="text-white">Settings and preferences:</strong> Theme settings, default element styles, and editor preferences are saved locally</li>
              <li><strong className="text-white">Asset gallery:</strong> Uploaded images and assets are stored in your browser's local storage</li>
              <li><strong className="text-white">No account required:</strong> You can use the core features without creating an account or providing personal information</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">AI Features (Optional)</h3>
            <p>
              If you choose to use our AI-powered features, certain data is processed through third-party services:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li><strong className="text-white">Image generation:</strong> Text prompts you enter are sent to AI image generation services to create images</li>
              <li><strong className="text-white">Story AI chat:</strong> Messages and optional page captures are sent to AI chat services to provide story assistance</li>
              <li><strong className="text-white">Character references:</strong> If you upload character reference images for AI consistency, these are processed by the AI service</li>
              <li><strong className="text-white">Credit system:</strong> If you use AI credits, we track credit usage associated with your account</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Account Information (If Registered)</h3>
            <p>
              If you create an account to use AI features or sync data:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li><strong className="text-white">Authentication:</strong> Email address and authentication credentials managed through our auth provider</li>
              <li><strong className="text-white">Credit balance:</strong> Your AI credit balance and usage history</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li><strong className="text-white">Service operation:</strong> To provide and maintain the comic creation tools</li>
              <li><strong className="text-white">AI features:</strong> To process your requests for AI image generation and story assistance</li>
              <li><strong className="text-white">Credit management:</strong> To track and manage AI feature usage</li>
              <li><strong className="text-white">Service improvement:</strong> To understand usage patterns and improve our application</li>
            </ul>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Third-Party Services</h2>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Supabase (Backend Infrastructure)</h3>
            <p>
              We use Supabase for authentication and edge functions that power AI features.
              Supabase processes authentication data and API requests according to their{' '}
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">
                Privacy Policy
              </a>.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Fal.ai (AI Image Generation)</h3>
            <p>
              AI image generation is powered by Fal.ai using FLUX models. When you generate
              images, your prompts and any reference images are processed by Fal.ai according
              to their{' '}
              <a href="https://fal.ai/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">
                Privacy Policy
              </a>.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">OpenRouter (Story AI)</h3>
            <p>
              The Story AI chat feature uses OpenRouter to access various language models
              (including Gemini, Claude, and GPT). Your chat messages and any attached images
              are processed according to OpenRouter's{' '}
              <a href="https://openrouter.ai/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">
                Privacy Policy
              </a>.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Google Fonts</h3>
            <p>
              We use Google Fonts to provide typography options for text elements. When fonts
              are loaded, your browser makes requests to Google's servers. See Google's{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">
                Privacy Policy
              </a>{' '}
              for more information.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">CivitAI (Custom Models)</h3>
            <p>
              If you use custom AI models from CivitAI, model files are downloaded from their
              servers according to CivitAI's{' '}
              <a href="https://civitai.com/content/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">
                Privacy Policy
              </a>.
            </p>
          </section>

          {/* Data Storage and Security */}
          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Data Storage and Security</h2>
            <p>We implement appropriate security measures to protect your information:</p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li><strong className="text-white">Local processing:</strong> All comic editing and rendering happens in your browser, not on our servers</li>
              <li><strong className="text-white">No project storage:</strong> We do not store your comic projects, images, or creative content on our servers</li>
              <li><strong className="text-white">HTTPS encryption:</strong> All data transmission is encrypted using SSL/TLS</li>
              <li><strong className="text-white">Secure API routing:</strong> AI requests are routed through secure edge functions to protect API credentials</li>
            </ul>
          </section>

          {/* Cookies and Local Storage */}
          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Cookies and Local Storage</h2>
            <p>We use the following types of browser storage:</p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li><strong className="text-white">IndexedDB:</strong> To store your comic projects, pages, elements, and uploaded assets locally</li>
              <li><strong className="text-white">Local storage:</strong> To save your preferences, settings, and editor state</li>
              <li><strong className="text-white">Session storage:</strong> For temporary data during your editing session</li>
              <li><strong className="text-white">Authentication cookies:</strong> If logged in, to maintain your session</li>
            </ul>
            <p className="mt-4">
              You can clear local storage and IndexedDB through your browser settings. Note that
              this will delete all saved projects and preferences.
            </p>
          </section>

          {/* Your Rights and Choices */}
          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Your Rights and Choices</h2>
            <p>You have the following rights regarding your information:</p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li><strong className="text-white">Access:</strong> Your project data is stored locally—you have full access to it at all times</li>
              <li><strong className="text-white">Export:</strong> You can export your comics as images at any time</li>
              <li><strong className="text-white">Deletion:</strong> Clear your browser's local storage to remove all saved data</li>
              <li><strong className="text-white">AI opt-out:</strong> AI features are entirely optional—you can create comics without using them</li>
              <li><strong className="text-white">Account deletion:</strong> Contact us to request deletion of your account and associated data</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Data Retention</h2>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li><strong className="text-white">Local data:</strong> Retained in your browser until you clear it or uninstall the app</li>
              <li><strong className="text-white">AI prompts:</strong> Not retained by us after processing; see third-party policies for their retention practices</li>
              <li><strong className="text-white">Credit history:</strong> Retained as long as your account is active</li>
              <li><strong className="text-white">Account data:</strong> Retained until you request deletion</li>
            </ul>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Children's Privacy</h2>
            <p>
              Our service is designed to be family-friendly for comic creation. We do not
              knowingly collect personal information from children under 13. Since core features
              work without an account and data is stored locally, children can safely use the
              comic creation tools. AI features that require an account are intended for users
              13 and older. If you believe we have inadvertently collected information from a
              child under 13, please contact us.
            </p>
          </section>

          {/* International Users */}
          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">International Users</h2>
            <p>
              If you are accessing our service from outside the United States, please be aware
              that information may be transferred to, stored, and processed in the United States
              and other countries where our service providers operate. By using the service, you
              consent to this transfer.
            </p>
          </section>

          {/* Changes to This Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any
              changes by posting the new Privacy Policy on this page and updating the "Last
              updated" date. We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our privacy practices,
              please <a href='/contact' className='text-indigo-400'>contact us</a>.
            </p>
          </section>

          {/* Footer Box */}
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 my-8">
            <h3 className="font-bold text-white mb-2">Create With Confidence</h3>
            <p className="text-sm text-slate-400">
              Your comics are yours. All project data stays in your browser, and AI features
              are completely optional. We've designed Comic Book Maker with privacy at its core
              so you can focus on what matters—creating amazing comics.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
