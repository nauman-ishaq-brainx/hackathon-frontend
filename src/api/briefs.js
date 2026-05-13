import { getApiBase, readErrorMessage } from './http.js'

/**
 * POST /briefs — creates a brief. Response is the saved brief document, including `ambiguities`.
 * @param {string} briefText
 * @returns {Promise<{
 *   ambiguities: Array<{ id: string; question: string }>
 *   briefId?: string
 *   rawBrief?: string
 * }>}
 */
export async function createBrief(briefText) {
  const url = `${getApiBase()}/briefs`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brief: briefText }),
  })

  if (!response.ok) {
    const message = await readErrorMessage(response)
    throw new Error(message)
  }

  const data = await response.json()
  const briefId =
    data?._id != null
      ? String(typeof data._id === 'object' && data._id !== null && '$oid' in data._id ? data._id.$oid : data._id)
      : undefined

  return {
    ambiguities: normalizeAmbiguities(data.ambiguities),
    briefId,
    rawBrief: typeof data.rawBrief === 'string' ? data.rawBrief : undefined,
  }
}

/**
 * GET /briefs/:briefId/ambiguities — list ambiguities for a brief.
 * Accepts a raw array or `{ ambiguities: [...] }`.
 * @param {string} briefId
 * @returns {Promise<{ ambiguities: Array<{ id: string; question: string }> }>}
 */
export async function fetchAmbiguitiesByBriefId(briefId) {
  const url = `${getApiBase()}/briefs/${encodeURIComponent(briefId)}/ambiguities`
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    const message = await readErrorMessage(response)
    throw new Error(message)
  }

  const data = await response.json()
  let raw = []
  if (Array.isArray(data)) {
    raw = data
  } else if (Array.isArray(data?.ambiguities)) {
    raw = data.ambiguities
  }

  return { ambiguities: normalizeAmbiguities(raw) }
}

function normalizeAmbiguities(raw) {
  if (!Array.isArray(raw)) return []
  return raw.map((item, index) => {
    if (typeof item === 'string') {
      return { id: String(index), question: item }
    }
    const id = resolveAmbiguityId(item, index)
    const question =
      typeof item?.text === 'string'
        ? item.text
        : typeof item?.question === 'string'
          ? item.question
          : ''
    return { id, question }
  })
}

/** Prefer Mongo-style ids from the API for POST /ambiguities/answers. */
function resolveAmbiguityId(item, index) {
  if (item?.ambiguityId != null) return String(item.ambiguityId)
  if (item?._id != null) {
    const raw = item._id
    if (typeof raw === 'object' && raw !== null && '$oid' in raw) {
      return String(raw.$oid)
    }
    return String(raw)
  }
  if (item?.id != null) return String(item.id)
  return String(index)
}
