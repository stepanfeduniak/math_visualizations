import { Link } from 'react-router-dom'
import styles from './VizCard.module.css'

export default function VizCard({ topicSlug, viz }) {
  return (
    <Link to={`/${topicSlug}/${viz.slug}`} className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{viz.title}</h3>
        <span className={styles.subtitle}>{viz.subtitle}</span>
      </div>
      <p className={styles.desc}>{viz.description}</p>
      <span className={styles.cta}>Explore &rarr;</span>
    </Link>
  )
}
