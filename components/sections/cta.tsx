// components/CTA.tsx

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    // The section has a light background by default, and a dark, relative background for the aurora in dark mode.
    <section className="relative overflow-hidden bg-slate-100 dark:bg-slate-950 py-24 lg:py-32">
      
      {/* 
        Modern Aurora Background Effect for DARK MODE ONLY.
        This div is hidden in light mode and becomes a blurred gradient in dark mode.
      */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full hidden dark:block"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-slate-950 blur-3xl" />
      </div>

      {/* Content Container (z-10 ensures it's above the aurora) */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
          Ready to Find Your Place?
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
          Your next home is just a few clicks away. Start your search or list your property with us today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/login">
            {/* The primary button's colors invert for light/dark mode for max contrast */}
            <Button size="lg" className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/properties">
            {/* The secondary button adapts its border and text colors */}
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-transparent border-slate-300 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Browse Properties
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
