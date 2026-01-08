import { FiMousePointer, FiSquare, FiImage, FiType, FiMessageCircle, FiZap, FiCpu } from 'react-icons/fi'

/**
 * ToolButton Component
 * Icon button for toolbar tools
 */
export default function ToolButton({ icon, label, active = false, onClick }) {
  const icons = {
    pointer: <FiMousePointer className="w-5 h-5" />,
    square: <FiSquare className="w-5 h-5" />,
    image: <FiImage className="w-5 h-5" />,
    type: <FiType className="w-5 h-5" />,
    'message-circle': <FiMessageCircle className="w-5 h-5" />,
    zap: <FiZap className="w-5 h-5" />,
    cpu: <FiCpu className="w-5 h-5" />,
  }

  return (
    <button
      onClick={onClick}
      className={`p-2.5 rounded-lg transition-all ${
        active 
          ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
      title={label}
    >
      {icons[icon]}
    </button>
  )
}
