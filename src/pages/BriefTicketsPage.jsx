import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchTicketsByBriefId } from '../api/tickets.js'
import './BriefTicketsPage.css'

export default function BriefTicketsPage() {
  const { briefId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tickets, setTickets] = useState([])

  useEffect(() => {
    let cancelled = false
    if (!briefId) {
      setLoading(false)
      setTickets([])
      return
    }

    setLoading(true)
    setError(null)
    fetchTicketsByBriefId(briefId)
      .then((res) => {
        if (!cancelled) setTickets(res.tickets)
      })
      .catch((err) => {
        if (!cancelled) {
          setTickets([])
          setError(err instanceof Error ? err.message : 'Failed to load tickets.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [briefId])

  return (
    <main className="tickets-page">
      <p className="tickets-page__back">
        <Link to="/">Home</Link>
        {' · '}
        <Link to="/briefs/create">New brief</Link>
      </p>

      <h1 className="tickets-page__title">Tickets</h1>
      <p className="tickets-page__meta">Brief <code>{briefId}</code></p>

      {loading && <p className="tickets-page__muted">Loading…</p>}

      {error && (
        <p className="tickets-page__error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && tickets.length === 0 && (
        <p className="tickets-page__muted">No tickets for this brief.</p>
      )}

      <ul className="tickets-list">
        {tickets.map((t) => (
          <li key={t._id} className="ticket">
            <div className="ticket__head">
              <h2 className="ticket__title">{t.title}</h2>
              <span className="ticket__tags">
                <span className="ticket__tag">{t.type}</span>
                <span className="ticket__tag ticket__tag--muted">{t.priority}</span>
                <span className="ticket__tag ticket__tag--muted">{t.status}</span>
              </span>
            </div>
            {t.description && <p className="ticket__desc">{t.description}</p>}
            {Array.isArray(t.acceptanceCriteria) && t.acceptanceCriteria.length > 0 && (
              <div className="ticket__block">
                <h3 className="ticket__label">Acceptance criteria</h3>
                <ul className="ticket__bullets">
                  {t.acceptanceCriteria.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(t.dependencies) && t.dependencies.length > 0 && (
              <div className="ticket__block">
                <h3 className="ticket__label">Dependencies</h3>
                <ul className="ticket__ids">
                  {t.dependencies.map((id, i) => (
                    <li key={i}>
                      <code>{String(id)}</code>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(t.createdAt || t.updatedAt || t.aiMetadata) && (
              <div className="ticket__footer">
                {(t.createdAt || t.updatedAt) && (
                  <p className="ticket__dates">
                    {t.createdAt && (
                      <span>Created {new Date(t.createdAt).toLocaleString()}</span>
                    )}
                    {t.createdAt && t.updatedAt && ' · '}
                    {t.updatedAt && (
                      <span>Updated {new Date(t.updatedAt).toLocaleString()}</span>
                    )}
                  </p>
                )}
                {t.aiMetadata && typeof t.aiMetadata === 'object' && (
                  <p className="ticket__ai">
                    {t.aiMetadata.model && <span>{t.aiMetadata.model}</span>}
                    {t.aiMetadata.promptVersion && (
                      <span> · {t.aiMetadata.promptVersion}</span>
                    )}
                    {t.aiMetadata.generatedAt && (
                      <span>
                        {' '}
                        · {new Date(t.aiMetadata.generatedAt).toLocaleString()}
                      </span>
                    )}
                    {t.aiMetadata.confidenceScore != null && (
                      <span> · score {Number(t.aiMetadata.confidenceScore).toFixed(2)}</span>
                    )}
                  </p>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  )
}
