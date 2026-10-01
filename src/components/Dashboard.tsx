import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { HistoryEntry } from '../types'
import { SegmentBadge } from './Risk'

interface Props {
  history: HistoryEntry[]
  onGoPredict: () => void
  onClear: () => void
}

export default function Dashboard({ history, onGoPredict, onClear }: Props) {
  const total = history.length
  const avg = total ? history.reduce((s, h) => s + h.result.probability, 0) / total : 0
  const high = history.filter((h) => h.result.segment === 'High').length
  const churners = history.filter((h) => h.result.churn).length
  const series = [...history].reverse().map((h, i) => ({ n: i + 1, p: +(h.result.probability * 100).toFixed(1) }))

  return (
    <div className="stack">
      <div className="hero card">
        <div>
          <p className="eyebrow">Session overview</p>
          <h2>
            {total ? (
              <>
                <em>{high}</em> of {total} scored customers sit in the high-risk band.
              </>
            ) : (
              'Find the customers most likely to leave — and see why.'
            )}
          </h2>
          <p className="muted">Scores are model estimates to support human review, not certainties.</p>
        </div>
        <button className="btn primary" onClick={onGoPredict}>
          New prediction
        </button>
      </div>

      <div className="metric-row">
        {[
          { label: 'Customers scored', value: String(total) },
          { label: 'Average risk', value: `${(avg * 100).toFixed(1)}%` },
          { label: 'High risk', value: String(high) },
          { label: 'Predicted churners', value: String(churners) },
        ].map((m) => (
          <div key={m.label} className="card metric">
            <span className="eyebrow">{m.label}</span>
            <strong>{m.value}</strong>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div className="split">
          <div className="card">
            <h3>Risk across this session</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e8573a" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#e8573a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="n" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => `${v}%`} labelFormatter={(l) => `Prediction #${l}`} />
                <Area type="monotone" dataKey="p" stroke="#e8573a" strokeWidth={2} fill="url(#riskFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div className="card-head">
              <h3>Recent predictions</h3>
              <button className="btn link" onClick={onClear}>
                Clear
              </button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Contract</th>
                    <th>Risk</th>
                    <th>Segment</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 8).map((h) => (
                    <tr key={h.id}>
                      <td className="mono">{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>{h.input.Contract}</td>
                      <td className="mono">{(h.result.probability * 100).toFixed(1)}%</td>
                      <td>
                        <SegmentBadge segment={h.result.segment} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
