/**
 * PropertyInput Component
 * A labeled numeric input for property editing
 */
export default function PropertyInput({ label, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-slate-500 uppercase font-bold">{label}</label>
      <input 
        type="number" 
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
      />
    </div>
  )
}
