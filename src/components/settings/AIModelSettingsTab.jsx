import { FiInfo } from 'react-icons/fi'
import { isFalConfigured } from '../../lib/falai'
import { isReplicateConfigured } from '../../lib/replicate'

/**
 * Model architecture options for the custom model dropdown
 */
const MODEL_TYPES = [
  { value: 'flux', label: 'FLUX', description: 'FLUX models (fal-ai/flux-lora)' },
  { value: 'sdxl', label: 'SDXL / Pony', description: 'SDXL-based models including Pony Diffusion' },
  { value: 'sd15', label: 'SD 1.5', description: 'Stable Diffusion 1.5 models' }
]

/**
 * AIModelSettingsTab Component
 * Custom AI model configuration for the project
 */
export default function AIModelSettingsTab({ settings, onUpdate }) {
  const customModel = settings || {
    enabled: false,
    provider: 'falai',
    name: '',
    type: 'sdxl',
    url: '',
    allowMature: false,
    replicateModel: ''
  }

  const falaiConfigured = isFalConfigured()
  const replicateConfigured = isReplicateConfigured()

  const handleChange = (field, value) => {
    onUpdate({ ...customModel, [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">AI Provider</h3>
        <p className="text-xs text-slate-400">
          Choose which AI service to use for image generation in this series.
        </p>
      </div>

      {/* Provider Selection */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-slate-500 uppercase font-bold">
          Provider
        </label>
        <select
          value={customModel.provider || 'falai'}
          onChange={(e) => handleChange('provider', e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <option value="falai">
            Fal.ai {!falaiConfigured && '(API Key Not Set)'}
          </option>
          <option value="replicate">
            Replicate {!replicateConfigured && '(API Key Not Set)'}
          </option>
        </select>
        <p className="text-[10px] text-slate-500">
          {customModel.provider === 'falai' && 'Using Fal.ai for FLUX and custom models'}
          {customModel.provider === 'replicate' && 'Using Replicate for FLUX models and fine-tunes'}
        </p>
      </div>

      {/* Show configuration warning if key missing */}
      {customModel.provider === 'replicate' && !replicateConfigured && (
        <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg px-4 py-3">
          <p className="text-xs text-amber-200">
            <span className="font-semibold">API Key Required:</span> Add <code className="bg-amber-950/50 px-1 py-0.5 rounded">VITE_REPLICATE_API_KEY</code> to your <code className="bg-amber-950/50 px-1 py-0.5 rounded">.env.local</code> file.
            Get your key at <a href="https://replicate.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">replicate.com</a>
          </p>
        </div>
      )}

      {customModel.provider === 'falai' && !falaiConfigured && (
        <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg px-4 py-3">
          <p className="text-xs text-amber-200">
            <span className="font-semibold">API Key Required:</span> Add <code className="bg-amber-950/50 px-1 py-0.5 rounded">VITE_FAL_AI_KEY</code> to your <code className="bg-amber-950/50 px-1 py-0.5 rounded">.env.local</code> file.
            Get your key at <a href="https://fal.ai" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">fal.ai</a>
          </p>
        </div>
      )}

      <div className="pt-4 border-t border-slate-700">
        <h3 className="text-sm font-semibold text-white mb-1">Custom AI Model</h3>
        <p className="text-xs text-slate-400">
          Configure a custom base model from CivitAI for this project.
          This model will appear in the AI Image Generator.
        </p>
      </div>

      {/* Enable Toggle */}
      <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
        <div className="flex-1">
          <label className="text-sm text-white font-medium">
            Use Custom Base Model
          </label>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Enable to use a custom CivitAI model instead of default FLUX models
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={customModel.enabled}
          onClick={() => handleChange('enabled', !customModel.enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            customModel.enabled ? 'bg-indigo-500' : 'bg-slate-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              customModel.enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Model Configuration (shown when enabled) */}
      {customModel.enabled && (
        <div className="space-y-4 pt-2">
          {/* Model Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase font-bold">
              Model Name
            </label>
            <input
              type="text"
              value={customModel.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Pony Diffusion V6 XL"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
            <p className="text-[10px] text-slate-500">
              Display name shown in the model dropdown
            </p>
          </div>

          {/* Model Type */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase font-bold">
              Model Architecture
            </label>
            <select
              value={customModel.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {MODEL_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500">
              {MODEL_TYPES.find(t => t.value === customModel.type)?.description}
            </p>
          </div>

          {/* Provider-Specific Fields */}
          {customModel.provider === 'falai' && (
            <>
              {/* Model URL for Fal.ai */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase font-bold">
                  CivitAI Model URL
                </label>
                <input
                  type="text"
                  value={customModel.url}
                  onChange={(e) => handleChange('url', e.target.value)}
                  placeholder="https://civitai.com/api/download/models/..."
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Info Box for Fal.ai */}
              <div className="bg-slate-900/50 rounded-lg px-4 py-3 text-sm text-slate-400">
                <div className="flex items-start gap-2">
                  <FiInfo className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-400" />
                  <div className="space-y-2">
                    <p>
                      To get the model URL from CivitAI:
                    </p>
                    <ol className="list-decimal list-inside text-xs text-slate-500 space-y-1">
                      <li>Go to the model page on CivitAI</li>
                      <li>Click the Download button</li>
                      <li>Right-click and copy the download link</li>
                    </ol>
                    <p className="text-xs text-slate-500 mt-2">
                      Make sure your character LoRAs are compatible with this base model architecture.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {customModel.provider === 'replicate' && (
            <>
              {/* Model ID for Replicate */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase font-bold">
                  Replicate Model ID
                </label>
                <input
                  type="text"
                  value={customModel.replicateModel || ''}
                  onChange={(e) => handleChange('replicateModel', e.target.value)}
                  placeholder="username/model-name:version"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
                <p className="text-[10px] text-slate-500">
                  Format: owner/model:version (e.g., username/my-flux-model:abc123)
                </p>
              </div>

              {/* Info Box for Replicate */}
              <div className="bg-slate-900/50 rounded-lg px-4 py-3 text-sm text-slate-400">
                <div className="flex items-start gap-2">
                  <FiInfo className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-400" />
                  <div className="space-y-2">
                    <p>
                      To use a fine-tuned model from Replicate:
                    </p>
                    <ol className="list-decimal list-inside text-xs text-slate-500 space-y-1">
                      <li>Train or find a fine-tuned model on Replicate</li>
                      <li>Copy the model ID (owner/model:version)</li>
                      <li>Paste it in the field above</li>
                    </ol>
                    <p className="text-xs text-slate-500 mt-2">
                      Leave empty to use standard Replicate FLUX models.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Content Settings - Always visible */}
      <div className="pt-4 border-t border-slate-700">
        <h3 className="text-sm font-semibold text-white mb-4">Content Settings</h3>

        {/* Allow Mature Content Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <div className="flex-1">
            <label className="text-sm text-white font-medium">
              Allow Mature Content
            </label>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Disables safety filters for all AI generations in this project
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={customModel.allowMature}
            onClick={() => handleChange('allowMature', !customModel.allowMature)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              customModel.allowMature ? 'bg-indigo-500' : 'bg-slate-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                customModel.allowMature ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* FLUX Models Warning */}
        <div className="mt-3 bg-amber-900/30 border border-amber-700/50 rounded-lg px-4 py-3">
          <p className="text-xs text-amber-200">
            <span className="font-semibold">Note:</span> Default FLUX models have built-in content filters that cannot be fully disabled.
            To generate mature/adult content, you must configure a custom model above (e.g., an SDXL or Pony Diffusion model from CivitAI).
          </p>
        </div>
      </div>

      {/* Setup Guide */}
      <div className="pt-4 border-t border-slate-700">
        <h3 className="text-sm font-semibold text-white mb-4">Custom Model Setup Guide</h3>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <span className="shrink-0 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-xs font-bold text-white">1</span>
              <div>
                <p className="text-sm text-white font-medium">Find a model on CivitAI</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Go to <span className="text-indigo-400">civitai.com</span> and browse for a base model (checkpoint).
                  Popular choices include Pony Diffusion, RealVisXL, or other SDXL-based models.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="shrink-0 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-xs font-bold text-white">2</span>
              <div>
                <p className="text-sm text-white font-medium">Get the download URL</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  On the model page, click the <span className="text-indigo-400">Download</span> button.
                  Then <span className="text-indigo-400">right-click</span> on the download button and select
                  <span className="text-indigo-400"> "Copy link address"</span>.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="shrink-0 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-xs font-bold text-white">3</span>
              <div>
                <p className="text-sm text-white font-medium">Configure the model above</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enable "Use Custom Base Model", enter a display name, select the correct architecture
                  (usually SDXL for most modern models), and paste the copied URL.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="shrink-0 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-xs font-bold text-white">4</span>
              <div>
                <p className="text-sm text-white font-medium">Use in AI Image Generator</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your custom model will now appear at the top of the model dropdown in the AI Image Generator.
                  Character LoRAs will be applied on top of your custom base model.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-700">
            <p className="text-[10px] text-slate-500">
              <span className="font-semibold">Tip:</span> Make sure any character LoRAs you use are compatible with your chosen base model architecture.
              For example, SDXL LoRAs work with SDXL/Pony models, not with SD 1.5 models.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
