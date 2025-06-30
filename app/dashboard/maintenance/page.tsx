"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Wrench, Plus, Search, Clock, CheckCircle, AlertCircle, XCircle, Eye } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

export default function MaintenancePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [requests, setRequests] = useState<any[]>([])
  const [filteredRequests, setFilteredRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchMaintenanceRequests()
  }, [user])

  useEffect(() => {
    filterRequests()
  }, [requests, searchTerm, statusFilter, priorityFilter])

  const fetchMaintenanceRequests = async () => {
    try {
      const endpoint =
        user?.role === "admin" ? "/api/admin/maintenance" : `/api/maintenance?userId=${user?.id}&role=${user?.role}`

      const response = await fetch(endpoint)
      const data = await response.json()

      if (response.ok) {
        setRequests(data.requests || [])
      }
    } catch (error) {
      console.error("Error fetching maintenance requests:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterRequests = () => {
    const filtered = requests.filter((request) => {
      const matchesSearch =
        request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.property_title?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || request.status === statusFilter
      const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })

    setFilteredRequests(filtered)
  }

  const handleSubmitRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.target as HTMLFormElement)
    const requestData = {
      title: formData.get("title"),
      description: formData.get("description"),
      priority: formData.get("priority"),
      category: formData.get("category"),
      tenant_id: user?.id,
      property_id: formData.get("property_id"),
    }

    try {
      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        toast({ title: "Success", description: "Maintenance request submitted" })
        setIsAddDialogOpen(false)
        (e.target as HTMLFormElement).reset()
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit request", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/maintenance/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast({ title: "Success", description: "Request status updated" })
        fetchMaintenanceRequests()
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      completed: "default",
      "in-progress": "default",
      pending: "secondary",
      cancelled: "destructive",
    }
    return <Badge variant={variants[status] as "default" | "destructive" | "secondary" | "outline"}>{status}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      urgent: "destructive",
      high: "destructive",
      medium: "default",
      low: "secondary",
    }
    return <Badge variant={variants[priority] as "default" | "destructive" | "secondary" | "outline"}>{priority}</Badge>
  }

  const getRequestCounts = () => {
    return {
      total: filteredRequests.length,
      pending: filteredRequests.filter((r) => r.status === "pending").length,
      inProgress: filteredRequests.filter((r) => r.status === "in-progress").length,
      completed: filteredRequests.filter((r) => r.status === "completed").length,
    }
  }

  const counts = getRequestCounts()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
            <p className="text-muted-foreground">
              Manage maintenance requests and repairs
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.total}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{counts.pending}</div>
              <p className="text-xs text-muted-foreground">
                -3 from last week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{counts.inProgress}</div>
              <p className="text-xs text-muted-foreground">
                +1 from last week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{counts.completed}</div>
              <p className="text-xs text-muted-foreground">
                +4 from last week
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Maintenance Requests</CardTitle>
            <CardDescription>
              Latest maintenance requests and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">Leaky Faucet</p>
                    <p className="text-sm text-muted-foreground">Property #1234 - Kitchen</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">Pending</Badge>
                  <p className="text-sm text-muted-foreground mt-1">2 days ago</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Wrench className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">HVAC Repair</p>
                    <p className="text-sm text-muted-foreground">Property #5678 - Living Room</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="default">In Progress</Badge>
                  <p className="text-sm text-muted-foreground mt-1">1 day ago</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Light Bulb Replacement</p>
                    <p className="text-sm text-muted-foreground">Property #9012 - Bedroom</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline">Completed</Badge>
                  <p className="text-sm text-muted-foreground mt-1">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
