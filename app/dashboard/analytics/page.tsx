"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Users, Building, Building2, Activity } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState("30d")
  const [analytics, setAnalytics] = useState({
    revenue: { current: 0, previous: 0, change: 0 },
    properties: { current: 0, previous: 0, change: 0 },
    tenants: { current: 0, previous: 0, change: 0 },
    occupancy: { current: 0, previous: 0, change: 0 },
  })
  const [chartData, setChartData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [user, timeRange])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?timeRange=${timeRange}&userId=${user?.id}&role=${user?.role}`)
      const data = await response.json()

      if (response.ok) {
        setAnalytics(data.analytics)
        setChartData(data.chartData || [])
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getAnalyticsCards = () => {
    switch (user?.role) {
      case "admin":
        return [
          {
            title: "Total Revenue",
            value: `$${analytics.revenue.current.toLocaleString()}`,
            change: analytics.revenue.change,
            icon: DollarSign,
            color: "text-green-600",
            bgColor: "bg-green-100 dark:bg-green-900/20",
          },
          {
            title: "Active Properties",
            value: analytics.properties.current,
            change: analytics.properties.change,
            icon: Building,
            color: "text-blue-600",
            bgColor: "bg-blue-100 dark:bg-blue-900/20",
          },
          {
            title: "Total Users",
            value: analytics.tenants.current,
            change: analytics.tenants.change,
            icon: Users,
            color: "text-purple-600",
            bgColor: "bg-purple-100 dark:bg-purple-900/20",
          },
          {
            title: "Platform Occupancy",
            value: `${analytics.occupancy.current}%`,
            change: analytics.occupancy.change,
            icon: TrendingUp,
            color: "text-orange-600",
            bgColor: "bg-orange-100 dark:bg-orange-900/20",
          },
        ]
      case "landlord":
        return [
          {
            title: "Monthly Income",
            value: `$${analytics.revenue.current.toLocaleString()}`,
            change: analytics.revenue.change,
            icon: DollarSign,
            color: "text-green-600",
            bgColor: "bg-green-100 dark:bg-green-900/20",
          },
          {
            title: "My Properties",
            value: analytics.properties.current,
            change: analytics.properties.change,
            icon: Building,
            color: "text-blue-600",
            bgColor: "bg-blue-100 dark:bg-blue-900/20",
          },
          {
            title: "Active Tenants",
            value: analytics.tenants.current,
            change: analytics.tenants.change,
            icon: Users,
            color: "text-purple-600",
            bgColor: "bg-purple-100 dark:bg-purple-900/20",
          },
          {
            title: "Occupancy Rate",
            value: `${analytics.occupancy.current}%`,
            change: analytics.occupancy.change,
            icon: TrendingUp,
            color: "text-orange-600",
            bgColor: "bg-orange-100 dark:bg-orange-900/20",
          },
        ]
      default:
        return []
    }
  }

  const analyticsCards = getAnalyticsCards()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400">Track your performance and insights</p>
          </div>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {analyticsCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                      <div className="flex items-center mt-1">
                        {card.change >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${card.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {card.change >= 0 ? "+" : ""}
                          {card.change}%
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">vs last period</span>
                      </div>
                    </div>
                    <div className={`${card.bgColor} p-3 rounded-full`}>
                      <card.icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              {isLoading ? (
                <div className="text-gray-500">Loading chart data...</div>
              ) : (
                <div className="w-full h-full bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Chart visualization would be implemented here</p>
                    <p className="text-sm text-gray-500">Using libraries like Chart.js or Recharts</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Property Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Property Performance</CardTitle>
              <CardDescription>Top performing properties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">#{item}</span>
                      </div>
                      <div>
                        <p className="font-medium">Property {item}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Downtown Location</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(2500 + item * 200).toLocaleString()}</p>
                      <p className="text-sm text-green-600">+{5 + item}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "New tenant signed lease", time: "2 hours ago", type: "success" },
                  { action: "Property listing updated", time: "4 hours ago", type: "info" },
                  { action: "Maintenance request completed", time: "6 hours ago", type: "success" },
                  { action: "Payment received", time: "1 day ago", type: "success" },
                  { action: "New property added", time: "2 days ago", type: "info" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full ${activity.type === "success" ? "bg-green-500" : "bg-blue-500"}`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Properties</CardTitle>
              <CardDescription>
                Properties with highest engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Downtown Apartment</p>
                    <p className="text-sm text-muted-foreground">Property #1234</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$2,400</p>
                    <p className="text-sm text-muted-foreground">Monthly rent</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Suburban House</p>
                    <p className="text-sm text-muted-foreground">Property #5678</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$3,200</p>
                    <p className="text-sm text-muted-foreground">Monthly rent</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">City Center Loft</p>
                    <p className="text-sm text-muted-foreground">Property #9012</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$1,800</p>
                    <p className="text-sm text-muted-foreground">Monthly rent</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>User Demographics</CardTitle>
              <CardDescription>
                Breakdown of user types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Landlords</span>
                  </div>
                  <span className="text-sm font-medium">45%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Tenants</span>
                  </div>
                  <span className="text-sm font-medium">35%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Admins</span>
                  </div>
                  <span className="text-sm font-medium">20%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
