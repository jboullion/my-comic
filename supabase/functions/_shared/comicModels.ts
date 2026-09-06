// Pinned SDXL 1.0 LoRAs. Keep this catalog shared with the client: no secrets here.
// Civitai metadata advertised hosted-generation permission (Rent) on 2026-09-06.
export const COMIC_MODELS = {
  'civitai-illustration': { name: 'Comic Book Illustration', versionId: 271577, modelId: 240708, scale: 0.8, description: 'Illustrated comic-book look' },
  'civitai-realism': { name: 'Comic Realism', versionId: 247021, modelId: 219089, scale: 0.8, description: 'A more realistic comic look' },
  'civitai-cover': { name: 'Comic Cover Maker', versionId: 503206, modelId: 451944, scale: 0.8, description: 'Comic-cover styling' },
} as const

export type ComicModelKey = keyof typeof COMIC_MODELS
export const COMIC_BASE_MODEL = 'stabilityai/stable-diffusion-xl-base-1.0'
export function isComicModel(key: string): key is ComicModelKey {
  return Object.prototype.hasOwnProperty.call(COMIC_MODELS, key)
}

export function civitaiVersionId(value: string): number {
  let url: URL
  try { url = new URL(value) } catch { throw new Error('Use a Civitai model version URL.') }
  if (url.protocol !== 'https:' || url.hostname !== 'civitai.com' || url.port || url.username || url.password || url.searchParams.has('token')) {
    throw new Error('Use an HTTPS civitai.com URL without credentials or API tokens.')
  }
  const match = url.pathname.match(/^\/api\/(?:download\/models|v1\/model-versions)\/(\d+)\/?$/)
  const id = match?.[1] || (/^\/models\/\d+(?:\/[^/]*)?\/?$/.test(url.pathname) ? url.searchParams.get('modelVersionId') : null)
  if (!id || !/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) < 1) {
    throw new Error('Select a specific Civitai version: the URL needs modelVersionId or /api/download/models/VERSION_ID.')
  }
  return Number(id)
}

export function validateLoraScale(value: unknown): number {
  const scale = value ?? 0.8
  if (typeof scale !== 'number' || !Number.isFinite(scale) || scale < 0 || scale > 1) {
    throw new Error('LoRA strength must be between 0 and 1.')
  }
  return scale
}
