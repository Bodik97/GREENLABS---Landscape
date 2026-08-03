import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { MotionConfig, LazyMotion, domAnimation, AnimatePresence, m } from 'framer-motion'
import { Header, Footer, MobileCTA, Fab, ConsultationModal, ConsultationModalProvider, ScrollProgress, BackToTop } from './shared'
import { ScrollToTop } from './components/ScrollToTop'
import HomePage from './pages/HomePage'

const PrivatePage = lazy(() => import('./pages/PrivatePage'))
const CommercialPage = lazy(() => import('./pages/CommercialPage'))
const ServicesPage = lazy(() => import('./pages/ServicesPage'))
const ServicePage = lazy(() => import('./pages/ServicePage'))
const ServiceItemPage = lazy(() => import('./pages/ServiceItemPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const WorkPage = lazy(() => import('./pages/WorkPage'))
const PostPage = lazy(() => import('./pages/PostPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const WorksPage = lazy(() => import('./pages/WorksPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))

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
        <Suspense fallback={null}>
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
        </Suspense>
      </m.div>
    </AnimatePresence>
  )
}

export default function App() {
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
