import { useState, type FormEvent } from 'react'
import { FileDown, Lightbulb, RefreshCw, TriangleAlert } from 'lucide-react'
import { errorMessage, predict } from '../api'
import { exportPrediction } from '../pdf'
import type { CustomerInput, HistoryEntry, Prediction } from '../types'
import ContributionChart from './ContributionChart'
import { RiskGauge, SegmentBadge } from './Risk'

const DEFAULT_CUSTOMER: CustomerInput = {
  gender: 'Female',
  SeniorCitizen: 0,
  Partner: 'No',
  Dependents: 'No',
  tenure: 4,
  PhoneService: 'Yes',
  MultipleLines: 'No',
  InternetService: 'Fiber optic',
  OnlineSecurity: 'No',
  OnlineBackup: 'No',
  DeviceProtection: 'No',
  TechSupport: 'No',
  StreamingTV: 'Yes',
  StreamingMovies: 'No',
  Contract: 'Month-to-month',
  PaperlessBilling: 'Yes',
  PaymentMethod: 'Electronic check',
  MonthlyCharges: 84.5,
  TotalCharges: 338,
}

const YN = ['Yes', 'No']
const SERVICE = ['Yes', 'No', 'No internet service']

type Field =
  | { key: keyof CustomerInput; label: string; kind: 'select'; options: string[] }
  | { key: keyof CustomerInput; label: string; kind: 'number'; step?: number; min?: number }
  | { key: keyof CustomerInput; label: string; kind: 'senior' }

const GROUPS: { title: string; fields: Field[] }[] = [
  {
    title: 'Profile',
    fields: [
      { key: 'gender', label: 'Gender', kind: 'select', options: ['Female', 'Male'] },
      { key: 'SeniorCitizen', label: 'Senior citizen', kind: 'senior' },
      { key: 'Partner', label: 'Partner', kind: 'select', options: YN },
      { key: 'Dependents', label: 'Dependents', kind: 'select', options: YN },
    ],
  },
  {
    title: 'Account',
    fields: [
      { key: 'tenure', label: 'Tenure (months)', kind: 'number', min: 0 },
      { key: 'Contract', label: 'Contract', kind: 'select', options: ['Month-to-month', 'One year', 'Two year'] },
      { key: 'PaperlessBilling', label: 'Paperless billing', kind: 'select', options: YN },
      {
        key: 'PaymentMethod',
        label: 'Payment method',
        kind: 'select',
        options: ['Electronic check', 'Mailed check', 'Bank transfer (automatic)', 'Credit card (automatic)'],
      },
      { key: 'MonthlyCharges', label: 'Monthly charges', kind: 'number', step: 0.01, min: 0 },
      { key: 'TotalCharges', label: 'Total charges', kind: 'number', step: 0.01, min: 0 },
    ],
  },
  {
    title: 'Services',
    fields: [
      { key: 'PhoneService', label: 'Phone service', kind: 'select', options: YN },
      { key: 'MultipleLines', label: 'Multiple lines', kind: 'select', options: ['Yes', 'No', 'No phone service'] },
      { key: 'InternetService', label: 'Internet', kind: 'select', options: ['DSL', 'Fiber optic', 'No'] },
      { key: 'OnlineSecurity', label: 'Online security', kind: 'select', options: SERVICE },
      { key: 'OnlineBackup', label: 'Online backup', kind: 'select', options: SERVICE },
      { key: 'DeviceProtection', label: 'Device protection', kind: 'select', options: SERVICE },
      { key: 'TechSupport', label: 'Tech support', kind: 'select', options: SERVICE },
      { key: 'StreamingTV', label: 'Streaming TV', kind: 'select', options: SERVICE },
      { key: 'StreamingMovies', label: 'Streaming movies', kind: 'select', options: SERVICE },
    ],
  },
]

interface Props {
  latest: HistoryEntry | null
  onResult: (input: CustomerInput, result: Prediction) => void
}

