/**
 * Spring-Mass-Damper System (Astrom & Murray Ch 2)
 *
 * m·x'' + b·x' + k·x = F
 *
 * State vector: [position, velocity]
 * Parameters: m (mass), k (spring), b (damping), F (force)
 */

export function createSimulation(params) {
  const { m, k, b, F } = params

  function getInitialState() {
    return [0, 0]
  }

  function derivative(t, state) {
    const [x, v] = state
    // m·x'' = F - b·x' - k·x
    const a = (F - b * v - k * x) / m
    return [v, a]
  }

  function getSnapshot(t, state) {
    const [x, v] = state
    const omega_n = Math.sqrt(k / m)
    const zeta = b / (2 * Math.sqrt(k * m))
    const energy = 0.5 * k * x * x + 0.5 * m * v * v

    return {
      time: t,
      position: x,
      velocity: v,
      energy,
      naturalFreq: omega_n,
      dampingRatio: zeta,
    }
  }

  const stateLabels = ['position', 'velocity']

  return { getInitialState, derivative, getSnapshot, stateLabels }
}

export function analyticalResults(params) {
  const { m, k, b, F } = params

  const omega_n = Math.sqrt(k / m)
  const zeta = b / (2 * Math.sqrt(k * m))
  const steadyState = F / k

  let dampingType
  if (Math.abs(zeta - 1) < 0.01) {
    dampingType = 'Critically Damped'
  } else if (zeta < 1) {
    dampingType = 'Underdamped'
  } else {
    dampingType = 'Overdamped'
  }

  const omega_d = zeta < 1 ? omega_n * Math.sqrt(1 - zeta * zeta) : 0

  return {
    naturalFrequency: omega_n,
    dampingRatio: zeta,
    dampedFrequency: omega_d,
    steadyState,
    dampingType,
  }
}
