import { useCallback, useEffect, useState } from 'react'
import { Activity, ChartLine, FileSpreadsheet, LayoutDashboard, Lightbulb, UserSearch, Wifi, WifiOff } from 'lucide-react'
import { API_URL, checkHealth } from './api'
import type { CustomerInput, HistoryEntry, Prediction } from './types'
import Dashboard from './components/Dashboard'
import PredictView from './components/PredictView'
import BatchView from './components/BatchView'
import EvaluationView from './components/EvaluationView'
import RetentionView from './components/RetentionView'
import './App.css'

type View = 'dashboard' | 'predict' | 'batch' | 'evaluation' | 'retention'

const NAV: { id: View; label: string; icon: typeof Activity; blurb: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, blurb: 'Session summary of every customer you have scored.' },
  { id: 'predict', label: 'Predict', icon: UserSearch, blurb: 'Score one customer and inspect the explanation.' },
  { id: 'batch', label: 'Batch CSV', icon: FileSpreadsheet, blurb: 'Upload a CSV to score many customers at once.' },
  { id: 'evaluation', label: 'Evaluation', icon: ChartLine, blurb: 'How the model performs on its evaluation set.' },
  { id: 'retention', label: 'Retention', icon: Lightbulb, blurb: 'Suggested actions for at-risk customers.' },
]

const HISTORY_KEY = 'churniq-history'

function loadHistory(): HistoryEntry[] {
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY)
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : []
  } catch {
    return []
  }
}

export default function App() {
  const [view, setView] = useState<View>('dashboard')
  const [online, setOnline] = useState<boolean | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory)

  const ping = useCallback(async () => setOnline(await checkHealth()), [])

  useEffect(() => {
    ping()
    const t = window.setInterval(ping, 30000)
    return () => window.clearInterval(t)
  }, [ping])

  useEffect(() => {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history.map((h) => ({ ...h, result: { ...h.result, raw: null } }))))
  }, [history])

  function addResult(input: CustomerInput, result: Prediction) {
    setHistory((h) => [{ id: crypto.randomUUID(), timestamp: new Date().toISOString(), input, result }, ...h].slice(0, 50))
  }

  const current = NAV.find((n) => n.id === view)!

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path d="M5 22c4.5 0 5.5-12 10.5-12S21 18 27 18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <circle cx="27" cy="18" r="3" fill="var(--accent)" />
          </svg>
          <span>
            Churn<b>IQ</b>
          </span>
        </div>
        <nav>
          {NAV.map((n) => (
            <button key={n.id} className={view === n.id ? 'active' : ''} onClick={() => setView(n.id)}>
              <n.icon size={18} />
              {n.label}
            </button>
          ))}
        </nav>
        <button className={`status ${online ? 'ok' : online === false ? 'down' : ''}`} onClick={ping} title={API_URL}>
          {online ? <Wifi size={16} /> : <WifiOff size={16} />}
          <span>{online === null ? 'Checking API…' : online ? 'API connected' : 'API offline'}</span>
        </button>
      </aside>

      <main className="main">
        <header className="page-head">
          <h1>{current.label}</h1>
          <p className="muted">{current.blurb}</p>
        </header>
        {online === false && (
          <div className="banner">
            <WifiOff size={16} />
            <span>
              Can't reach the prediction API at <code>{API_URL}</code>. Set <code>VITE_API_URL</code> to your deployed FastAPI
              backend and allow this site's origin in its CORS settings.
            </span>
          </div>
        )}
        <div className="view" key={view}>
          {view === 'dashboard' && <Dashboard history={history} onGoPredict={() => setView('predict')} onClear={() => setHistory([])} />}
          {view === 'predict' && <PredictView latest={history[0] ?? null} onResult={addResult} />}
          {view === 'batch' && <BatchView />}
          {view === 'evaluation' && <EvaluationView />}
          {view === 'retention' && <RetentionView history={history} onGoPredict={() => setView('predict')} />}
        </div>
      </main>
    </div>
  )
}
