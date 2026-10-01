import axios from 'axios'
import type {
  BatchResult,
  BatchRow,
  CustomerInput,
  Evaluation,
  FeatureContribution,
  Prediction,
  RiskSegment,
} from './types'

// Set VITE_API_URL in the Netlify environment to point at the deployed FastAPI backend.
export const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:8000'

const client = axios.create({ baseURL: API_URL, timeout: 30000 })

type Obj = Record<string, unknown>

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)

function pick(o: Obj, keys: string[]): unknown {
  for (const k of keys) if (o[k] !== undefined && o[k] !== null) return o[k]
  return undefined
}

function toNumber(v: unknown): number | undefined {
  const n = typeof v === 'string' ? parseFloat(v) : typeof v === 'number' ? v : NaN
  return Number.isFinite(n) ? n : undefined
}

function toProbability(v: unknown): number {
  const n = toNumber(v) ?? 0
  return n > 1 ? n / 100 : n
}

// Fallback thresholds, used only when the backend does not return a segment.
export function segmentFor(p: number): RiskSegment {
  if (p >= 0.6) return 'High'
  if (p >= 0.3) return 'Medium'
  return 'Low'
}

function toSegment(v: unknown): RiskSegment | undefined {
  if (typeof v !== 'string') return undefined
  const s = v.toLowerCase()
  if (s.includes('high')) return 'High'
  if (s.includes('med')) return 'Medium'
  if (s.includes('low')) return 'Low'
  return undefined
}

// Accepts {feature: value}, [{feature, value}], [[feature, value]] and similar shapes.
function toContributions(v: unknown): FeatureContribution[] {
  if (!v) return []
  let list: FeatureContribution[] = []
  if (Array.isArray(v)) {
    list = v.flatMap((item): FeatureContribution[] => {
      if (Array.isArray(item) && item.length >= 2) {
        const n = toNumber(item[1])
        return n === undefined ? [] : [{ feature: String(item[0]), value: n }]
      }
      if (isObj(item)) {
        const feature = pick(item, ['feature', 'name', 'feature_name', 'label'])
        const n = toNumber(pick(item, ['value', 'shap_value', 'contribution', 'weight', 'importance', 'impact']))
        return feature === undefined || n === undefined ? [] : [{ feature: String(feature), value: n }]
      }
      return []
    })
  } else if (isObj(v)) {
    const nested = pick(v, ['values', 'contributions', 'features', 'explanation'])
    if (nested) return toContributions(nested)
    list = Object.entries(v).flatMap(([feature, val]) => {
      const n = toNumber(val)
      return n === undefined ? [] : [{ feature, value: n }]
    })
  }
  return list.sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, 12)
}

function toStrings(v: unknown): string[] {
  if (!v) return []
  if (typeof v === 'string') return [v]
  if (Array.isArray(v)) {
    return v.flatMap((item) => {
      if (typeof item === 'string') return [item]
      if (isObj(item)) {
        const title = pick(item, ['action', 'title', 'recommendation', 'text', 'message'])
        const detail = pick(item, ['reason', 'description', 'detail'])
        if (title) return [detail ? `${title} — ${detail}` : String(title)]
      }
      return []
    })
  }
  if (isObj(v)) return toStrings(pick(v, ['recommendations', 'actions', 'suggestions']))
  return []
}

export function normalizePrediction(data: unknown): Prediction {
  const o = isObj(data) ? data : {}
  const body = isObj(o.result) ? o.result : isObj(o.prediction) ? o.prediction : o
  const probability = toProbability(
    pick(body, ['churn_probability', 'probability', 'churn_risk', 'risk_score', 'score', 'prob']) ??
      (typeof body.prediction === 'number' && body.prediction <= 1 ? body.prediction : undefined),
  )
  const backendSegment = toSegment(pick(body, ['risk_segment', 'risk_level', 'segment', 'risk_category', 'risk']))
  const churnValue = pick(body, ['churn', 'will_churn', 'prediction', 'label'])
  const churn =
    typeof churnValue === 'boolean'
      ? churnValue
      : typeof churnValue === 'string'
        ? /yes|churn|1|true/i.test(churnValue) && !/no/i.test(churnValue)
        : typeof churnValue === 'number'
          ? churnValue >= 0.5
          : probability >= 0.5
  const explanation = isObj(body.explanation) ? body.explanation : isObj(body.explanations) ? body.explanations : {}
  return {
    probability,
    churn,
    segment: backendSegment ?? segmentFor(probability),
    segmentFromBackend: Boolean(backendSegment),
    shap: toContributions(pick(body, ['shap', 'shap_values', 'shap_explanation']) ?? pick(explanation, ['shap', 'shap_values'])),
    lime: toContributions(pick(body, ['lime', 'lime_explanation', 'lime_values']) ?? pick(explanation, ['lime'])),
    recommendations: toStrings(pick(body, ['recommendations', 'retention_recommendations', 'retention', 'actions'])),
    raw: data,
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await client.get('/health', { timeout: 6000 })
    return res.status >= 200 && res.status < 300
  } catch {
    return false
  }
}

