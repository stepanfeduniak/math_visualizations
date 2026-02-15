import { useState } from 'react'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import styles from './ChartPanel.module.css'

const TABS = [
  { key: 'queue', label: 'Queue Length' },
  { key: 'wait', label: 'Wait Times' },
  { key: 'prob', label: 'P(n)' },
]

export default function ChartPanel({ history, waitTimes, analytical }) {
  const [tab, setTab] = useState('queue')

  return (
    <div className={styles.panel}>
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`${styles.tab} ${tab === t.key ? styles.activeTab : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.chartArea}>
        {tab === 'queue' && <QueueChart history={history} />}
        {tab === 'wait' && <WaitChart waitTimes={waitTimes} />}
        {tab === 'prob' && <ProbChart analytical={analytical} />}
      </div>
    </div>
  )
}

function QueueChart({ history }) {
  // Downsample for performance
  const data = history.length > 200
    ? history.filter((_, i) => i % Math.ceil(history.length / 200) === 0)
    : history

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 11 }}
          label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fontSize: 11 }}
        />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          formatter={(v) => [v, '']}
        />
        <Line
          type="stepAfter"
          dataKey="queueLength"
          name="Queue"
          stroke="#0d9488"
          strokeWidth={1.5}
          dot={false}
        />
        <Line
          type="stepAfter"
          dataKey="systemLength"
          name="System"
          stroke="#d97706"
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function WaitChart({ waitTimes }) {
  if (!waitTimes || waitTimes.length === 0) {
    return <div className={styles.empty}>Waiting for data...</div>
  }

  // Create histogram bins
  const max = Math.max(...waitTimes)
  const numBins = Math.min(20, Math.max(5, Math.ceil(Math.sqrt(waitTimes.length))))
  const binWidth = max / numBins || 1

  const bins = Array.from({ length: numBins }, (_, i) => ({
    range: `${(i * binWidth).toFixed(2)}`,
    count: 0,
  }))

  for (const w of waitTimes) {
    const idx = Math.min(Math.floor(w / binWidth), numBins - 1)
    bins[idx].count++
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={bins}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
        <XAxis dataKey="range" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Bar dataKey="count" fill="#0d9488" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function ProbChart({ analytical }) {
  if (!analytical?.probabilities) {
    return <div className={styles.empty}>No steady-state data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={analytical.probabilities}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
        <XAxis
          dataKey="n"
          tick={{ fontSize: 11 }}
          label={{ value: 'n', position: 'insideBottom', offset: -5, fontSize: 11 }}
        />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          formatter={(v) => [v.toFixed(4), 'P(n)']}
        />
        <Bar dataKey="probability" name="P(n)" fill="#6366f1" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
