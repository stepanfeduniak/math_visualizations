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
]

export function getTopic(slug) {
  return topics.find(t => t.slug === slug)
}

export function getVisualization(topicSlug, vizSlug) {
  const topic = getTopic(topicSlug)
  if (!topic) return null
  return topic.visualizations.find(v => v.slug === vizSlug)
}
