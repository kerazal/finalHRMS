// components/CTA.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    // Section uses pure white for light mode and a deep slate for dark mode.
    <section className="relative overflow-hidden bg-white dark:bg-slate-950 py-24 lg:py-32">
      
      {/* 
        Enhanced Aurora Background for DARK MODE ONLY.
        This is a soft, radial glow that adds depth without being distracting.
      */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[300px] hidden dark:block"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 to-cyan-500/20 blur-3xl opacity-50" />
      </div>

      {/* Content Container (z-10 ensures it's above the aurora) */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
          Ready to Find Your Place?
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
          Your next home is just a few clicks away. Start your search or list your property with us today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/login">
            {/* Primary button inverts for high contrast and has a subtle hover scale effect. */}
            <Button
              size="lg"
              className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 transition-transform hover:scale-105"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/properties">
            {/* 
              Secondary button is a clean outline in light mode,
              and a "glassmorphism" button in dark mode to match the hero search.
            */}
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-transparent border-slate-300 text-slate-800 hover:bg-slate-100 dark:bg-white/10 dark:border-white/20 dark:text-white dark:hover:bg-white/20 dark:backdrop-blur-sm transition-colors"
            >
              Browse Properties
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
