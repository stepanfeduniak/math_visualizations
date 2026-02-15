import styles from './ParamControls.module.css'

export default function ParamControls({ paramDefs, values, onChange }) {
  return (
    <div className={styles.controls}>
      {paramDefs.map((p) => (
        <div key={p.key} className={styles.field}>
          <div className={styles.labelRow}>
            <span className={styles.label}>{p.label}</span>
            <input
              type="number"
              className={styles.numInput}
              value={values[p.key]}
              min={p.min}
              max={p.max}
              step={p.step}
              onChange={(e) => {
                const v = parseFloat(e.target.value)
                if (!isNaN(v)) onChange(p.key, Math.min(p.max, Math.max(p.min, v)))
              }}
            />
          </div>
          <input
            type="range"
            min={p.min}
            max={p.max}
            step={p.step}
            value={values[p.key]}
            onChange={(e) => onChange(p.key, parseFloat(e.target.value))}
          />
        </div>
      ))}
    </div>
  )
}
