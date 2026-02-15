import { useParams, Link } from 'react-router-dom'
import { useState, useMemo, useCallback } from 'react'
import { getTopic, getVisualization } from '../../data/topics'
import useSimulation from '../../hooks/useSimulation'
import ParamControls from '../../components/ParamControls/ParamControls'
import MetricsPanel from '../../components/MetricsPanel/MetricsPanel'
import SimulationCanvas from '../../components/SimulationCanvas/SimulationCanvas'
import ChartPanel from '../../components/ChartPanel/ChartPanel'
import styles from './Visualization.module.css'

const SPEEDS = [1, 2, 5, 10]

export default function Visualization() {
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

  // Stable params object for useSimulation
  const stableParams = useMemo(() => ({ ...paramValues }), [paramValues])

  const {
    snapshot, history, waitTimes, analytical,
    running, speed, setSpeed, play, pause, reset,
  } = useSimulation(vizConfig, stableParams)

  if (!topic || !vizConfig) {
    return (
      <div className={styles.page}>
        <p>Visualization not found. <Link to="/">Go home</Link></p>
      </div>
    )
  }

  const numServers = paramValues.c || 1
  const capacity = paramValues.K || Infinity

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

      <SimulationCanvas
        snapshot={snapshot}
        numServers={numServers}
        capacity={capacity}
      />

      <div className={styles.grid}>
        <div className={styles.sidebar}>
          <ParamControls
            paramDefs={vizConfig.params}
            values={paramValues}
            onChange={handleParamChange}
          />
          <MetricsPanel analytical={analytical} snapshot={snapshot} />
        </div>
        <div className={styles.charts}>
          <ChartPanel
            history={history}
            waitTimes={waitTimes}
            analytical={analytical}
          />
        </div>
      </div>
    </div>
  )
}
