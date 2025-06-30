"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./use-auth"

interface Stats {
  totalUsers?: number
  activeProperties?: number
  monthlyRevenue?: number
  myProperties?: number
  monthlyIncome?: number
  activeTenants?: number
  pendingBookings?: number
  monthlyRent?: number
  maintenanceRequests?: number
  unreadMessages?: number
}

export function useStats() {
  const [stats, setStats] = useState<Stats>({})
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      setIsLoading(true)

      try {
        const response = await fetch(`/api/dashboard/stats?userId=${user.id}&role=${user.role}`)
        const data = await response.json()

        if (response.ok) {
          setStats(data.stats)
        } else {
          console.error("Failed to fetch stats:", data.error)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [user])

  return { stats, isLoading }
}
