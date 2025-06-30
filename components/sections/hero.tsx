
"use client";

import { useState } from "react";
import { Search, MapPin, Home } from "lucide-react"; // DollarSign removed
import { Button } from "@/components/ui/button";
import clsx from "clsx";

export function Hero() {
  const [searchType, setSearchType] = useState("rent");

  return (
    <section className="relative h-screen flex flex-col justify-center items-center text-center">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=2070&auto=format&fit=crop"
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="https://cdn.pixabay.com/video/2021/10/12/91744-636709154_tiny.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Subtle Gradient Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight drop-shadow-md">
          Find Your House.
        </h1>
        <p className="mt-4 text-xl text-gray-200 max-w-2xl drop-shadow-md">
          Discover exceptional rental properties tailored to your life.
        </p>

        <div className="mt-12 w-full max-w-4xl">
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={() => setSearchType("rent")}
              className={clsx(
                "py-2 px-8 rounded-full text-lg font-semibold transition-all duration-300",
                {
                  "bg-white text-gray-900 shadow-lg": searchType === "rent",
                  "bg-white/20 text-white hover:bg-white/30": searchType !== "rent",
                }
              )}
            >
              For Rent
            </button>
            <button
              onClick={() => setSearchType("sale")}
              className={clsx(
                "py-2 px-8 rounded-full text-lg font-semibold transition-all duration-300",
                {
                  "bg-white text-gray-900 shadow-lg": searchType === "sale",
                  "bg-white/20 text-white hover:bg-white/30": searchType !== "sale",
                }
              )}
            >
              For Sale
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 bg-white/20 backdrop-blur-lg p-3 rounded-xl md:rounded-full border border-white/30 shadow-2xl">
            <div className="w-full md:flex-1 relative flex items-center">
              <MapPin className="absolute left-4 h-6 w-6 text-white/70" />
              <input
                type="text"
                placeholder="Enter city or neighborhood..."
                className="w-full bg-transparent pl-12 pr-4 py-3 text-white placeholder:text-gray-300 focus:outline-none"
              />
            </div>
            
            <div className="hidden md:block w-px h-8 bg-white/30" />

            <div className="w-full md:w-auto relative flex items-center cursor-pointer group">
              <Home className="absolute left-4 h-6 w-6 text-white/70" />
              <select
                className="w-full bg-transparent pl-12 pr-8 py-3 text-white appearance-none focus:outline-none cursor-pointer"
              >
                <option className="text-black">All Types</option>
                <option className="text-black">Apartment</option>
                <option className="text-black">House</option>
                <option className="text-black">Condo</option>
              </select>
            </div>

            <div className="hidden md:block w-px h-8 bg-white/30" />

            {/* --- BIRR SIGN IMPLEMENTED HERE --- */}
            <div className="w-full md:w-auto relative flex items-center cursor-pointer group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-white/70 pointer-events-none">
                Br
              </span>
              <select
                className="w-full bg-transparent pl-12 pr-8 py-3 text-white appearance-none focus:outline-none cursor-pointer"
              >
                <option className="text-black">Any Price</option>
                {searchType === 'rent' ? (
                  <>
                    <option className="text-black">5,000 - 15,000 Br</option>
                    <option className="text-black">15,000 - 30,000 Br</option>
                    <option className="text-black">30,000+ Br</option>
                  </>
                ) : (
                  <>
                    <option className="text-black">1M - 5M Br</option>
                    <option className="text-black">5M - 10M Br</option>
                    <option className="text-black">10M+ Br</option>
                  </>
                )}
              </select>
            </div>

            <Button
              size="lg"
              className="w-full md:w-auto md:h-14 md:px-8 bg-blue-600 hover:bg-blue-700 rounded-lg md:rounded-full text-lg font-semibold transition-all duration-300"
            >
              <Search className="mr-2 h-5 w-5 md:hidden" />
              Search
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
