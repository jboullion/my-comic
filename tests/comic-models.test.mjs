import { test } from 'node:test'
import assert from 'node:assert/strict'
import { civitaiVersionId, isComicModel } from '../supabase/functions/_shared/comicModels.ts'
import { resolveComicModel } from '../supabase/functions/_shared/civitai.ts'

test('only explicit Civitai version URLs without credentials are accepted', () => {
  assert.equal(civitaiVersionId('https://civitai.com/models/12/name?modelVersionId=34'), 34)
  assert.equal(civitaiVersionId('https://civitai.com/api/download/models/34?fileId=56'), 34)
  for (const url of ['https://civitai.com/models/12', 'http://civitai.com/api/download/models/34', 'https://evil.test/api/download/models/34', 'https://civitai.com/api/download/models/34?token=secret', 'https://user:pass@civitai.com/api/download/models/34']) {
    assert.throws(() => civitaiVersionId(url))
  }
  assert.equal(isComicModel('toString'), false)
})

function mockCivitai({ baseModel = 'SDXL 1.0', permission = 'Rent', status = 302 } = {}) {
  const calls = []
  const request = async (url, options) => {
    calls.push({ url, options })
    if (url.includes('/model-versions/')) return Response.json({
      modelId: 123, baseModel, model: { type: 'LORA' }, trainedWords: ['ink style'],
      files: [{ type: 'Model', primary: true, metadata: { format: 'SafeTensor' }, downloadUrl: `https://civitai.com/api/download/models/${url.split('/').pop()}?fileId=456` }],
    })
    if (url.includes('/api/v1/models/')) return Response.json({ allowCommercialUse: [permission] })
    return new Response(null, { status, headers: status === 302 ? { location: 'https://cdn.example.test/weights.safetensors?signed=abc' } : {} })
  }
  return { request, calls }
}

test('style and multiple character LoRAs use SDXL and keep credentials out of Fal inputs', async () => {
  const { request, calls } = mockCivitai()
  const result = await resolveComicModel('civitai-illustration', [
    { url: 'https://civitai.com/api/download/models/123', scale: 0, triggerWord: 'hero' },
    { url: 'https://civitai.com/api/download/models/456', scale: 1, triggerWord: 'sidekick' },
  ], 'private-key', request)
  assert.equal(result.modelId, 'fal-ai/lora')
  assert.equal(result.loras.length, 3)
  assert.equal(result.loras[1].scale, 0)
  assert.deepEqual(result.triggers, ['ink style', 'hero', 'sidekick'])
  assert.ok(!JSON.stringify(result).includes('private-key'))
  assert.ok(calls.filter(c => c.url.includes('token=')).every(c => new URL(c.url).hostname === 'civitai.com' && c.options.redirect === 'manual'))
})

test('rejects incompatible families, permissions and inaccessible downloads before generation', async () => {
  for (const baseModel of ['Pony', 'Illustrious', 'Flux.1 D', 'SD 1.5']) {
    await assert.rejects(resolveComicModel('civitai-cover', [], undefined, mockCivitai({ baseModel }).request), /SDXL 1.0/)
  }
  await assert.rejects(resolveComicModel('civitai-cover', [], undefined, mockCivitai({ permission: 'RentCivit' }).request), /hosted generation/)
  await assert.rejects(resolveComicModel('civitai-cover', [], undefined, mockCivitai({ status: 401 }).request), /CIVITAI_API_KEY/)
})

test('rejects unknown models, duplicates, excessive selections and invalid strength without requests', async () => {
  const { request, calls } = mockCivitai()
  const lora = { url: 'https://civitai.com/api/download/models/123' }
  await assert.rejects(resolveComicModel('missing', [], undefined, request), /Unknown/)
  await assert.rejects(resolveComicModel('civitai-cover', [lora, lora], undefined, request), /different/)
  await assert.rejects(resolveComicModel('civitai-cover', [lora, lora, lora, lora], undefined, request), /three/)
  for (const scale of [-1, 2, NaN, '0.8']) await assert.rejects(resolveComicModel('civitai-cover', [{ ...lora, scale }], undefined, request), /strength/)
  assert.equal(calls.length, 0)
})
