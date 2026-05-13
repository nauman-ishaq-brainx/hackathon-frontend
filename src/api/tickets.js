import { getApiBase, readErrorMessage } from './http.js'

function stringifyId(value) {
  if (value == null) return ''
  if (typeof value === 'object' && value !== null && '$oid' in value) {
    return String(value.$oid)
  }
  return String(value)
}

function normalizeTicket(t) {
  const dependencies = Array.isArray(t.dependencies)
    ? t.dependencies.map((d) => stringifyId(d))
    : []
  return {
    ...t,
    _id: stringifyId(t._id),
    briefId: t.briefId != null ? stringifyId(t.briefId) : t.briefId,
    dependencies,
  }
}

/**
 * GET /briefs/:briefId/tickets
 * Supports body as a raw array of tickets or `{ success?, tickets: [...] }`.
 * @param {string} briefId
 * @returns {Promise<{ success: boolean; tickets: object[] }>}
 */
export async function fetchTicketsByBriefId(briefId) {
  const url = `${getApiBase()}/briefs/${encodeURIComponent(briefId)}/tickets`
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    const message = await readErrorMessage(response)
    throw new Error(message)
  }

  const data = await response.json()
  let rawList = []
  if (Array.isArray(data)) {
    rawList = data
  } else if (Array.isArray(data?.tickets)) {
    rawList = data.tickets
  }

  const tickets = rawList.map((t) => normalizeTicket(t))
  return {
    success: typeof data === 'object' && data !== null && !Array.isArray(data) ? Boolean(data.success) : true,
    tickets,
  }
}
