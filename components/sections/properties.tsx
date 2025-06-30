"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Bed, Bath, Square, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

interface Property {
  id: string
  title: string
  description: string
  price: number
  location: string
  bedrooms: number
  bathrooms: number
  area: number
  images: string[]
}

export function Properties() {
  const { user } = useAuth?.() || { user: null }
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApprovedProperties = async () => {
      try {
        const response = await fetch('/api/properties?approved=true&featured=true')
        if (response.ok) {
          const data = await response.json()
          setProperties(data.properties || [])
        }
      } catch (error) {
        console.error('Error fetching approved properties:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchApprovedProperties()
  }, [])

  const SkeletonCard = () => (
    <div className="animate-pulse">
      <div className="bg-slate-200 dark:bg-slate-800 h-56 rounded-lg"></div>
      <div className="pt-4">
        <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mb-3"></div>
        <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded mb-5"></div>
        <div className="flex gap-2 mb-4">
          <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
          <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
          <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
        </div>
        <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
      </div>
    </div>
  )

  return (
    <section className="bg-white dark:bg-slate-950 py-20 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Featured Properties</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Hand-picked listings that meet our highest standards of quality and comfort.
          </p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">No Featured Properties Found</h3>
            <p className="text-slate-600 dark:text-slate-400">Please check back later as we are always adding new listings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {properties.map((property) => (
              <Card key={property.id} className="flex flex-col border-none shadow-none bg-transparent">
                <div className="relative">
                  <img
                    src={property.images?.[0] || "/placeholder.jpg"}
                    alt={property.title}
                    className="w-full h-56 object-cover rounded-lg"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/80 text-green-700 dark:bg-slate-950/80 dark:text-green-400 backdrop-blur-sm font-semibold flex items-center gap-1.5 border border-white/50 dark:border-slate-800">
                      <CheckCircle className="h-4 w-4" />
                      Verified
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-col flex-grow pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl text-slate-900 dark:text-white">{property.title}</CardTitle>
                    <div className="flex-shrink-0 text-xl font-bold text-slate-800 dark:text-white">
                      ${property.price}
                      <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/mo</span>
                    </div>
                  </div>

                  <CardDescription className="flex items-center gap-2 mb-4 text-slate-600 dark:text-slate-400">
                    <MapPin className="h-4 w-4" />
                    {property.location}
                  </CardDescription>

                  {/* --- THIS IS THE CORRECTED AND CLARIFIED SECTION --- */}
                  <div className="flex items-center gap-2 my-2">
                    {[
                      { icon: Bed,    label: `${property.bedrooms} Beds` },
                      { icon: Bath,   label: `${property.bathrooms} Baths` },
                      { icon: Square, label: `${property.area} sqft` },
                    ].map((spec, index) => (
                      <div key={index} className="flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800/70 px-3 py-1 text-sm text-slate-700 dark:text-slate-300">
                        <spec.icon className="h-4 w-4 flex-shrink-0" />
                        <span>{spec.label}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-auto pt-4">
                    <Link href={`/properties/${property.id}`} scroll={true}>
                      <Button className="w-full bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200" size="lg">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        <div className="text-center mt-16">
          <Link href="/properties">
            <Button variant="outline" size="lg" className="border-slate-300 dark:border-slate-700">
              View All Properties
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
