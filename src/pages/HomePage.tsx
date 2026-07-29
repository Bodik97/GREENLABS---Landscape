import siteConfig from '../../.figma/make/site.json'
import { Process, LeadForm, Seo } from '../shared'
import {
  Hero,
  Segmentation,
  Services,
  Portfolio,
  FaqSection,
  BlogSection,
} from '../components'

export default function HomePage() {
  return (
    <>
      <Seo title={siteConfig.title} description={siteConfig.description} />
      <Hero />
      <Segmentation />
      <Portfolio bg="bg-parchment" />
      <Services />
      <Process />
      <FaqSection />
      <LeadForm />
      <BlogSection />
    </>
  )
}