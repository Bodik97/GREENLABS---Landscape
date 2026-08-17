import { useEffect, useRef } from 'react'
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
import CareersPage from './pages/CareersPage'
import { HiringToast } from './components/ui/HiringPrompts'

/**
 * Чи це перехід у застосунку, а не перше відкриття сторінки.
 *
 * Різниця принципова. Анімації тепер на css, а css стартує вже під час розбору
 * html — тобто на першому відкритті завіса й проявлення грали б поверх готового
 * пререндереного кадру, ховаючи його на пів секунди. Сторінка від цього не
 * ставала повільнішою насправді, але ставала повільнішою на вигляд, і Speed
 * Index це чесно показував. На першому кадрі анімацій немає; вони потрібні лише
 * там, де є що змінювати — при переході між сторінками.
 */
function useIsNavigation() {
  const first = useRef(true)
  useEffect(() => {
    first.current = false
  }, [])
  return !first.current
}

/* key за адресою: React перестворює вузол на кожному переході, і css-анімація
   через це починається спочатку. Без цього завіса зіграла б лише раз. */
function PageCurtain() {
  const location = useLocation()
  const navigating = useIsNavigation()
  if (!navigating) return null

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
  const navigating = useIsNavigation()
  return (
    <div key={location.pathname} className={navigating ? 'animate-page-in' : undefined}>
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
        <Route path="/robota" element={<CareersPage />} />
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
          <HiringToast />
        </div>
        <ConsultationModal />
      </ConsultationModalProvider>
    </BrowserRouter>
  )
}
