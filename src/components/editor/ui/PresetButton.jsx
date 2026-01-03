/**
 * PresetButton Component
 * Button for applying preset dimensions
 */
export default function PresetButton({ label, size, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="text-left px-3 py-2 bg-slate-900 hover:bg-slate-700 rounded-lg text-xs transition-colors flex justify-between items-center border border-slate-700/50"
    >
      <span className="font-medium">{label}</span>
      <span className="text-slate-500 font-mono">{size}</span>
    </button>
  )
}
