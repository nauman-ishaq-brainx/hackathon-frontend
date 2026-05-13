import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchAmbiguitiesByBriefId } from '../api/briefs.js'
import { submitAmbiguityAnswers, MAX_ANSWER_LENGTH } from '../api/ambiguities.js'

const fieldStyle = {
  width: '100%',
  maxWidth: '42rem',
  padding: '0.65rem 0.75rem',
  font: 'inherit',
  border: '1px solid #c8cdd3',
  borderRadius: '6px',
}

/** a, b, … z, then aa, ab, … */
function answerLetter(index) {
  let n = index
  let s = ''
  do {
    s = String.fromCharCode(97 + (n % 26)) + s
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return s
}

export default function BriefAmbiguitiesPage() {
  const { briefId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [ambiguities, setAmbiguities] = useState([])
  const [answers, setAnswers] = useState({})
  const [submittingAnswers, setSubmittingAnswers] = useState(false)
  const [answersError, setAnswersError] = useState(null)

  const allAnswersProvided = useMemo(() => {
    if (!briefId || ambiguities.length === 0) return false
    return ambiguities.every((_, index) => (answers[index] ?? '').trim().length > 0)
  }, [ambiguities, answers, briefId])

  useEffect(() => {
    let cancelled = false
    if (!briefId) {
      setLoading(false)
      setAmbiguities([])
      return
    }

    setLoading(true)
    setLoadError(null)
    setAnswers({})
    setAnswersError(null)

    fetchAmbiguitiesByBriefId(briefId)
      .then((res) => {
        if (!cancelled) setAmbiguities(res.ambiguities)
      })
      .catch((err) => {
        if (!cancelled) {
          setAmbiguities([])
          setLoadError(err instanceof Error ? err.message : 'Failed to load ambiguities.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [briefId])

  function handleAnswerChange(index, value) {
    setAnswersError(null)
    setAnswers((prev) => ({ ...prev, [index]: value }))
  }

  async function handleSubmitAnswers() {
    if (!briefId || !allAnswersProvided || ambiguities.length === 0) return

    setAnswersError(null)
    setSubmittingAnswers(true)
    try {
      const answersPayload = ambiguities.map((item, index) => ({
        ambiguityId: item.id,
        answer: (answers[index] ?? '').trim(),
      }))
      await submitAmbiguityAnswers({ briefId, answers: answersPayload })
      navigate(`/briefs/${briefId}/tickets`, { replace: true })
    } catch (err) {
      setAnswersError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmittingAnswers(false)
    }
  }

  return (
    <main
      style={{
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '48rem',
        margin: '0 auto',
      }}
    >
      <p style={{ marginTop: 0 }}>
        <Link to="/" style={{ color: '#2563eb' }}>
          ← Home
        </Link>
        {' · '}
        <Link to="/briefs/create" style={{ color: '#2563eb' }}>
          New brief
        </Link>
      </p>

      <h1 style={{ marginTop: 0 }}>Ambiguities</h1>
      <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
        Brief <code style={{ fontSize: '0.9em' }}>{briefId}</code>
      </p>

      {loading && <p style={{ color: '#64748b' }}>Loading…</p>}

      {loadError && (
        <p
          role="alert"
          style={{
            color: '#b91c1c',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            maxWidth: '42rem',
          }}
        >
          {loadError}
        </p>
      )}

      {!loading && !loadError && ambiguities.length === 0 && (
        <p style={{ color: '#64748b' }}>No ambiguities for this brief.</p>
      )}

      {ambiguities.length > 0 && (
        <section aria-labelledby="ambiguities-heading">
          <h2 id="ambiguities-heading" style={{ fontSize: '1.15rem' }}>
            Resolve ambiguities ({ambiguities.length})
          </h2>
          <p style={{ color: '#4b5563', fontSize: '0.95rem' }}>
            Provide a non-empty clarification for each item, then submit to the server.
          </p>
          <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
            {ambiguities.map((item, index) => {
              const letter = answerLetter(index)
              const value = answers[index] ?? ''
              const filled = value.trim().length > 0
              const fieldId = `answer-${index}-${item.id}`
              return (
                <li key={`${item.id}-${index}`} style={{ marginBottom: '1.25rem' }}>
                  <p style={{ margin: '0 0 0.5rem' }}>{item.question}</p>
                  <label htmlFor={fieldId} className="visually-hidden">
                    Answer {letter} for ambiguity {item.id}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span
                      aria-hidden
                      style={{
                        flexShrink: 0,
                        marginTop: '0.65rem',
                        fontWeight: 700,
                        color: '#64748b',
                        minWidth: '1.25rem',
                      }}
                    >
                      {letter}.
                    </span>
                    <textarea
                      id={fieldId}
                      rows={3}
                      value={value}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      placeholder="Your clarification…"
                      maxLength={MAX_ANSWER_LENGTH}
                      aria-invalid={!filled}
                      style={{
                        ...fieldStyle,
                        flex: 1,
                        resize: 'vertical',
                        borderColor: filled ? '#c8cdd3' : '#f59e0b',
                      }}
                    />
                  </div>
                  {!filled && (
                    <p
                      role="status"
                      style={{
                        margin: '0.35rem 0 0 0',
                        paddingLeft: '1.75rem',
                        fontSize: '0.85rem',
                        color: '#b45309',
                      }}
                    >
                      Required before you can submit answers.
                    </p>
                  )}
                </li>
              )
            })}
          </ol>

          {answersError && (
            <p
              role="alert"
              style={{
                color: '#b91c1c',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                maxWidth: '42rem',
                marginBottom: '0.75rem',
              }}
            >
              {answersError}
            </p>
          )}

          <button
            type="button"
            disabled={!allAnswersProvided || submittingAnswers}
            onClick={handleSubmitAnswers}
            title={
              allAnswersProvided
                ? 'Submit all answers to the server'
                : 'Fill every answer before submitting'
            }
            style={{
              padding: '0.5rem 1rem',
              font: 'inherit',
              fontWeight: 600,
              border: 'none',
              borderRadius: '6px',
              background:
                !allAnswersProvided || submittingAnswers ? '#94a3b8' : '#1d4ed8',
              color: '#fff',
              cursor:
                !allAnswersProvided || submittingAnswers ? 'not-allowed' : 'pointer',
            }}
          >
            {submittingAnswers ? 'Submitting…' : 'Submit answers'}
          </button>
        </section>
      )}
    </main>
  )
}
