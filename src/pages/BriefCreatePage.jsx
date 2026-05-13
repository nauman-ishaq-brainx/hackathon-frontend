import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createBrief } from '../api/briefs.js'

const fieldStyle = {
  width: '100%',
  maxWidth: '42rem',
  padding: '0.65rem 0.75rem',
  font: 'inherit',
  border: '1px solid #c8cdd3',
  borderRadius: '6px',
}

const labelStyle = {
  display: 'block',
  fontWeight: 600,
  marginBottom: '0.35rem',
  fontSize: '0.9rem',
}

export default function BriefCreatePage() {
  const navigate = useNavigate()
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmitBrief(e) {
    e.preventDefault()
    setError(null)
    const trimmed = brief.trim()
    if (!trimmed) {
      setError('Please enter a client brief before submitting.')
      return
    }

    setLoading(true)
    try {
      const { briefId } = await createBrief(trimmed)
      if (!briefId) {
        setError('Brief was created but the server did not return an id; cannot continue.')
        return
      }
      navigate(`/briefs/${briefId}/ambiguities`, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
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
      </p>

      <h1 style={{ marginTop: 0 }}>New client brief</h1>
      <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
        Paste or type the raw brief below. After it is saved, you will go to the ambiguities
        step for that brief.
      </p>

      <form onSubmit={handleSubmitBrief} style={{ marginBottom: '2rem' }}>
        <label htmlFor="brief" style={labelStyle}>
          Client brief
        </label>
        <textarea
          id="brief"
          name="brief"
          rows={12}
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Unstructured client brief…"
          autoComplete="off"
          style={{ ...fieldStyle, resize: 'vertical', minHeight: '10rem' }}
          disabled={loading}
        />
        <div style={{ marginTop: '0.75rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              font: 'inherit',
              fontWeight: 600,
              border: 'none',
              borderRadius: '6px',
              background: loading ? '#94a3b8' : '#1d4ed8',
              color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Saving…' : 'Submit brief'}
          </button>
        </div>
      </form>

      {error && (
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
          {error}
        </p>
      )}
    </main>
  )
}
