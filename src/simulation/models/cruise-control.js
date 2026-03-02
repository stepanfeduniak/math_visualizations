/**
 * Cruise Control with PI Controller (Astrom & Murray Ch 3)
 *
 * Vehicle model: m·v' = u - b·v - m·g·sin(theta)
 * PI controller:  u = Kp·e + Ki·∫e·dt,  e = v_ref - v
 * Actuator clamp: u ∈ [0, uMax]
 *
 * State vector: [velocity, integralError]
 * Parameters: Kp, Ki, vRef (reference speed), grade (road grade %),
 *             mass, drag, uMax
 */

export function createSimulation(params) {
  const {
    Kp, Ki, vRef, grade,
    mass = 1000,
    drag = 50,
    uMax = 5000,
  } = params

  const g = 9.81
  const theta = Math.atan(grade / 100)

  function getInitialState() {
    return [0, 0] // [velocity, integralError]
  }

  function derivative(t, state) {
    const [v, intErr] = state
    const error = vRef - v

    // PI control with anti-windup clamping
    let u = Kp * error + Ki * intErr
    const uClamped = Math.max(0, Math.min(uMax, u))

    // Vehicle dynamics: m·v' = u - b·v - m·g·sin(theta)
    const dv = (uClamped - drag * v - mass * g * Math.sin(theta)) / mass

    // Only integrate error when actuator is not saturated (anti-windup)
    const dIntErr = (u === uClamped) ? error : 0

    return [dv, dIntErr]
  }

  function getSnapshot(t, state) {
    const [v, intErr] = state
    const error = vRef - v
    let u = Kp * error + Ki * intErr
    const uClamped = Math.max(0, Math.min(uMax, u))

    return {
      time: t,
      velocity: v,
      reference: vRef,
      error,
      controlSignal: uClamped,
      integralError: intErr,
      grade,
      saturated: u !== uClamped,
    }
  }

  const stateLabels = ['velocity', 'integralError']

  return { getInitialState, derivative, getSnapshot, stateLabels }
}

export function analyticalResults(params) {
  const {
    Kp, Ki, vRef, grade,
    mass = 1000,
    drag = 50,
  } = params

  const g = 9.81
  const theta = Math.atan(grade / 100)
  const disturbance = mass * g * Math.sin(theta)

  // Steady-state with PI (Ki > 0): error → 0, v → vRef
  // Steady-state with P-only (Ki = 0): v_ss = (Kp·vRef - disturbance) / (Kp + drag)
  let steadyStateVelocity
  let steadyStateError

  if (Ki > 0) {
    steadyStateVelocity = vRef
    steadyStateError = 0
  } else {
    steadyStateVelocity = (Kp * vRef - disturbance) / (Kp + drag)
    steadyStateError = vRef - steadyStateVelocity
  }

  return {
    referenceSpeed: vRef,
    steadyStateVelocity,
    steadyStateError,
    gradeDisturbance: disturbance,
    controllerType: Ki > 0 ? 'PI' : 'P-only',
  }
}
