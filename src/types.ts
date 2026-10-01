export type RiskSegment = 'Low' | 'Medium' | 'High'

export interface CustomerInput {
  gender: string
  SeniorCitizen: number
  Partner: string
  Dependents: string
  tenure: number
  PhoneService: string
  MultipleLines: string
  InternetService: string
  OnlineSecurity: string
  OnlineBackup: string
  DeviceProtection: string
  TechSupport: string
  StreamingTV: string
  StreamingMovies: string
  Contract: string
  PaperlessBilling: string
  PaymentMethod: string
  MonthlyCharges: number
  TotalCharges: number
}

export interface FeatureContribution {
  feature: string
  value: number
}

export interface Prediction {
  probability: number
  churn: boolean
  segment: RiskSegment
  segmentFromBackend: boolean
  shap: FeatureContribution[]
  lime: FeatureContribution[]
  recommendations: string[]
  raw: unknown
}

export interface HistoryEntry {
  id: string
  timestamp: string
  input: CustomerInput
  result: Prediction
}

export interface BatchRow {
  id: string
  probability: number
  segment: RiskSegment
  churn: boolean
}

export interface BatchResult {
  rows: BatchRow[]
  total: number
  high: number
  medium: number
  low: number
}

export interface Evaluation {
  metrics: { name: string; value: number }[]
  confusion: number[][] | null
  featureImportance: FeatureContribution[]
}
