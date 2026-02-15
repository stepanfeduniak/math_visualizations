import { SimulationEngine } from '../engine.js'
import { exponential } from '../random.js'

export function createSimulation(params) {
  const { lambda, mu, c } = params
  return new SimulationEngine({
    numServers: c,
    capacity: Infinity,
    arrivalGen: () => exponential(lambda),
    serviceGen: () => exponential(mu),
  })
}

export function analyticalResults(params) {
  const { lambda, mu, c } = params
  const rho = lambda / (c * mu)

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

  // Erlang-C formula
  const a = lambda / mu // offered load

  // P0: probability of empty system
  let sum = 0
  for (let n = 0; n < c; n++) {
    sum += Math.pow(a, n) / factorial(n)
  }
  sum += (Math.pow(a, c) / factorial(c)) * (1 / (1 - rho))
  const P0 = 1 / sum

  // Erlang-C: P(wait) = probability an arriving customer has to wait
  const C = (Math.pow(a, c) / factorial(c)) * (1 / (1 - rho)) * P0

  const Lq = C * rho / (1 - rho)
  const Wq = Lq / lambda
  const W = Wq + 1 / mu
  const L = lambda * W

  // Steady-state probabilities
  const probabilities = []
  for (let n = 0; n <= 20; n++) {
    let Pn
    if (n < c) {
      Pn = (Math.pow(a, n) / factorial(n)) * P0
    } else {
      Pn = (Math.pow(a, n) / (factorial(c) * Math.pow(c, n - c))) * P0
    }
    probabilities.push({ n, probability: Pn })
  }

  return {
    rho: round(rho),
    stable: true,
    L: round(L),
    Lq: round(Lq),
    W: round(W),
    Wq: round(Wq),
    erlangC: round(C),
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
