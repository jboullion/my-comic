/**
 * Documentation sidebar sections with grouped navigation
 * Shared between DocPageTemplate and DocsNav for mobile menu
 */
export const docsSections = [
  {
    group: 'Getting Started',
    items: [
      { title: 'Overview', path: '/docs', icon: null },
      { title: 'Storage & Saving', path: '/docs/storage', icon: null },
    ]
  },
  {
    group: 'AI Features',
    items: [
      { title: 'AI Image Generation', path: '/docs/ai-image-generation', icon: null },
      { title: 'Story AI', path: '/docs/story-ai', icon: null },
      { title: 'Credits', path: '/docs/credits', icon: null },
    ]
  },
  {
    group: 'Elements',
    items: [
      { title: 'Images', path: '/docs/images', icon: null },
      { title: 'Speech Bubbles', path: '/docs/speech-bubbles', icon: null },
      { title: 'Text', path: '/docs/text', icon: null },
      { title: 'Text Effects', path: '/docs/text-effects', icon: null },
      { title: 'Fonts', path: '/docs/fonts', icon: null },
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
