import { getApiBase, readErrorMessage } from './http.js'

export const MAX_ANSWER_LENGTH = 50_000

/**
 * POST /ambiguities/answers
 * @param {{ briefId: string; answers: Array<{ ambiguityId: string; answer: string }> }} dto
 */
export async function submitAmbiguityAnswers(dto) {
  const url = `${getApiBase()}/ambiguities/answers`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      briefId: dto.briefId,
      answers: dto.answers,
    }),
  })

  if (!response.ok) {
    const message = await readErrorMessage(response)
    throw new Error(message)
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null
  }

  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}
