import { Link } from 'react-router-dom'
import { FiBook } from 'react-icons/fi'

/**
 * NavLogo Component
 * App logo with configurable size and text display
 *
 * @param {'sm' | 'md' | 'lg'} size - Logo size variant (default: 'md')
 * @param {boolean} showText - Show "Comic Book Maker" text (default: true)
 */
export default function NavLogo({ size = 'md', showText = true }) {
  const sizes = {
    sm: { container: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-base' },
    md: { container: 'w-9 h-9', icon: 'w-5 h-5', text: 'text-lg' },
    lg: { container: 'w-10 h-10', icon: 'w-6 h-6', text: 'text-xl' },
  }

  const s = sizes[size] || sizes.md

  return (
    <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
      <div className={`${s.container} bg-indigo-500 rounded-lg flex items-center justify-center`}>
        <FiBook className={`${s.icon} text-white`} />
      </div>
      {showText && (
        <span className={`${s.text} font-bold text-white`}>Comic Book Maker</span>
      )}
    </Link>
  )
}
