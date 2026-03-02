import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import styles from './TimeResponseChart.module.css'

const CHART_COLORS = ['#0d9488', '#d97706', '#6366f1', '#e11d48']

/**
 * Data-driven time-domain line chart.
 * @param {object} props
 * @param {object[]} props.history - array of snapshot objects
 * @param {object} props.config - { title, lines: [{ dataKey, label, reference? }] }
 */
export default function TimeResponseChart({ history, config }) {
  // Downsample for performance
  const data = history.length > 300
    ? history.filter((_, i) => i % Math.ceil(history.length / 300) === 0)
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
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => v.toFixed(1)}
            label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fontSize: 11 }}
          />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
            labelFormatter={(v) => `t = ${Number(v).toFixed(2)}s`}
            formatter={(v, name) => [Number(v).toFixed(4), name]}
          />
          {config.lines.map((line, i) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.label}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={1.5}
              dot={false}
            />
          ))}
          {config.lines
            .filter(l => l.reference != null)
            .map(l => (
              <ReferenceLine
                key={`ref-${l.dataKey}`}
                y={l.reference}
                stroke="#a8a29e"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
