import styles from './MetricsPanel.module.css'

const metricDefs = [
  { key: 'rho', label: 'ρ (Utilization)', simKey: 'serverUtil' },
  { key: 'L', label: 'L (Avg in System)', simKey: 'avgSystemLength' },
  { key: 'Lq', label: 'Lq (Avg in Queue)', simKey: 'avgQueueLength' },
  { key: 'W', label: 'W (Avg Time in System)', simKey: 'avgSystem' },
  { key: 'Wq', label: 'Wq (Avg Wait Time)', simKey: 'avgWait' },
]

export default function MetricsPanel({ analytical, snapshot }) {
  if (!analytical) return null

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.colLabel}>Metric</span>
        <span className={styles.colLabel}>Analytical</span>
        <span className={styles.colLabel}>Simulated</span>
      </div>
      {metricDefs.map((m) => {
        const aVal = analytical[m.key]
        const sVal = snapshot ? snapshot[m.simKey] : null
        return (
          <div key={m.key} className={styles.row}>
            <span className={styles.metricLabel}>{m.label}</span>
            <span className={styles.metricValue}>
              {aVal === Infinity ? '∞' : aVal != null ? fmt(aVal) : '—'}
            </span>
            <span className={styles.metricValue}>
              {sVal != null ? fmt(sVal) : '—'}
            </span>
          </div>
        )
      })}
      {analytical.warning && (
        <div className={styles.warning}>{analytical.warning}</div>
      )}
      {snapshot && (
        <div className={styles.stats}>
          <span>Served: {snapshot.served}</span>
          {snapshot.rejected > 0 && <span>Rejected: {snapshot.rejected}</span>}
          <span>Clock: {fmt(snapshot.clock)}s</span>
        </div>
      )}
    </div>
  )
}

function fmt(v) {
  if (typeof v !== 'number') return v
  return v.toFixed(4)
}
