import styles from './ControlMetricsPanel.module.css'

/**
 * Data-driven metrics display for control theory visualizations.
 * Iterates over analyticalResults object entries and formats them.
 */
export default function ControlMetricsPanel({ analytical, snapshot }) {
  if (!analytical) return null

  const entries = Object.entries(analytical)

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.colLabel}>Property</span>
        <span className={styles.colLabel}>Value</span>
      </div>
      {entries.map(([key, value]) => (
        <div key={key} className={styles.row}>
          <span className={styles.metricLabel}>{formatKey(key)}</span>
          <span className={styles.metricValue}>{formatValue(value)}</span>
        </div>
      ))}
      {snapshot && (
        <div className={styles.stats}>
          <span>t = {Number(snapshot.time).toFixed(2)}s</span>
        </div>
      )}
    </div>
  )
}

function formatKey(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, c => c.toUpperCase())
    .trim()
}

function formatValue(v) {
  if (v === Infinity) return '∞'
  if (v === -Infinity) return '-∞'
  if (v == null) return '—'
  if (typeof v === 'number') return v.toFixed(4)
  return String(v)
}
