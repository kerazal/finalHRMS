"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Home,
  CreditCard,
  Calendar,
  Wrench,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
} from "lucide-react"
import { useStats } from "@/hooks/use-stats"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

export function TenantDashboard() {
  const { stats, isLoading } = useStats()
  const { user } = useAuth()
  const { toast } = useToast()
  const [maintenanceRequests, setMaintenanceRequests] = useState([])
  const [payments, setPayments] = useState([])
  const [currentProperty, setCurrentProperty] = useState(null)
  const [isSubmittingMaintenance, setIsSubmittingMaintenance] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchMaintenanceRequests()
      fetchPayments()
      fetchCurrentProperty()
    }
  }, [user])

  const fetchMaintenanceRequests = async () => {
    try {
      const response = await fetch(`/api/maintenance?userId=${user?.id}&role=tenant`)
      const data = await response.json()
      if (response.ok) {
        setMaintenanceRequests(data.requests)
      }
    } catch (error) {
      console.error("Error fetching maintenance requests:", error)
    }
  }

  const fetchPayments = async () => {
    try {
      const response = await fetch(`/api/payments?userId=${user?.id}&role=tenant`)
      const data = await response.json()
      if (response.ok) {
        setPayments(data.payments)
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
    }
  }

  const fetchCurrentProperty = async () => {
    try {
      const response = await fetch(`/api/rentals/current?userId=${user?.id}`)
      const data = await response.json()
      if (response.ok) {
        setCurrentProperty(data.property)
      }
    } catch (error) {
      console.error("Error fetching current property:", error)
    }
  }

  const handleMaintenanceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmittingMaintenance(true)

    const formData = new FormData(e.currentTarget)
    const requestData = {
      title: formData.get("title"),
      description: formData.get("description"),
      priority: formData.get("priority"),
      category: formData.get("category"),
      tenantId: user?.id,
      propertyId: currentProperty?.id,
    }

    try {
      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        toast({
          title: "Maintenance request submitted",
          description: "Your request has been sent to the landlord.",
        })
        setIsMaintenanceDialogOpen(false)
        fetchMaintenanceRequests()
        ;(e.target as HTMLFormElement).reset()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit maintenance request.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingMaintenance(false)
    }
  }

  const handlePayment = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: "credit_card" }),
      })

      if (response.ok) {
        toast({
          title: "Payment successful",
          description: "Your rent payment has been processed.",
        })
        fetchPayments()
      }
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment.",
        variant: "destructive",
      })
    }
  }

  const statsCards = [
    {
      title: "Monthly Rent",
      value: `$${stats?.monthlyRent || 0}`,
      change: "Due in 5 days",
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Lease Duration",
      value: "8 months left",
      change: "Expires Dec 2024",
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Maintenance Requests",
      value: stats?.maintenanceRequests || 0,
      change: "1 pending",
      icon: Wrench,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
    {
      title: "Messages",
      value: stats?.unreadMessages || 0,
      change: "2 unread",
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tenant Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your rental and communicate with your landlord</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isMaintenanceDialogOpen} onOpenChange={setIsMaintenanceDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Wrench className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Maintenance Request</DialogTitle>
                <DialogDescription>
                  Describe the issue you're experiencing and we'll notify your landlord.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" placeholder="Brief description of the issue" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="hvac">HVAC</SelectItem>
                      <SelectItem value="appliances">Appliances</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select name="priority" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Provide detailed information about the issue"
                    required
                  />
                </div>
                <Button type="submit" disabled={isSubmittingMaintenance}>
                  {isSubmittingMaintenance ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact Landlord
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.change}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-full`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Property */}
        <Card>
          <CardHeader>
            <CardTitle>My Rental Property</CardTitle>
            <CardDescription>Details about your current rental</CardDescription>
          </CardHeader>
          <CardContent>
            {currentProperty ? (
              <div className="space-y-4">
                <img
                  src={currentProperty.images?.[0] || "/placeholder.svg?height=200&width=300"}
                  alt={currentProperty.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{currentProperty.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{currentProperty.location}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Landlord</p>
                    <p className="font-medium">{currentProperty.landlord?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Monthly Rent</p>
                    <p className="font-medium">${currentProperty.monthly_rent}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Lease Start</p>
                    <p className="font-medium">{currentProperty.start_date}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Lease End</p>
                    <p className="font-medium">{currentProperty.end_date}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Home className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex-1">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Rent
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Pay Rent</DialogTitle>
                        <DialogDescription>Pay your monthly rent of ${currentProperty.monthly_rent}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span>Monthly Rent</span>
                            <span className="font-semibold">${currentProperty.monthly_rent}</span>
                          </div>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => {
                            // Handle payment logic here
                            toast({
                              title: "Payment processed",
                              description: "Your rent payment has been submitted.",
                            })
                            setIsPaymentDialogOpen(false)
                          }}
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          Pay Now
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Home className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">No active rental found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Maintenance Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Requests</CardTitle>
            <CardDescription>Track your maintenance requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {maintenanceRequests.length > 0 ? (
                maintenanceRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex-shrink-0">
                      {request.status === "pending" && <Clock className="h-5 w-5 text-orange-600" />}
                      {request.status === "in-progress" && <AlertCircle className="h-5 w-5 text-blue-600" />}
                      {request.status === "completed" && <CheckCircle className="h-5 w-5 text-green-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{request.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge
                        variant={
                          request.status === "completed"
                            ? "default"
                            : request.status === "in-progress"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {request.status}
                      </Badge>
                      <Badge
                        variant={
                          request.priority === "urgent"
                            ? "destructive"
                            : request.priority === "high"
                              ? "destructive"
                              : request.priority === "medium"
                                ? "default"
                                : "secondary"
                        }
                        className="text-xs"
                      >
                        {request.priority}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">No maintenance requests</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Your recent rent payments and transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.length > 0 ? (
              payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-full">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{payment.type} Payment</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Due: {new Date(payment.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${payment.amount}</p>
                    <Badge
                      variant={
                        payment.status === "completed"
                          ? "default"
                          : payment.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">No payment history</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
