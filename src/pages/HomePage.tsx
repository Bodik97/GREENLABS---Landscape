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
      <Portfolio bg="bg-parchment" above="bg-cream" />
      <Services above="bg-parchment" />
      <Process above="bg-green" />
      <FaqSection above="bg-parchment" />
      <LeadForm above="bg-cream" />
      <BlogSection />
    </>
  )
}