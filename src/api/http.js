export const DEFAULT_API_BASE = 'http://localhost:3000'

export function getApiBase() {
  const raw = import.meta.env.VITE_API_BASE_URL
  const resolved =
    typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : DEFAULT_API_BASE
  return resolved.replace(/\/+$/, '')
}

export async function readErrorMessage(response) {
  try {
    const body = await response.json()
    if (Array.isArray(body?.message)) {
      const first = body.message[0]
      if (typeof first === 'string') return first
      if (first?.constraints && typeof first.constraints === 'object') {
        const c = Object.values(first.constraints)[0]
        if (typeof c === 'string') return c
      }
    }
    if (body?.message && typeof body.message === 'string') return body.message
    if (body?.error && typeof body.error === 'string') return body.error
  } catch {
    /* ignore */
  }
  return `Request failed (${response.status})`
}
