import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { topics } from '../../data/topics'
import styles from './Layout.module.css'

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className={styles.layout}>
      <aside className={`${styles.sidebar} ${menuOpen ? styles.open : ''}`}>
        <NavLink to="/" className={styles.brand} onClick={() => setMenuOpen(false)}>
          <span className={styles.logo}>MV</span>
          <span className={styles.brandName}>Math Viz</span>
        </NavLink>
        <nav className={styles.nav}>
          {topics.map((topic) => (
            <NavLink
              key={topic.slug}
              to={`/${topic.slug}`}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
              onClick={() => setMenuOpen(false)}
            >
              <span className={styles.navIcon}>{topic.icon}</span>
              {topic.title}
            </NavLink>
          ))}
        </nav>
      </aside>

      <button
        className={styles.menuToggle}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>

      {menuOpen && (
        <div className={styles.overlay} onClick={() => setMenuOpen(false)} />
      )}

      <main className={styles.content}>
        {children}
      </main>
    </div>
  )
}
