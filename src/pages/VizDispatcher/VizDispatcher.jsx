import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { getTopic } from '../../data/topics'

const Visualization = lazy(() => import('../Visualization/Visualization'))
const ControlVisualization = lazy(() => import('../ControlVisualization/ControlVisualization'))

export default function VizDispatcher() {
  const { topicSlug } = useParams()
  const topic = getTopic(topicSlug)
  const type = topic?.type || 'queue'

  return (
    <Suspense fallback={<div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading...</div>}>
      {type === 'control' ? <ControlVisualization /> : <Visualization />}
    </Suspense>
  )
}
