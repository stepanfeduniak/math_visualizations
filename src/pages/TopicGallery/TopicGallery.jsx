import { useParams, Link } from 'react-router-dom'
import { getTopic } from '../../data/topics'
import VizCard from '../../components/VizCard/VizCard'
import styles from './TopicGallery.module.css'

export default function TopicGallery() {
  const { topicSlug } = useParams()
  const topic = getTopic(topicSlug)

  if (!topic) {
    return (
      <div className={styles.page}>
        <p>Topic not found. <Link to="/">Go home</Link></p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>&larr; All Topics</Link>
        <h1>{topic.title}</h1>
        <p className={styles.desc}>{topic.description}</p>
      </header>
      <div className={styles.grid}>
        {topic.visualizations.map((viz) => (
          <VizCard key={viz.slug} topicSlug={topicSlug} viz={viz} />
        ))}
      </div>
    </div>
  )
}
