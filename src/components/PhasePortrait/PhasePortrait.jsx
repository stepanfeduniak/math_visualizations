import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import styles from './PhasePortrait.module.css'

/**
 * Phase portrait (state-space trajectory).
 * @param {object} props
 * @param {object[]} props.history - array of snapshot objects
 * @param {object} props.config - { title, xKey, yKey, xLabel, yLabel }
 */
export default function PhasePortrait({ history, config }) {
  const data = history.length > 400
    ? history.filter((_, i) => i % Math.ceil(history.length / 400) === 0)
    : history

  if (!data.length) {
    return (
      <div className={styles.panel}>
        <h3 className={styles.title}>{config.title}</h3>
        <div className={styles.empty}>Waiting for data...</div>
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>{config.title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis
            dataKey={config.xKey}
            type="number"
            tick={{ fontSize: 11 }}
            name={config.xLabel}
            label={{ value: config.xLabel, position: 'insideBottom', offset: -5, fontSize: 11 }}
          />
          <YAxis
            dataKey={config.yKey}
            type="number"
            tick={{ fontSize: 11 }}
            name={config.yLabel}
            label={{ value: config.yLabel, angle: -90, position: 'insideLeft', offset: 10, fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
            formatter={(v, name) => [Number(v).toFixed(4), name]}
          />
          <Scatter
            data={data}
            fill="#6366f1"
            line={{ stroke: '#6366f1', strokeWidth: 1.5 }}
            lineType="joint"
            isAnimationActive={false}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
