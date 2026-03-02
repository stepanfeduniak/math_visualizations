import { useParams, Link } from 'react-router-dom'
import { useState, useMemo, useCallback } from 'react'
import { getTopic, getVisualization } from '../../data/topics'
import useControlSimulation from '../../hooks/useControlSimulation'
import ParamControls from '../../components/ParamControls/ParamControls'
import ControlMetricsPanel from '../../components/ControlMetricsPanel/ControlMetricsPanel'
import TimeResponseChart from '../../components/TimeResponseChart/TimeResponseChart'
import PhasePortrait from '../../components/PhasePortrait/PhasePortrait'
import SpringMassDamperCanvas from '../../components/SpringMassDamperCanvas/SpringMassDamperCanvas'
import styles from './ControlVisualization.module.css'

const SPEEDS = [1, 2, 5, 10]

export default function ControlVisualization() {
  const { topicSlug, vizSlug } = useParams()
  const topic = getTopic(topicSlug)
  const vizConfig = getVisualization(topicSlug, vizSlug)

  const [paramValues, setParamValues] = useState(() => {
    if (!vizConfig) return {}
    return Object.fromEntries(vizConfig.params.map(p => [p.key, p.default]))
  })

  const handleParamChange = useCallback((key, value) => {
    setParamValues(prev => ({ ...prev, [key]: value }))
  }, [])

  const stableParams = useMemo(() => ({ ...paramValues }), [paramValues])

  const {
    snapshot, history, analytical,
    running, speed, setSpeed, play, pause, reset,
  } = useControlSimulation(vizConfig, stableParams)

  if (!topic || !vizConfig) {
    return (
      <div className={styles.page}>
        <p>Visualization not found. <Link to="/">Go home</Link></p>
      </div>
    )
  }

  const chartConfigs = vizConfig.chartConfigs || []
  const phaseConfig = vizConfig.phasePortrait || null
  const hasCanvas = vizConfig.canvas === 'spring-mass-damper'

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to={`/${topicSlug}`} className={styles.back}>&larr; {topic.title}</Link>
        <h1>{vizConfig.title}</h1>
        <p className={styles.desc}>{vizConfig.description}</p>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.playControls}>
          <button className={styles.btn} onClick={running ? pause : play}>
            {running ? 'Pause' : 'Play'}
          </button>
          <button className={styles.btnSecondary} onClick={reset}>Reset</button>
        </div>
        <div className={styles.speedControls}>
          {SPEEDS.map(s => (
            <button
              key={s}
              className={`${styles.speedBtn} ${speed === s ? styles.speedActive : ''}`}
              onClick={() => setSpeed(s)}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {hasCanvas && <SpringMassDamperCanvas snapshot={snapshot} />}

      <div className={styles.grid}>
        <div className={styles.sidebar}>
          <ParamControls
            paramDefs={vizConfig.params}
            values={paramValues}
            onChange={handleParamChange}
          />
          <ControlMetricsPanel analytical={analytical} snapshot={snapshot} />
        </div>
        <div className={styles.charts}>
          {chartConfigs.map((config, i) => (
            <TimeResponseChart key={i} history={history} config={config} />
          ))}
          {phaseConfig && (
            <PhasePortrait history={history} config={phaseConfig} />
          )}
        </div>
      </div>
    </div>
  )
}
