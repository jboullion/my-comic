/**
 * PageThumbnail Component
 * Draggable thumbnail button for page navigation
 */
export default function PageThumbnail({
  pageNumber,
  isActive,
  onClick,
  thumbnail,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`transition-all ${isDragging ? 'opacity-50' : ''} ${
        isDropTarget ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900 rounded-lg' : ''
      }`}
    >
      <button
        onClick={onClick}
        className={`w-full aspect-[3/4] rounded-lg border-2 transition-colors overflow-hidden relative cursor-grab active:cursor-grabbing ${
          isActive
            ? 'border-indigo-500'
            : 'border-slate-700 hover:border-slate-600'
        }`}
      >
        {thumbnail ? (
          <>
            <img
              src={thumbnail}
              alt={`Page ${pageNumber}`}
              className="w-full h-full object-contain"
              draggable={false}
            />
            <span className={`absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 rounded ${
              isActive
                ? 'bg-indigo-500 text-white font-bold'
                : 'bg-slate-900/80 text-slate-400'
            }`}>
              {pageNumber}
            </span>
          </>
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
            <span className={`text-xs ${isActive ? 'text-indigo-400 font-bold' : 'text-slate-500'}`}>
              {pageNumber}
            </span>
          </div>
        )}
      </button>
    </div>
  )
}
