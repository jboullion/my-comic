import { FiLoader } from 'react-icons/fi'

/**
 * LoadingSpinner Component
 * Animated loading indicator
 */
export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className="flex items-center justify-center py-16">
      <FiLoader className={`${sizeClasses[size]} animate-spin text-indigo-500 ${className}`} />
    </div>
  )
}
