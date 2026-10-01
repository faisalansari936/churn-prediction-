import { useState, type ChangeEvent } from 'react'
import { FileDown, FileSpreadsheet, RefreshCw, TriangleAlert, Upload } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { errorMessage, predictCsv } from '../api'
import { exportBatch } from '../pdf'
import type { BatchResult, RiskSegment } from '../types'
import { SegmentBadge } from './Risk'

const SEG_COLORS: Record<RiskSegment, string> = { High: 'var(--high)', Medium: 'var(--medium)', Low: 'var(--low)' }

export default function BatchView() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<BatchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<RiskSegment | 'All'>('All')

  function choose(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setError(null)
    if (f && !f.name.toLowerCase().endsWith('.csv')) {
      setError('Please choose a .csv file.')
      setFile(null)
      return
    }
    setFile(f)
  }

  async function run() {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      setResult(await predictCsv(file))
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const pie = result
    ? (['High', 'Medium', 'Low'] as const).map((s) => ({ name: s, value: result[s.toLowerCase() as 'high' | 'medium' | 'low'] }))
    : []
  const rows = result ? result.rows.filter((r) => filter === 'All' || r.segment === filter) : []

  return (
    <div className="stack">
      <div className="card upload-card">
        <label className="dropzone">
          <input type="file" accept=".csv,text/csv" onChange={choose} />
          <FileSpreadsheet size={28} />
          <span>{file ? file.name : 'Choose a CSV of customers'}</span>
          <small className="muted">Columns should match the features used by the model. Use synthetic or approved data only.</small>
        </label>
        <button className="btn primary" disabled={!file || loading} onClick={run}>
          {loading ? <RefreshCw size={16} className="spin" /> : <Upload size={16} />}
          {loading ? 'Processing…' : 'Run batch prediction'}
        </button>
        {error && (
          <p className="alert" role="alert">
            <TriangleAlert size={16} /> {error}
          </p>
        )}
      </div>

      {result && (
        <div className="split batch-split">
          <div className="card">
            <h3>Risk mix</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2} stroke="none">
                  {pie.map((p) => (
                    <Cell key={p.name} fill={SEG_COLORS[p.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <dl className="mini-stats">
              <div>
                <dt>Total</dt>
                <dd>{result.total}</dd>
              </div>
              {pie.map((p) => (
                <div key={p.name}>
                  <dt>{p.name}</dt>
                  <dd style={{ color: SEG_COLORS[p.name] }}>{p.value}</dd>
                </div>
              ))}
            </dl>
            <button className="btn ghost" onClick={() => exportBatch(result)}>
              <FileDown size={16} /> Export PDF
            </button>
          </div>
          <div className="card">
            <div className="card-head">
              <h3>Customers</h3>
              <div className="tabs">
                {(['All', 'High', 'Medium', 'Low'] as const).map((s) => (
                  <button key={s} className={filter === s ? 'active' : ''} onClick={() => setFilter(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Probability</th>
                    <th>Segment</th>
                    <th>Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td className="mono">{r.id}</td>
                      <td className="mono">{(r.probability * 100).toFixed(1)}%</td>
                      <td>
                        <SegmentBadge segment={r.segment} />
                      </td>
                      <td>{r.churn ? 'Churn' : 'Stay'}</td>
                    </tr>
                  ))}
                  {!rows.length && (
                    <tr>
                      <td colSpan={4} className="muted">
                        No customers in this segment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
