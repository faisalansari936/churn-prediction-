import type { RiskSegment } from '../types'

export function SegmentBadge({ segment }: { segment: RiskSegment }) {
  return <span className={`badge badge-${segment.toLowerCase()}`}>{segment} risk</span>
}

export function RiskGauge({ probability, segment }: { probability: number; segment: RiskSegment }) {
  const r = 70
  const circ = Math.PI * r
  const pct = Math.min(1, Math.max(0, probability))
  return (
    <div className="gauge" role="img" aria-label={`Churn probability ${(pct * 100).toFixed(1)} percent`}>
      <svg viewBox="0 0 180 104">
        <path d="M20 94 A70 70 0 0 1 160 94" className="gauge-track" />
        <path
          d="M20 94 A70 70 0 0 1 160 94"
          className={`gauge-fill seg-${segment.toLowerCase()}`}
          style={{ strokeDasharray: circ, strokeDashoffset: circ * (1 - pct) }}
        />
      </svg>
      <div className="gauge-value">
        <strong>{(pct * 100).toFixed(1)}</strong>
        <span>%</span>
      </div>
    </div>
  )
}
