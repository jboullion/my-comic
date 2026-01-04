/**
 * PageThumbnail Component
 * Thumbnail button for page navigation
 */
export default function PageThumbnail({ pageNumber, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full aspect-[3/4] rounded-lg border-2 transition-colors flex items-center justify-center ${
        isActive 
          ? 'border-indigo-500 bg-slate-800' 
          : 'border-slate-700 bg-slate-800 hover:border-slate-600'
      }`}
    >
      <span className={`text-xs ${isActive ? 'text-indigo-400 font-bold' : 'text-slate-500'}`}>
        {pageNumber}
      </span>
    </button>
  )
}