export default function PredictView({ latest, onResult }: Props) {
  const [form, setForm] = useState<CustomerInput>(latest?.input ?? DEFAULT_CUSTOMER)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [explainTab, setExplainTab] = useState<'shap' | 'lime'>('shap')

  const set = (key: keyof CustomerInput, value: string | number) => setForm((f) => ({ ...f, [key]: value }))

  async function submit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      onResult(form, await predict(form))
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const result = latest?.result
  const explanation = result ? (explainTab === 'shap' ? result.shap : result.lime) : []

  return (
    <div className="split">
      <form className="card form-card" onSubmit={submit}>
        {GROUPS.map((g) => (
          <fieldset key={g.title}>
            <legend>{g.title}</legend>
            <div className="field-grid">
              {g.fields.map((f) => (
                <label key={f.key} className="field">
                  <span>{f.label}</span>
                  {f.kind === 'select' ? (
                    <select value={String(form[f.key])} onChange={(e) => set(f.key, e.target.value)}>
                      {f.options.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  ) : f.kind === 'senior' ? (
                    <select value={form.SeniorCitizen} onChange={(e) => set('SeniorCitizen', Number(e.target.value))}>
                      <option value={0}>No</option>
                      <option value={1}>Yes</option>
                    </select>
                  ) : (
                    <input
                      type="number"
                      required
                      min={f.min}
                      step={f.step ?? 1}
                      value={form[f.key] as number}
                      onChange={(e) => set(f.key, e.target.value === '' ? 0 : Number(e.target.value))}
                    />
                  )}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={() => setForm(DEFAULT_CUSTOMER)}>
            Reset
          </button>
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? <RefreshCw size={16} className="spin" /> : null}
            {loading ? 'Scoring…' : 'Predict churn risk'}
          </button>
        </div>
        {error && (
          <p className="alert" role="alert">
            <TriangleAlert size={16} /> {error}
          </p>
        )}
      </form>

      <section className="result-col" aria-live="polite">
        {!result ? (
          <div className="card empty">
            <p className="eyebrow">Awaiting input</p>
            <h3>Score a customer to see their risk, the reasons behind it, and what to do next.</h3>
          </div>
        ) : (
          <>
            <div className="card result-card">
              <div className="result-head">
                <div>
                  <p className="eyebrow">Churn probability</p>
                  <SegmentBadge segment={result.segment} />
                  <p className="muted small">
                    {result.churn ? 'Model predicts this customer is likely to churn.' : 'Model predicts this customer is likely to stay.'}
                    {!result.segmentFromBackend && ' Segment derived locally (≥60% high, ≥30% medium).'}
                  </p>
                </div>
                <RiskGauge probability={result.probability} segment={result.segment} />
              </div>
              <button className="btn ghost" onClick={() => latest && exportPrediction(latest.input, result)}>
                <FileDown size={16} /> Export PDF
              </button>
            </div>

            <div className="card">
              <div className="card-head">
                <h3>Why this score</h3>
                <div className="tabs" role="tablist">
                  {(['shap', 'lime'] as const).map((t) => (
                    <button
                      key={t}
                      role="tab"
                      aria-selected={explainTab === t}
                      className={explainTab === t ? 'active' : ''}
                      onClick={() => setExplainTab(t)}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              {explanation.length ? (
                <>
                  <ContributionChart data={explanation} />
                  <p className="muted small">
                    Red bars push the estimate toward churn, green bars away from it. This describes model behaviour, not cause and effect.
                  </p>
                </>
              ) : (
                <p className="muted">The backend did not return a {explainTab.toUpperCase()} explanation for this prediction.</p>
              )}
            </div>

            {result.recommendations.length > 0 && (
              <div className="card">
                <h3>
                  <Lightbulb size={18} /> Suggested retention actions
                </h3>
                <ul className="reco-list">
                  {result.recommendations.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
