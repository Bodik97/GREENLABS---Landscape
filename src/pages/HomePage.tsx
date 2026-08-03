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
      <Portfolio bg="bg-parchment" above="text-cream" />
      <Services above="text-parchment" />
      <Process above="text-green" />
      <FaqSection above="text-parchment" />
      <LeadForm above="text-cream" />
      <BlogSection />
    </>
  )
}