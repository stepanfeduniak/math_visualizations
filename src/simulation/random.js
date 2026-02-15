/** Exponential random variate with rate `rate` */
export function exponential(rate) {
  return -Math.log(1 - Math.random()) / rate
}

/** Deterministic "random" variate — always returns `value` */
export function deterministic(value) {
  return value
}
