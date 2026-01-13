/**
 * Netlify Edge Function to proxy CivitAI API requests
 *
 * This solves CORS issues and properly forwards the Authorization header
 * to the CivitAI API.
 */

import type { Context } from '@netlify/edge-functions'

export default async function handler(request: Request, context: Context) {
  // Get the path after /api/civitai/
  const url = new URL(request.url)
  const pathAndQuery = url.pathname.replace('/api/civitai', '') + url.search

  // Build the CivitAI API URL
  const civitaiUrl = `https://civitai.com/api/v1${pathAndQuery}`

  // Forward the request to CivitAI with all headers
  const headers = new Headers()

  // Forward Authorization header if present
  const authHeader = request.headers.get('Authorization')
  if (authHeader) {
    headers.set('Authorization', authHeader)
  }

  // Forward Content-Type
  const contentType = request.headers.get('Content-Type')
  if (contentType) {
    headers.set('Content-Type', contentType)
  }

  try {
    const response = await fetch(civitaiUrl, {
      method: request.method,
      headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
    })

    // Return the response from CivitAI
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('CivitAI proxy error:', error)
    return new Response(JSON.stringify({ error: 'Failed to proxy request to CivitAI' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
}

export const config = {
  path: '/api/civitai/*',
}
