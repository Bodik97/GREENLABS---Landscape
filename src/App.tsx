import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { MotionConfig, LazyMotion, domAnimation, AnimatePresence, m } from 'framer-motion'
import { Header, Footer, MobileCTA, Fab, ConsultationModal, ConsultationModalProvider, ScrollProgress, BackToTop } from './shared'
import { ScrollToTop } from './components/ScrollToTop'
import { trackPhoneClicks } from './lib/track'
import HomePage from './pages/HomePage'
import PrivatePage from './pages/PrivatePage'
import CommercialPage from './pages/CommercialPage'
import ServicesPage from './pages/ServicesPage'
import ServicePage from './pages/ServicePage'
import ServiceItemPage from './pages/ServiceItemPage'
import AboutPage from './pages/AboutPage'
import WorkPage from './pages/WorkPage'
import PostPage from './pages/PostPage'
import PrivacyPage from './pages/PrivacyPage'
import WorksPage from './pages/WorksPage'
import BlogPage from './pages/BlogPage'


function PageCurtain() {
  const location = useLocation()
  return (
    <AnimatePresence>
      <m.div
        key={location.pathname}
        className="fixed inset-0 z-70 bg-green/25 backdrop-blur-sm pointer-events-none"
        initial={{ y: '-101%' }}
        animate={{ y: ['-101%', '0%', '0%', '101%'] }}
        transition={{ duration: 0.75, times: [0, 0.4, 0.6, 1], ease: [0.76, 0, 0.24, 1] }}
      >
        <div className="absolute bottom-0 inset-x-0 h-1 bg-terra" />
      </m.div>
    </AnimatePresence>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <m.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.42, duration: 0.25 } }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
      >
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/private" element={<PrivatePage />} />
            <Route path="/commercial" element={<CommercialPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:slug" element={<ServicePage />} />
            <Route path="/services/:slug/:item" element={<ServiceItemPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/works" element={<WorksPage />} />
            <Route path="/works/:slug" element={<WorkPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<PostPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
          </Routes>
      </m.div>
    </AnimatePresence>
  )
}

export default function App() {
  useEffect(trackPhoneClicks, [])

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <ConsultationModalProvider>
            <ScrollToTop />
            <ScrollProgress />
            <PageCurtain />
            <div className="bg-cream text-ink font-sans min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <AnimatedRoutes />
              </main>
              <Footer />
              <MobileCTA />
              <BackToTop />
              <Fab />
            </div>
            <ConsultationModal />
          </ConsultationModalProvider>
        </BrowserRouter>
      </LazyMotion>
    </MotionConfig>
  )
}
