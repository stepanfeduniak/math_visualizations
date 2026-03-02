export const topics = [
  {
    slug: 'queueing-theory',
    title: 'Queueing Theory',
    description: 'Interactive simulations of classic queueing models — explore arrival rates, service times, and steady-state behavior.',
    icon: '𝑄',
    visualizations: [
      {
        slug: 'mm1',
        title: 'M/M/1 Queue',
        subtitle: 'Single server, infinite capacity',
        description: 'The simplest Markovian queue: Poisson arrivals, exponential service, one server.',
        modelPath: () => import('../simulation/models/mm1.js'),
        params: [
          { key: 'lambda', label: 'Arrival Rate (λ)', min: 0.1, max: 10, step: 0.1, default: 2 },
          { key: 'mu', label: 'Service Rate (μ)', min: 0.1, max: 10, step: 0.1, default: 3 },
        ],
      },
      {
        slug: 'mmc',
        title: 'M/M/c Queue',
        subtitle: 'Multiple servers, infinite capacity',
        description: 'Multiple parallel servers with Poisson arrivals and exponential service times.',
        modelPath: () => import('../simulation/models/mmc.js'),
        params: [
          { key: 'lambda', label: 'Arrival Rate (λ)', min: 0.1, max: 20, step: 0.1, default: 5 },
          { key: 'mu', label: 'Service Rate (μ)', min: 0.1, max: 10, step: 0.1, default: 2 },
          { key: 'c', label: 'Servers (c)', min: 1, max: 10, step: 1, default: 3 },
        ],
      },
    ],
  },
  {
    slug: 'control-theory',
    title: 'Control Theory',
    description: 'Interactive explorations of feedback control — from open vs closed loop to PID controllers and system dynamics.',
    icon: '⟲',
    type: 'control',
    visualizations: [
      {
        slug: 'feedback-principles',
        title: 'Feedback Principles',
        subtitle: 'Open-loop vs closed-loop control',
        description: 'Compare open-loop and closed-loop control on a first-order plant. See how feedback rejects disturbances and tracks references.',
        modelPath: () => import('../simulation/models/feedback-principles.js'),
        params: [
          { key: 'tau', label: 'Time Constant (τ)', min: 0.1, max: 5, step: 0.1, default: 1 },
          { key: 'K', label: 'Feedback Gain (K)', min: 0.1, max: 20, step: 0.1, default: 5 },
          { key: 'd', label: 'Disturbance (d)', min: -2, max: 2, step: 0.1, default: 0.5 },
        ],
        chartConfigs: [
          {
            title: 'Output Response',
            lines: [
              { dataKey: 'reference', label: 'Reference', reference: 1 },
              { dataKey: 'yOpen', label: 'Open-Loop' },
              { dataKey: 'yClosed', label: 'Closed-Loop' },
            ],
          },
          {
            title: 'Tracking Error',
            lines: [
              { dataKey: 'errorOpen', label: 'Open-Loop Error' },
              { dataKey: 'errorClosed', label: 'Closed-Loop Error' },
            ],
          },
        ],
      },
      {
        slug: 'spring-mass-damper',
        title: 'Spring-Mass-Damper',
        subtitle: 'Second-order mechanical system',
        description: 'Classic second-order system. Adjust mass, spring stiffness, and damping to see underdamped, critically damped, and overdamped behavior.',
        modelPath: () => import('../simulation/models/spring-mass-damper.js'),
        canvas: 'spring-mass-damper',
        params: [
          { key: 'm', label: 'Mass (m)', min: 0.5, max: 5, step: 0.1, default: 1 },
          { key: 'k', label: 'Spring Constant (k)', min: 0.5, max: 20, step: 0.5, default: 4 },
          { key: 'b', label: 'Damping (b)', min: 0, max: 15, step: 0.1, default: 0.5 },
          { key: 'F', label: 'Applied Force (F)', min: 0, max: 10, step: 0.5, default: 4 },
        ],
        chartConfigs: [
          {
            title: 'Position & Velocity',
            lines: [
              { dataKey: 'position', label: 'Position (x)' },
              { dataKey: 'velocity', label: 'Velocity (v)' },
            ],
          },
          {
            title: 'Energy',
            lines: [
              { dataKey: 'energy', label: 'Total Energy' },
            ],
          },
        ],
        phasePortrait: {
          title: 'Phase Portrait',
          xKey: 'position',
          yKey: 'velocity',
          xLabel: 'Position',
          yLabel: 'Velocity',
        },
      },
      {
        slug: 'cruise-control',
        title: 'Cruise Control (PI)',
        subtitle: 'PI controller with disturbance rejection',
        description: 'Vehicle cruise control with a PI controller. See how integral action eliminates steady-state error and rejects road grade disturbances.',
        modelPath: () => import('../simulation/models/cruise-control.js'),
        params: [
          { key: 'Kp', label: 'Proportional Gain (Kp)', min: 0, max: 500, step: 10, default: 200 },
          { key: 'Ki', label: 'Integral Gain (Ki)', min: 0, max: 100, step: 1, default: 20 },
          { key: 'vRef', label: 'Reference Speed (m/s)', min: 5, max: 40, step: 1, default: 20 },
          { key: 'grade', label: 'Road Grade (%)', min: -10, max: 10, step: 0.5, default: 4 },
        ],
        chartConfigs: [
          {
            title: 'Speed Response',
            lines: [
              { dataKey: 'reference', label: 'Reference Speed' },
              { dataKey: 'velocity', label: 'Vehicle Speed' },
            ],
          },
          {
            title: 'Control Signal & Error',
            lines: [
              { dataKey: 'error', label: 'Speed Error' },
              { dataKey: 'controlSignal', label: 'Control Force (N)' },
            ],
          },
        ],
      },
    ],
  },
]

export function getTopic(slug) {
  return topics.find(t => t.slug === slug)
}

export function getVisualization(topicSlug, vizSlug) {
  const topic = getTopic(topicSlug)
  if (!topic) return null
  return topic.visualizations.find(v => v.slug === vizSlug)
}
