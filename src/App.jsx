import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home/Home'
import TopicGallery from './pages/TopicGallery/TopicGallery'
import VizDispatcher from './pages/VizDispatcher/VizDispatcher'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:topicSlug" element={<TopicGallery />} />
        <Route path="/:topicSlug/:vizSlug" element={<VizDispatcher />} />
      </Routes>
    </Layout>
  )
}
