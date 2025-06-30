import { Header } from "@/components/layout/header"
import { Hero } from "@/components/sections/hero"
import { Features } from "@/components/sections/features"
import { Properties } from "@/components/sections/properties"
import { Testimonials } from "@/components/sections/testimonials"
import { CTA } from "@/components/sections/cta"
import { Footer } from "@/components/layout/footer"
import { PartnersSection } from "@/components/sections/partners"
import { PremiumSection } from "@/components/sections/premium-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <Properties />
        <Testimonials />
        <CTA />
        <PremiumSection />
      </main>
      <PartnersSection />
      <Footer />
    </div>
  )
}
