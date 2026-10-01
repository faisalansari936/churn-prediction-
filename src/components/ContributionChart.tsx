import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { FeatureContribution } from '../types'

interface Props {
  data: FeatureContribution[]
  signed?: boolean
}

// Horizontal bars; signed values diverge from zero (red raises churn risk, green lowers it).
export default function ContributionChart({ data, signed = true }: Props) {
  const rows = [...data].sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, 10)
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, rows.length * 32 + 24)}>
      <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
        <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--ink-soft)' }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="feature"
          width={140}
          tick={{ fontSize: 12, fill: 'var(--ink)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(22,33,29,0.05)' }}
          formatter={(v) => (typeof v === 'number' ? v.toFixed(4) : String(v))}
          contentStyle={{ borderRadius: 8, border: '1px solid var(--line)', fontSize: 12 }}
        />
        {signed && <ReferenceLine x={0} stroke="var(--ink-soft)" />}
        <Bar dataKey="value" radius={[3, 3, 3, 3]} barSize={16}>
          {rows.map((r) => (
            <Cell key={r.feature} fill={!signed ? 'var(--accent-ink)' : r.value >= 0 ? 'var(--high)' : 'var(--low)'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
