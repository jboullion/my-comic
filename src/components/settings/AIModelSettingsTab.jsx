import ImageModelPicker from '../editor/ai/ImageModelPicker'

/** Series defaults use the same reviewed model catalog as both generation tabs. */
export default function AIModelSettingsTab({ settings, onUpdate }) {
  return <div className="space-y-5">
    <h3 className="text-sm font-semibold text-white">Image generation models</h3>
    <p className="text-sm text-slate-400">Choose the starting model for comics in this series. You can change it for each image in the generator.</p>
    <ImageModelPicker model={settings?.presetKey || 'flux-2'} setModel={presetKey => onUpdate({ ...settings, presetKey })} />
    <p className="text-xs text-slate-400">Civitai comic models run through Fal using an SDXL 1.0 base and a curated style LoRA. Add compatible character LoRAs in the character editor. Model access is configured by the site administrator.</p>
    {settings?.enabled && <p className="text-xs text-amber-300">Your previous custom checkpoint settings are preserved. The generator now uses the curated model list above.</p>}
  </div>
}
