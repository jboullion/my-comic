import { useState } from 'react'
import PublicLayout from '../layouts/PublicLayout'
import PricingCard from '../components/public/PricingCard'
import InfoModal from '../components/public/InfoModal'

/**
 * PricingPage
 *
 * Displays pricing tiers: Free, Hobbyist ($10/mo), and Pro (coming soon).
 * Handles CTA clicks with modals for "Get Started" and "Coming Soon" messages.
 */
export default function PricingPage() {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    actionButton: null
  })

  // Pricing tier data
  const freeTier = {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    features: [
      'Full-featured comic editor',
      'Drag-and-drop interface',
      'Local storage (offline access)',
      'Image uploads & management',
      'Speech bubbles & text tools',
      'Text effects (POW!, BAM!)',
      'Multi-page projects',
      'Export to WebP, PNG, JPEG'
    ],
    ctaText: '',
    highlighted: false
  }

  const hobbyistTier = {
    name: 'Hobbyist',
    price: '$10',
    priceSubtext: 'per month',
    badge: '',
    description: 'For comic fans',
    features: [
      'Everything in Free',
      'AI image generation',
      'AI Inpainting',
      'Reference image support',
      'Style presets (Comic, Manga, Realistic)',
      'Generation history tracking',
      'Story Assistant'
    ],
    ctaText: 'Coming Soon',
    highlighted: true
  }

  const proTier = {
    name: 'Pro',
    price: 'TBD',
    badge: 'Coming Soon',
    description: 'For serious creators',
    features: [
      'Everything in Hobbyist',
      'Cloud sync across devices',
      'Team collaboration tools',
      'Premium template library',
      'Advanced export options',
      'Priority support',
      'Custom branding'
    ],
    disabled: true
  }

  // Handle Free tier CTA
  const handleFreeClick = () => {
    setModalState({
      isOpen: true,
      title: 'Get Started for Free',
      message: 'Just head to the Dashboard to start creating for free!',
      actionButton: {
        text: 'Go to Dashboard',
        link: '/app'
      }
    })
  }

  // Handle Hobbyist tier CTA
  const handleHobbyistClick = () => {
    setModalState({
      isOpen: true,
      title: 'Coming Soon',
      message: 'Payment integration is coming soon! Contact us if you\'re interested in early access.',
      actionButton: {
        text: 'Contact Us',
        link: '/contact'
      }
    })
  }

  // Close modal
  const closeModal = () => {
    setModalState({
      isOpen: false,
      title: '',
      message: '',
      actionButton: null
    })
  }

  return (
    <PublicLayout>
      {/* Hero section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-400">
            Start free, upgrade when you're ready
          </p>
        </div>

        {/* Pricing grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          <PricingCard {...freeTier} onCtaClick={handleFreeClick} />
          <PricingCard {...hobbyistTier} onCtaClick={handleHobbyistClick} />
          <PricingCard {...proTier} />
        </div>
      </div>

      {/* InfoModal for CTAs */}
      <InfoModal {...modalState} onClose={closeModal} />
    </PublicLayout>
  )
}
