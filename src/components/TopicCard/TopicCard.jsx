import { Link } from 'react-router-dom'
import styles from './TopicCard.module.css'

export default function TopicCard({ topic }) {
  return (
    <Link to={`/${topic.slug}`} className={styles.card}>
      <span className={styles.icon}>{topic.icon}</span>
      <h2 className={styles.title}>{topic.title}</h2>
      <p className={styles.desc}>{topic.description}</p>
      <span className={styles.count}>
        {topic.visualizations.length} visualization{topic.visualizations.length !== 1 ? 's' : ''}
      </span>
    </Link>
  )
}
