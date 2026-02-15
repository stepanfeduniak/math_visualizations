import { SimulationEngine } from '../engine.js'
import { exponential } from '../random.js'

export function createSimulation(params) {
  const { lambda, mu, c, K } = params
  return new SimulationEngine({
    numServers: c,
    capacity: K,
    arrivalGen: () => exponential(lambda),
    serviceGen: () => exponential(mu),
  })
}

export function analyticalResults(params) {
  const { lambda, mu, c, K } = params
  const a = lambda / mu // offered load
  const rho = lambda / (c * mu)

  // Birth-death chain: compute P0
  // For n < c: rate_n = a^n / n!
  // For n >= c: rate_n = a^n / (c! * c^(n-c))
  const terms = []
  for (let n = 0; n <= K; n++) {
    if (n < c) {
      terms.push(Math.pow(a, n) / factorial(n))
    } else {
      terms.push(Math.pow(a, n) / (factorial(c) * Math.pow(c, n - c)))
    }
  }

  const P0 = 1 / terms.reduce((s, t) => s + t, 0)

  const probabilities = terms.map((t, n) => ({
    n,
    probability: t * P0,
  }))

  const PK = probabilities[K].probability
  const lambdaEff = lambda * (1 - PK)

  // L = sum(n * P_n)
  let L = 0
  for (let n = 0; n <= K; n++) {
    L += n * probabilities[n].probability
  }

  // Average number of busy servers
  let Ls = 0
  for (let n = 0; n <= K; n++) {
    Ls += Math.min(n, c) * probabilities[n].probability
  }

  const Lq = L - Ls
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

function factorial(n) {
  let r = 1
  for (let i = 2; i <= n; i++) r *= i
  return r
}

function round(v) {
  return Math.round(v * 10000) / 10000
}
