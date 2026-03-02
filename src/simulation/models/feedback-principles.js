/**
 * Feedback Principles (Astrom & Murray Ch 1)
 *
 * First-order plant G(s) = 1/(τs + 1).
 * Compares open-loop vs closed-loop response to reference and disturbance.
 *
 * State vector: [y_open, y_closed]
 *   y_open:  output of open-loop system (input = r directly)
 *   y_closed: output of closed-loop system with proportional gain K
 *
 * Reference r = 1 (unit step at t=0).
 * Disturbance d applied as additive input disturbance.
 */

export function createSimulation(params) {
  const { tau, K, d } = params

  function getInitialState() {
    return [0, 0]
  }

  function derivative(t, state) {
    const [yOpen, yClosed] = state
    const r = 1 // unit step reference

    // Open-loop: u = r + d, plant: τ·dy/dt = -y + u
    const uOpen = r + d
    const dyOpen = (-yOpen + uOpen) / tau

    // Closed-loop: u = K·(r - y) + d, plant: τ·dy/dt = -y + u
    const uClosed = K * (r - yClosed) + d
    const dyClosed = (-yClosed + uClosed) / tau

    return [dyOpen, dyClosed]
  }

  function getSnapshot(t, state) {
    const [yOpen, yClosed] = state
    const r = 1
    return {
      time: t,
      reference: r,
      disturbance: d,
      yOpen,
      yClosed,
      errorOpen: r - yOpen,
      errorClosed: r - yClosed,
    }
  }

  const stateLabels = ['y_open', 'y_closed']

  return { getInitialState, derivative, getSnapshot, stateLabels }
}

export function analyticalResults(params) {
  const { tau, K, d } = params
  const r = 1

  // Open-loop steady state: y_ss = r + d
  const yOpenSS = r + d

  // Closed-loop steady state: y_ss = (K·r + d) / (1 + K)
  const yClosedSS = (K * r + d) / (1 + K)

  // Closed-loop time constant
  const tauClosed = tau / (1 + K)

  // Steady-state errors
  const errorOpenSS = r - yOpenSS
  const errorClosedSS = r - yClosedSS

  return {
    openLoopSteadyState: yOpenSS,
    closedLoopSteadyState: yClosedSS,
    openLoopError: errorOpenSS,
    closedLoopError: errorClosedSS,
    openLoopTimeConstant: tau,
    closedLoopTimeConstant: tauClosed,
    gain: K,
    disturbance: d,
  }
}
