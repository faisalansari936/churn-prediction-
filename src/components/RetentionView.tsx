import { useState } from 'react'
import { Lightbulb, RefreshCw, TriangleAlert } from 'lucide-react'
import { errorMessage, getRetention } from '../api'
import type { HistoryEntry } from '../types'
import { SegmentBadge } from './Risk'

interface Props {
  history: HistoryEntry[]
  onGoPredict: () => void
}

export default function RetentionView({ history, onGoPredict }: Props) {
  const [selected, setSelected] = useState<string | null>(history[0]?.id ?? null)
  const [recos, setRecos] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const entry = history.find((h) => h.id === selected) ?? null

  async function fetchFor(h: HistoryEntry) {
    setLoading(true)
    setError(null)
    try {
      const list = await getRetention(h.input, h.result)
      setRecos((r) => ({ ...r, [h.id]: list }))
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (!history.length) {
    return (
      <div className="card empty">
        <p className="eyebrow">No customers yet</p>
        <h3>Retention suggestions are generated for customers you have scored this session.</h3>
        <button className="btn primary" onClick={onGoPredict}>
          Score a customer
        </button>
      </div>
    )
  }

  const shown = entry ? (recos[entry.id] ?? (entry.result.recommendations.length ? entry.result.recommendations : null)) : null

  return (
    <div className="split">
      <div className="card">
        <h3>Scored customers</h3>
        <ul className="pick-list">
          {history.map((h) => (
            <li key={h.id}>
              <button className={h.id === selected ? 'active' : ''} onClick={() => setSelected(h.id)}>
                <span className="mono">{(h.result.probability * 100).toFixed(1)}%</span>
                <span>
                  {h.input.Contract} · {h.input.tenure} mo
                </span>
                <SegmentBadge segment={h.result.segment} />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="card">
        <div className="card-head">
          <h3>
            <Lightbulb size={18} /> Recommended actions
          </h3>
          {entry && (
            <button className="btn ghost" onClick={() => fetchFor(entry)} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spin' : ''} /> {shown ? 'Refresh' : 'Get suggestions'}
            </button>
          )}
        </div>
        {error && (
          <p className="alert" role="alert">
            <TriangleAlert size={16} /> {error}
          </p>
        )}
        {shown && shown.length ? (
          <ol className="reco-list numbered">
            {shown.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
        ) : (
          <p className="muted">{shown ? 'The backend returned no suggestions for this customer.' : 'Request suggestions from the retention service.'}</p>
        )}
        <p className="muted small">Review each action for suitability and fairness before contacting the customer.</p>
      </div>
    </div>
  )
}
