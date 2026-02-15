import { SimulationEngine } from '../engine.js'
import { exponential, deterministic } from '../random.js'

export function createSimulation(params) {
  const { lambda, D } = params
  return new SimulationEngine({
    numServers: 1,
    capacity: Infinity,
    arrivalGen: () => exponential(lambda),
    serviceGen: () => deterministic(D),
  })
}

export function analyticalResults(params) {
  const { lambda, D } = params
  const mu = 1 / D
  const rho = lambda * D // = lambda / mu

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

  // Pollaczek-Khinchine formula for M/G/1
  // For deterministic service: variance = 0
  // Lq = (λ² * σ² + ρ²) / (2 * (1 - ρ))
  // With σ² = 0: Lq = ρ² / (2 * (1 - ρ))
  const Lq = (rho * rho) / (2 * (1 - rho))
  const Wq = Lq / lambda
  const W = Wq + D
  const L = lambda * W

  // Approximate steady-state probabilities (not closed form for M/D/1)
  // Use geometric approximation for display
  const probabilities = []
  const p0 = 1 - rho
  for (let n = 0; n <= 20; n++) {
    // Approximate: P(0) = 1-rho, P(n) ≈ geometric-like
    const prob = n === 0 ? p0 : p0 * Math.pow(rho, n) * (1 + n * (1 - rho) * 0.5)
    probabilities.push({
      n,
      probability: Math.max(0, Math.min(1, prob)),
    })
  }

  // Normalize
  const total = probabilities.reduce((s, p) => s + p.probability, 0)
  for (const p of probabilities) p.probability /= total

  return {
    rho: round(rho),
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
