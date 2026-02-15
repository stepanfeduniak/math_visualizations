import { topics } from '../../data/topics'
import TopicCard from '../../components/TopicCard/TopicCard'
import styles from './Home.module.css'

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Math Visualizations</h1>
        <p className={styles.subtitle}>
          Interactive simulations for exploring mathematical concepts
        </p>
      </header>
      <div className={styles.grid}>
        {topics.map((topic) => (
          <TopicCard key={topic.slug} topic={topic} />
        ))}
      </div>
    </div>
  )
}
