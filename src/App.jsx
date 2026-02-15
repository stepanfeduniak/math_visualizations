import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home/Home'
import TopicGallery from './pages/TopicGallery/TopicGallery'
import Visualization from './pages/Visualization/Visualization'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:topicSlug" element={<TopicGallery />} />
        <Route path="/:topicSlug/:vizSlug" element={<Visualization />} />
      </Routes>
    </Layout>
  )
}
