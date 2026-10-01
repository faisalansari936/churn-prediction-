import { useEffect, useState } from 'react'
import { FileDown, RefreshCw, TriangleAlert } from 'lucide-react'
import { errorMessage, evaluate } from '../api'
import { exportEvaluation } from '../pdf'
import type { Evaluation } from '../types'
import ContributionChart from './ContributionChart'

export default function EvaluationView() {
  const [data, setData] = useState<Evaluation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setData(await evaluate())
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const cmLabels = ['Stay', 'Churn']

  return (
    <div className="stack">
      <div className="toolbar">
        <p className="muted">Metrics come from the backend's evaluation set. Accuracy alone can mislead when classes are imbalanced.</p>
        <div className="toolbar-actions">
          <button className="btn ghost" onClick={load} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
          </button>
          {data && (
            <button className="btn primary" onClick={() => exportEvaluation(data)}>
              <FileDown size={16} /> Export PDF
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="alert" role="alert">
          <TriangleAlert size={16} /> {error}
        </p>
      )}

      {data && (
        <>
          <div className="metric-row">
            {data.metrics.length ? (
              data.metrics.map((m) => (
                <div key={m.name} className="card metric">
                  <span className="eyebrow">{m.name}</span>
                  <strong>{m.value.toFixed(3)}</strong>
                  <div className="meter">
                    <span style={{ width: `${Math.min(100, m.value * 100)}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <p className="muted">No metrics were returned.</p>
            )}
          </div>
          <div className="split">
            {data.confusion && (
              <div className="card">
                <h3>Confusion matrix</h3>
                <div className="cm">
                  <span />
                  {cmLabels.map((l) => (
                    <span key={l} className="cm-label">
                      Pred. {l}
                    </span>
                  ))}
                  {data.confusion.map((row, i) => (
                    <div className="cm-row" key={i}>
                      <span className="cm-label">Actual {cmLabels[i] ?? i}</span>
                      {row.map((v, j) => (
                        <span key={j} className={`cm-cell ${i === j ? 'diag' : 'off'}`}>
                          {v}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.featureImportance.length > 0 && (
              <div className="card">
                <h3>Global feature importance</h3>
                <ContributionChart data={data.featureImportance} signed={false} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
