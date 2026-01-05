/**
 * PresetButton Component
 * Button for applying preset dimensions
 */
export default function PresetButton({ label, size, onClick, active = false }) {
  return (
    <button
      onClick={onClick}
      className={`text-left px-3 py-2 rounded-lg text-xs transition-colors flex justify-between items-center border ${
        active
          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
          : 'bg-slate-900 hover:bg-slate-700 border-slate-700/50'
      }`}
    >
      <span className="font-medium">{label}</span>
      <span className={active ? 'text-indigo-400 font-mono' : 'text-slate-500 font-mono'}>{size}</span>
    </button>
  )
}
