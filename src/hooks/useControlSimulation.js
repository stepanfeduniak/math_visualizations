import { useState, useRef, useCallback, useEffect } from 'react'
import { rk4Step } from '../simulation/ode'

const HISTORY_INTERVAL = 0.02 // record history every 20ms of sim time
const ODE_DT = 0.005 // fixed integration step (5ms)

export default function useControlSimulation(vizConfig, params) {
  const [model, setModel] = useState(null)
  const [snapshot, setSnapshot] = useState(null)
  const [history, setHistory] = useState([])
  const [running, setRunning] = useState(false)
  const [speed, setSpeed] = useState(1)

  const stateRef = useRef(null) // ODE state vector
  const timeRef = useRef(0)
  const historyRef = useRef([])
  const lastHistoryTimeRef = useRef(0)
  const simRef = useRef(null) // model simulation object
  const rafRef = useRef(null)
  const lastFrameRef = useRef(null)

  // Load model dynamically
  useEffect(() => {
    if (!vizConfig) return
    vizConfig.modelPath().then((mod) => setModel(mod))
  }, [vizConfig])

  // Get analytical results
  const analytical = model ? model.analyticalResults(params) : null

  // Reset simulation when params change
  const reset = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    setRunning(false)
    lastFrameRef.current = null

    if (model) {
      const sim = model.createSimulation(params)
      simRef.current = sim
      stateRef.current = sim.getInitialState()
      timeRef.current = 0
      historyRef.current = []
      lastHistoryTimeRef.current = 0

      const snap = sim.getSnapshot(0, stateRef.current)
      setSnapshot(snap)
      setHistory([])
    }
  }, [model, params])

  useEffect(() => {
    reset()
  }, [reset])

  // Animation loop
  const tick = useCallback((timestamp) => {
    const sim = simRef.current
    if (!sim || !stateRef.current) return

    if (lastFrameRef.current === null) {
      lastFrameRef.current = timestamp
    }

    const wallDt = (timestamp - lastFrameRef.current) / 1000
    lastFrameRef.current = timestamp

    // Advance simulation by wallDt * speed, capped to prevent spiral of death
    const simDt = Math.min(wallDt * speed, 0.1)
    const targetTime = timeRef.current + simDt

    // Integrate using fixed RK4 steps
    while (timeRef.current < targetTime - 1e-12) {
      const step = Math.min(ODE_DT, targetTime - timeRef.current)
      stateRef.current = rk4Step(sim.derivative, timeRef.current, stateRef.current, step)
      timeRef.current += step

      // Record history at intervals
      if (timeRef.current - lastHistoryTimeRef.current >= HISTORY_INTERVAL) {
        const snap = sim.getSnapshot(timeRef.current, stateRef.current)
        historyRef.current.push(snap)
        lastHistoryTimeRef.current = timeRef.current
      }
    }

    const snap = sim.getSnapshot(timeRef.current, stateRef.current)
    setSnapshot(snap)
    setHistory(historyRef.current.slice())

    rafRef.current = requestAnimationFrame(tick)
  }, [speed])

  const play = useCallback(() => {
    if (running) return
    setRunning(true)
    lastFrameRef.current = null
    rafRef.current = requestAnimationFrame(tick)
  }, [running, tick])

  const pause = useCallback(() => {
    setRunning(false)
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Update tick when speed changes while running
  useEffect(() => {
    if (running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lastFrameRef.current = null
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [tick, running])

  return {
    snapshot,
    history,
    analytical,
    running,
    speed,
    setSpeed,
    play,
    pause,
    reset,
  }
}
