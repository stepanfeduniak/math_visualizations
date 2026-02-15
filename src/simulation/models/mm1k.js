import { SimulationEngine } from '../engine.js'
import { exponential } from '../random.js'

export function createSimulation(params) {
  const { lambda, mu, K } = params
  return new SimulationEngine({
    numServers: 1,
    capacity: K,
    arrivalGen: () => exponential(lambda),
    serviceGen: () => exponential(mu),
  })
}

export function analyticalResults(params) {
  const { lambda, mu, K } = params
  const rho = lambda / mu

  // Finite capacity — always stable
  let P0, probabilities

  if (Math.abs(rho - 1) < 1e-10) {
    // Special case: rho = 1
    P0 = 1 / (K + 1)
    probabilities = []
    for (let n = 0; n <= K; n++) {
      probabilities.push({ n, probability: P0 })
    }
  } else {
    P0 = (1 - rho) / (1 - Math.pow(rho, K + 1))
    probabilities = []
    for (let n = 0; n <= K; n++) {
      probabilities.push({
        n,
        probability: P0 * Math.pow(rho, n),
      })
    }
  }

  // P_K = probability system is full (rejection probability)
  const PK = probabilities[K].probability
  const lambdaEff = lambda * (1 - PK) // effective arrival rate

  // L = expected number in system
  let L
  if (Math.abs(rho - 1) < 1e-10) {
    L = K / 2
  } else {
    L = (rho / (1 - rho)) - ((K + 1) * Math.pow(rho, K + 1)) / (1 - Math.pow(rho, K + 1))
  }

  const Lq = L - (1 - P0) // Lq = L - (1 - P0) since 1-P0 is prob server busy
  const W = lambdaEff > 0 ? L / lambdaEff : 0
  const Wq = lambdaEff > 0 ? Lq / lambdaEff : 0

  return {
    rho: round(rho),
    stable: true,
    L: round(L),
    Lq: round(Math.max(0, Lq)),
    W: round(W),
    Wq: round(Math.max(0, Wq)),
    rejectionProb: round(PK),
    probabilities,
  }
}

function round(v) {
  return Math.round(v * 10000) / 10000
}
