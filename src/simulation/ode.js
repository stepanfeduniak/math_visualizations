/**
 * 4th-order Runge-Kutta ODE integrator.
 * Pure functions — no classes, no mutation of input arrays.
 */

/**
 * Single RK4 step.
 * @param {function} derivative - (t, state) => dState/dt array
 * @param {number} t - current time
 * @param {number[]} state - current state vector
 * @param {number} dt - time step
 * @returns {number[]} new state vector after one step
 */
export function rk4Step(derivative, t, state, dt) {
  const n = state.length
  const k1 = derivative(t, state)

  const s2 = new Array(n)
  for (let i = 0; i < n; i++) s2[i] = state[i] + 0.5 * dt * k1[i]
  const k2 = derivative(t + 0.5 * dt, s2)

  const s3 = new Array(n)
  for (let i = 0; i < n; i++) s3[i] = state[i] + 0.5 * dt * k2[i]
  const k3 = derivative(t + 0.5 * dt, s3)

  const s4 = new Array(n)
  for (let i = 0; i < n; i++) s4[i] = state[i] + dt * k3[i]
  const k4 = derivative(t + dt, s4)

  const result = new Array(n)
  for (let i = 0; i < n; i++) {
    result[i] = state[i] + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])
  }
  return result
}

/**
 * Integrate an ODE from t0 to tEnd, recording snapshots at each step.
 * @param {function} derivative - (t, state) => dState/dt array
 * @param {number[]} initialState - state vector at t0
 * @param {number} t0 - start time
 * @param {number} tEnd - end time
 * @param {number} dt - fixed time step
 * @returns {{ times: number[], states: number[][] }} times and state vectors
 */
export function integrate(derivative, initialState, t0, tEnd, dt) {
  const times = [t0]
  const states = [initialState.slice()]
  let t = t0
  let state = initialState.slice()

  while (t < tEnd - 1e-12) {
    const step = Math.min(dt, tEnd - t)
    state = rk4Step(derivative, t, state, step)
    t += step
    times.push(t)
    states.push(state.slice())
  }

  return { times, states }
}
