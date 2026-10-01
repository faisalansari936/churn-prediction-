import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import type { BatchResult, CustomerInput, Evaluation, Prediction } from './types'

const pct = (p: number) => `${(p * 100).toFixed(1)}%`

function header(doc: jsPDF, title: string) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('ChurnIQ', 14, 18)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.text(title, 14, 26)
  doc.setFontSize(9)
  doc.setTextColor(110)
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, 32)
  doc.setTextColor(0)
}

function footer(doc: jsPDF) {
  doc.setFontSize(8)
  doc.setTextColor(120)
  doc.text(
    'Model estimates support human review; they are not certainties. Explanations describe model behaviour, not causes.',
    14,
    doc.internal.pageSize.getHeight() - 10,
  )
}

const lastY = (doc: jsPDF) => (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 40

export function exportPrediction(input: CustomerInput, result: Prediction) {
  const doc = new jsPDF()
  header(doc, 'Customer churn prediction report')
  autoTable(doc, {
    startY: 38,
    head: [['Result', 'Value']],
    body: [
      ['Churn probability', pct(result.probability)],
      ['Risk segment', result.segment],
      ['Predicted outcome', result.churn ? 'Likely to churn' : 'Likely to stay'],
    ],
  })
  autoTable(doc, {
    startY: lastY(doc) + 6,
    head: [['Customer attribute', 'Value']],
    body: Object.entries(input).map(([k, v]) => [k, String(v)]),
  })
  if (result.shap.length) {
    autoTable(doc, {
      startY: lastY(doc) + 6,
      head: [['SHAP feature', 'Contribution']],
      body: result.shap.map((c) => [c.feature, c.value.toFixed(4)]),
    })
  }
  if (result.lime.length) {
    autoTable(doc, {
      startY: lastY(doc) + 6,
      head: [['LIME feature', 'Weight']],
      body: result.lime.map((c) => [c.feature, c.value.toFixed(4)]),
    })
  }
  if (result.recommendations.length) {
    autoTable(doc, {
      startY: lastY(doc) + 6,
      head: [['Retention recommendations']],
      body: result.recommendations.map((r) => [r]),
    })
  }
  footer(doc)
  doc.save('churniq-prediction.pdf')
}

export function exportBatch(result: BatchResult) {
  const doc = new jsPDF()
  header(doc, 'Batch churn prediction report')
  autoTable(doc, {
    startY: 38,
    head: [['Total', 'High risk', 'Medium risk', 'Low risk']],
    body: [[result.total, result.high, result.medium, result.low]],
  })
  autoTable(doc, {
    startY: lastY(doc) + 6,
    head: [['Customer', 'Probability', 'Segment', 'Outcome']],
    body: result.rows.map((r) => [r.id, pct(r.probability), r.segment, r.churn ? 'Churn' : 'Stay']),
  })
  footer(doc)
  doc.save('churniq-batch.pdf')
}

export function exportEvaluation(result: Evaluation) {
  const doc = new jsPDF()
  header(doc, 'Model evaluation report')
  autoTable(doc, {
    startY: 38,
    head: [['Metric', 'Value']],
    body: result.metrics.map((m) => [m.name, m.value.toFixed(4)]),
  })
  if (result.confusion) {
    autoTable(doc, {
      startY: lastY(doc) + 6,
      head: [['Confusion matrix', 'Predicted: stay', 'Predicted: churn']],
      body: result.confusion.map((row, i) => [i === 0 ? 'Actual: stay' : 'Actual: churn', ...row.map(String)]),
    })
  }
  if (result.featureImportance.length) {
    autoTable(doc, {
      startY: lastY(doc) + 6,
      head: [['Feature', 'Importance']],
      body: result.featureImportance.map((f) => [f.feature, f.value.toFixed(4)]),
    })
  }
  footer(doc)
  doc.save('churniq-evaluation.pdf')
}
