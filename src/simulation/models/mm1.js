import { SimulationEngine } from '../engine.js'
import { exponential } from '../random.js'

export function createSimulation(params) {
  const { lambda, mu } = params
  return new SimulationEngine({
    numServers: 1,
    capacity: Infinity,
    arrivalGen: () => exponential(lambda),
    serviceGen: () => exponential(mu),
  })
}

export function analyticalResults(params) {
  const { lambda, mu } = params
  const rho = lambda / mu

  if (rho >= 1) {
    return {
      rho,
      stable: false,
      L: Infinity,
      Lq: Infinity,
      W: Infinity,
      Wq: Infinity,
      warning: 'System is unstable (ρ ≥ 1). Queue will grow without bound.',
    }
  }

  const L = rho / (1 - rho)
  const Lq = rho * rho / (1 - rho)
  const W = 1 / (mu - lambda)
  const Wq = rho / (mu - lambda)

  // Steady-state probabilities P(n) for n = 0..20
  const probabilities = []
  for (let n = 0; n <= 20; n++) {
    probabilities.push({
      n,
      probability: (1 - rho) * Math.pow(rho, n),
    })
  }

  return {
    rho,
    stable: true,
    L: round(L),
    Lq: round(Lq),
    W: round(W),
    Wq: round(Wq),
    probabilities,
  }
}

function round(v) {
  return Math.round(v * 10000) / 10000
}
