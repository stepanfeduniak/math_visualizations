import { useState, useRef, useCallback, useEffect } from 'react'

export default function useSimulation(vizConfig, params) {
  const [model, setModel] = useState(null)
  const [snapshot, setSnapshot] = useState(null)
  const [history, setHistory] = useState([])
  const [waitTimes, setWaitTimes] = useState([])
  const [running, setRunning] = useState(false)
  const [speed, setSpeed] = useState(1)

  const engineRef = useRef(null)
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
      const engine = model.createSimulation(params)
      engine.start()
      engineRef.current = engine
      setSnapshot(engine.getSnapshot())
      setHistory([])
      setWaitTimes([])
    }
  }, [model, params])

  useEffect(() => {
    reset()
  }, [reset])

  // Animation loop
  const tick = useCallback((timestamp) => {
    if (!engineRef.current) return

    if (lastFrameRef.current === null) {
      lastFrameRef.current = timestamp
    }

    const dt = (timestamp - lastFrameRef.current) / 1000 // seconds
    lastFrameRef.current = timestamp

    // Advance simulation by dt * speed
    const simDt = dt * speed
    engineRef.current.advanceTo(engineRef.current.clock + simDt)

    const snap = engineRef.current.getSnapshot()
    setSnapshot(snap)
    setHistory(engineRef.current.history.slice())
    setWaitTimes(engineRef.current.waitTimes.slice())

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
    waitTimes,
    analytical,
    running,
    speed,
    setSpeed,
    play,
    pause,
    reset,
  }
}
