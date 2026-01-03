/**
 * ErrorMessage Component
 * Display error message with retry option
 */
export default function ErrorMessage({ title = 'An error occurred', message, onRetry }) {
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-6 py-4 text-red-400">
      <p className="font-medium">{title}</p>
      {message && <p className="text-sm mt-1">{message}</p>}
      {onRetry && (
        <button 
          onClick={onRetry}
          className="mt-3 text-sm text-red-300 hover:text-white underline"
        >
          Try again
        </button>
      )}
    </div>
  )
}
