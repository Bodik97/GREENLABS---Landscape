import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
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

/* key за адресою: React перестворює вузол на кожному переході, і css-анімація
   через це починається спочатку. Без цього завіса зіграла б лише раз. */
function PageCurtain() {
  const location = useLocation()
  return (
    <div
      key={location.pathname}
      className="animate-curtain fixed inset-0 z-70 bg-green/25 backdrop-blur-sm pointer-events-none"
    >
      <div className="absolute bottom-0 inset-x-0 h-1 bg-terra" />
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <div key={location.pathname} className="animate-page-in">
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
    </div>
  )
}

export default function App() {
  useEffect(trackPhoneClicks, [])

  return (
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
  )
}
