import { AI_MODELS } from '../../../lib/ai/falai'
import { COMIC_MODELS, isComicModel } from '../../../../supabase/functions/_shared/comicModels'

export default function ImageModelPicker({ model, setModel, disabled = false }: {
  model: string; setModel: (model: string) => void; disabled?: boolean
}) {
  const civitai = isComicModel(model)
  const fieldClass = 'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-50'
  return <div className="space-y-2">
    <label className="block text-xs text-slate-400">Model source
      <select className={fieldClass} value={civitai ? 'civitai' : 'fal'} disabled={disabled}
        onChange={e => setModel(e.target.value === 'civitai' ? 'civitai-illustration' : 'flux-2')}>
        <option value="fal">Fal.ai</option>
        <option value="civitai">Civitai · via Fal</option>
      </select>
    </label>
    <label className="block text-xs text-slate-400">{civitai ? 'Comic model' : 'Generation model'}
      <select className={fieldClass} value={model} disabled={disabled} onChange={e => setModel(e.target.value)}>
        {Object.entries(civitai ? COMIC_MODELS : AI_MODELS).map(([key, item]) => <option key={key} value={key}>{item.name}</option>)}
      </select>
    </label>
    {civitai && <p className="text-xs text-slate-400">SDXL 1.0 + comic style LoRA · 5 credits. Character LoRAs must also use SDXL 1.0. <a className="text-indigo-300 underline" target="_blank" rel="noreferrer" href={`https://civitai.com/models/${COMIC_MODELS[model].modelId}?modelVersionId=${COMIC_MODELS[model].versionId}`}>Model details</a></p>}
  </div>
}
