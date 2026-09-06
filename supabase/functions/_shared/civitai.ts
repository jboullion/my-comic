import { COMIC_BASE_MODEL, COMIC_MODELS, isComicModel, civitaiVersionId, validateLoraScale } from './comicModels.ts'

export interface LoraSelection { url: string; scale?: number; triggerWord?: string }

// Dependency injection keeps remote validation testable without credentials or paid calls.
export async function resolveComicModel(model: string, selections: LoraSelection[], apiKey?: string, request = fetch) {
  if (!isComicModel(model)) throw new Error('Unknown comic model.')
  if (!Array.isArray(selections) || selections.length > 3) throw new Error('Select at most three character LoRAs.')
  const preset = COMIC_MODELS[model]
  const resources = [
    { id: preset.versionId, scale: preset.scale, triggerWord: '' },
    ...selections.map(lora => ({ id: civitaiVersionId(lora.url), scale: validateLoraScale(lora.scale), triggerWord: lora.triggerWord || '' })),
  ]
  if (new Set(resources.map(r => r.id)).size !== resources.length) throw new Error('Each selected LoRA must use a different model version.')
  const loras = []
  const triggers: string[] = []
  for (const resource of resources) {
    const response = await request(`https://civitai.com/api/v1/model-versions/${resource.id}`, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {}, signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) throw new Error(`Civitai version ${resource.id} is unavailable (${response.status}).`)
    const version = await response.json()
    if (version.model?.type !== 'LORA' || version.baseModel !== 'SDXL 1.0') {
      throw new Error(`Civitai version ${resource.id} must be an SDXL 1.0 LoRA. FLUX, Pony and Illustrious LoRAs are not compatible with this catalog.`)
    }
    const modelResponse = await request(`https://civitai.com/api/v1/models/${version.modelId}`, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {}, signal: AbortSignal.timeout(15000),
    })
    if (!modelResponse.ok) throw new Error(`Unable to verify permissions for Civitai version ${resource.id}.`)
    const modelInfo = await modelResponse.json()
    if (!modelInfo.allowCommercialUse?.includes('Rent')) throw new Error(`Civitai version ${resource.id} does not permit third-party hosted generation. Choose another LoRA.`)
    const file = version.files?.find((f: { type: string; primary?: boolean; metadata?: { format?: string } }) => f.type === 'Model' && f.primary && f.metadata?.format === 'SafeTensor')
    if (!file) throw new Error(`Civitai version ${resource.id} has no primary SafeTensor download.`)
    const download = new URL(file.downloadUrl)
    if (civitaiVersionId(download.href) !== resource.id) throw new Error('Unexpected Civitai download URL.')
    if (apiKey) download.searchParams.set('token', apiKey)
    // Resolve Civitai authentication here, never pass the API token to Fal or the browser.
    const probe = await request(download.href, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(15000) })
    const location = probe.headers.get('location')
    if (![301, 302, 303, 307, 308].includes(probe.status) || !location) {
      throw new Error(`Civitai download ${resource.id} is unavailable. It may require a server-side CIVITAI_API_KEY or an accessible model file.`)
    }
    const target = new URL(location)
    if (target.protocol !== 'https:' || target.username || target.password || target.hostname === 'civitai.com' || (apiKey && target.href.includes(apiKey))) {
      throw new Error('Civitai did not return a usable file download.')
    }
    loras.push({ path: target.href, scale: resource.scale })
    triggers.push(resource.triggerWord || (version.trainedWords || []).join(', '))
  }
  return { modelId: 'fal-ai/lora', modelName: COMIC_BASE_MODEL, loras, triggers: triggers.filter(Boolean), name: preset.name }
}