export async function predict(input: CustomerInput): Promise<Prediction> {
  const res = await client.post('/predict', input)
  return normalizePrediction(res.data)
}

export async function getRetention(input: CustomerInput, prediction?: Prediction): Promise<string[]> {
  const res = await client.post('/retention-recommendations', {
    ...input,
    churn_probability: prediction?.probability,
    risk_segment: prediction?.segment,
  })
  return toStrings(res.data)
}

export async function predictCsv(file: File): Promise<BatchResult> {
  const form = new FormData()
  form.append('file', file)
  const res = await client.post('/predict-csv', form)
  const data: unknown = res.data
  const o = isObj(data) ? data : {}
  const list = Array.isArray(data) ? data : (pick(o, ['predictions', 'results', 'rows', 'customers']) as unknown)
  const rows: BatchRow[] = (Array.isArray(list) ? list : []).map((item, i) => {
    const r = isObj(item) ? item : {}
    const p = normalizePrediction(r)
    const id = pick(r, ['customerID', 'customer_id', 'id', 'CustomerID'])
    return { id: id !== undefined ? String(id) : `Row ${i + 1}`, probability: p.probability, segment: p.segment, churn: p.churn }
  })
  const summary = isObj(o.summary) ? o.summary : o
  const count = (seg: RiskSegment, keys: string[]) =>
    toNumber(pick(summary, keys)) ?? rows.filter((r) => r.segment === seg).length
  return {
    rows,
    total: toNumber(pick(summary, ['total', 'total_customers', 'count'])) ?? rows.length,
    high: count('High', ['high', 'high_risk', 'High']),
    medium: count('Medium', ['medium', 'medium_risk', 'Medium']),
    low: count('Low', ['low', 'low_risk', 'Low']),
  }
}

export async function evaluate(): Promise<Evaluation> {
  const res = await client.get('/evaluate')
  const o = isObj(res.data) ? res.data : {}
  const metricsSrc = isObj(o.metrics) ? o.metrics : o
  const metricKeys = ['accuracy', 'precision', 'recall', 'f1', 'f1_score', 'roc_auc', 'auc', 'pr_auc']
  const metrics = metricKeys.flatMap((k) => {
    const n = toNumber(metricsSrc[k])
    return n === undefined ? [] : [{ name: k.replace(/_/g, ' ').toUpperCase().replace('SCORE', '').trim(), value: n > 1 ? n / 100 : n }]
  })
  const cm = pick(o, ['confusion_matrix', 'confusion']) ?? pick(metricsSrc, ['confusion_matrix'])
  const confusion =
    Array.isArray(cm) && cm.every((row) => Array.isArray(row)) ? (cm as unknown[][]).map((row) => row.map((c) => toNumber(c) ?? 0)) : null
  return {
    metrics,
    confusion,
    featureImportance: toContributions(pick(o, ['feature_importance', 'feature_importances', 'importances'])),
  }
}

export function errorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return `Could not reach the API at ${API_URL}. Check that the backend is running and CORS allows this site.`
    const detail = isObj(err.response.data) ? err.response.data.detail : undefined
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) return detail.map((d) => (isObj(d) ? String(d.msg ?? '') : String(d))).join('; ')
    return `Request failed with status ${err.response.status}.`
  }
  return err instanceof Error ? err.message : 'Unexpected error.'
}
