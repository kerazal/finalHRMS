"use client"

import { useState, useCallback } from "react"

interface Property {
  id: string
  title: string
  location: string
  price: number
  bedrooms: number
  bathrooms: number
  area: number
  type: string
  images: string[]
  featured?: boolean
  available: boolean
  landlord?: {
    name: string
    email: string
    phone: string
  }
}

interface Filters {
  type: string
  location: string
  minPrice: string
  maxPrice: string
  bedrooms: string
  bathrooms: string
}

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const searchProperties = useCallback(async (searchTerm: string, filters: Filters) => {
    setIsLoading(true)

    try {
      const params = new URLSearchParams()

      if (searchTerm) params.append("search", searchTerm)
      if (filters.type) params.append("type", filters.type)
      if (filters.location) params.append("location", filters.location)
      if (filters.minPrice) params.append("minPrice", filters.minPrice)
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice)
      if (filters.bedrooms) params.append("bedrooms", filters.bedrooms)
      if (filters.bathrooms) params.append("bathrooms", filters.bathrooms)

      const response = await fetch(`/api/properties?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setProperties(data.properties)
      } else {
        console.error("Failed to fetch properties:", data.error)
        setProperties([])
      }
    } catch (error) {
      console.error("Error fetching properties:", error)
      setProperties([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    properties,
    isLoading,
    searchProperties,
  }
}
