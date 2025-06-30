"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Building, DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock, Search, Filter, Home, XCircle, Eye, MessageSquare, MapPin, Plus, Edit, Trash2, Bed, Bath, X } from "lucide-react"
import { useStats } from "@/hooks/use-stats"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { AdminMessaging } from "./admin-messaging"

interface Property {
  id: string
  title: string
  location: string
  price: number
  bedrooms: number
  bathrooms: number
  type: string
  approved: boolean
  available: boolean
  images: string[]
  landlord: {
    id: string
    name: string
    email: string
    profile_picture_url?: string
    phone?: string
  }
  created_at: string
  description?: string
  area?: number
  landlord_id: string
  featured?: boolean
}

interface User {
  id: string
  name: string
  email: string
  role: string
  verified: boolean
  created_at: string
  profile_picture_url?: string
  phone?: string
}

interface MaintenanceRequest {
  id: string
  title: string
  description: string
  priority: string
  status: string
  property_id: string
  tenant_id: string
  created_at: string
  tenant: {
    name: string
    email: string
  }
  property: {
    title: string
  }
  tenant_name?: string
}

interface Payment {
  id: string
  tenant_name: string
  property_title: string
  amount: number
  status: string
  created_at: string
  commission_amount?: number
  payout_status?: string
}

export function AdminDashboard() {
  const { stats, isLoading } = useStats()
  const { user } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [userFilter, setUserFilter] = useState("all")
  const [propertyFilter, setPropertyFilter] = useState("all")
  const [isApprovalOpen, setIsApprovalOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [approvalReason, setApprovalReason] = useState("")
  
  // Enhanced property management states
  const [isCreatePropertyOpen, setIsCreatePropertyOpen] = useState(false)
  const [isEditPropertyOpen, setIsEditPropertyOpen] = useState(false)
  const [isDeletePropertyOpen, setIsDeletePropertyOpen] = useState(false)
  const [propertyFormData, setPropertyFormData] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    type: "",
    landlord_id: "",
    available: true,
    approved: false,
    featured: false,
    images: [] as File[]
  })

  // Add state for detail view
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userProperties, setUserProperties] = useState<Property[]>([])
  const [userBookings, setUserBookings] = useState<any[]>([])

  // Add state for selected user profile (with documents)
  const [selectedUserProfile, setSelectedUserProfile] = useState<any>(null)

  // UI guard: Only allow admin users
  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Access denied. Admins only.</p>
      </div>
    )
  }

  useEffect(() => {
    if (user) {
      fetchUsers()
      fetchProperties()
      fetchPayments()
      fetchMaintenanceRequests()
    }
  }, [user])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      const data = await response.json()
      if (response.ok) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchProperties = async () => {
    try {
      const response = await fetch("/api/properties?adminView=true")
      const data = await response.json()
      if (response.ok) {
        setProperties(data.properties)
      }
    } catch (error) {
      console.error("Error fetching properties:", error)
    }
  }

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/admin/payments")
      const data = await response.json()
      if (response.ok) {
        setPayments(data.payments)
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
    }
  }

  const fetchMaintenanceRequests = async () => {
    try {
      const response = await fetch("/api/maintenance")
      const data = await response.json()
      if (response.ok) {
        setMaintenanceRequests(data.requests)
      }
    } catch (error) {
      console.error("Error fetching maintenance requests:", error)
    }
  }

  const verifyUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/verify`, {
        method: "PATCH"
      })

      if (response.ok) {
        toast({
          title: "User verified",
          description: "User has been verified successfully",
        })
        fetchUsers()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify user",
        variant: "destructive",
      })
    }
  }

  const handlePropertyApproval = async (approved: boolean) => {
    if (!selectedProperty) return

    // For rejection, ensure reason is provided
    if (!approved && !approvalReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      })
      return
    }

    try {
      // Debug log: show payload being sent
      console.log("APPROVE PAYLOAD", {
        approved,
        reason: !approved ? approvalReason : undefined
      })
      const response = await fetch(`/api/admin/properties/${selectedProperty.id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approved,
          reason: !approved ? approvalReason : undefined
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Success",
          description: result.message || `Property ${approved ? 'approved' : 'rejected'} successfully`,
        })
        setIsApprovalOpen(false)
        setSelectedProperty(null)
        setApprovalReason("")
        fetchProperties() // Refresh the properties list
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update property approval status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Property approval error:", error)
      toast({
        title: "Error",
        description: "Failed to update property approval status. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Enhanced property management functions
  const handleCreateProperty = async () => {
    try {
      const formDataToSend = new FormData()
      
      // Add all form fields
      formDataToSend.append('title', propertyFormData.title)
      formDataToSend.append('description', propertyFormData.description)
      formDataToSend.append('location', propertyFormData.location)
      formDataToSend.append('price', propertyFormData.price)
      formDataToSend.append('bedrooms', propertyFormData.bedrooms)
      formDataToSend.append('bathrooms', propertyFormData.bathrooms)
      formDataToSend.append('area', propertyFormData.area)
      formDataToSend.append('type', propertyFormData.type)
      formDataToSend.append('landlord_id', propertyFormData.landlord_id)
      
      // Add images
      if (propertyFormData.images && propertyFormData.images.length > 0) {
        propertyFormData.images.forEach((file: File) => {
          formDataToSend.append('photos', file)
        })
      }

      const response = await fetch("/api/properties", {
        method: "POST",
        body: formDataToSend,
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Property created successfully",
        })
        setIsCreatePropertyOpen(false)
        resetPropertyForm()
        fetchProperties()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to create property",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create property",
        variant: "destructive",
      })
    }
  }

  const handleUpdateProperty = async () => {
    if (!selectedProperty) return

    try {
      const formDataToSend = new FormData()
      
      // Add all form fields
      formDataToSend.append('title', propertyFormData.title)
      formDataToSend.append('description', propertyFormData.description)
      formDataToSend.append('location', propertyFormData.location)
      formDataToSend.append('price', propertyFormData.price)
      formDataToSend.append('bedrooms', propertyFormData.bedrooms)
      formDataToSend.append('bathrooms', propertyFormData.bathrooms)
      formDataToSend.append('area', propertyFormData.area)
      formDataToSend.append('type', propertyFormData.type)
      formDataToSend.append('landlord_id', propertyFormData.landlord_id)
      formDataToSend.append('available', propertyFormData.available.toString())
      formDataToSend.append('approved', propertyFormData.approved.toString())
      formDataToSend.append('featured', propertyFormData.featured.toString())
      
      // Add new images as 'photos'
      if (propertyFormData.images && propertyFormData.images.length > 0) {
        propertyFormData.images.forEach((file: File) => {
          formDataToSend.append('photos', file)
        })
      }

      // Add existing images if any (for edit)
      if (selectedProperty && selectedProperty.images && selectedProperty.images.length > 0) {
        formDataToSend.append('existingImages', selectedProperty.images.join(','))
      }

      const response = await fetch(`/api/admin/properties/${selectedProperty.id}`, {
        method: "PATCH",
        body: formDataToSend,
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Property updated successfully",
        })
        setIsEditPropertyOpen(false)
        resetPropertyForm()
        fetchProperties()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update property",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update property",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProperty = async () => {
    if (!selectedProperty) return

    try {
      const response = await fetch(`/api/admin/properties/${selectedProperty.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Property deleted successfully",
        })
        setIsDeletePropertyOpen(false)
        setSelectedProperty(null)
        fetchProperties()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to delete property",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      })
    }
  }

  const resetPropertyForm = () => {
    setPropertyFormData({
      title: "",
      description: "",
      location: "",
      price: "",
      bedrooms: "",
      bathrooms: "",
      area: "",
      type: "",
      landlord_id: "",
      available: true,
      approved: false,
      featured: false,
      images: []
    })
  }

  const openEditPropertyDialog = (property: Property) => {
    setSelectedProperty(property)
    setPropertyFormData({
      title: property.title,
      description: property.description || "",
      location: property.location,
      price: property.price.toString(),
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      area: property.area?.toString() || "",
      type: property.type,
      landlord_id: property.landlord_id || property.landlord?.id,
      available: property.available,
      approved: property.approved,
      featured: property.featured || false,
      images: []
    })
    setIsEditPropertyOpen(true)
  }

  const openCreatePropertyDialog = () => {
    resetPropertyForm()
    setIsCreatePropertyOpen(true)
  }

  // Fetch extra details when opening detail view
  const openDetailView = async (user: User) => {
    setSelectedUser(user)
    setIsDetailOpen(true)
    try {
      const res = await fetch(`/api/users/${user.id}/settings`)
      const data = await res.json()
      setSelectedUserProfile(data.profile)
    } catch (err) {
      setSelectedUserProfile(null)
    }
    if (user.role === "landlord") {
      const res = await fetch(`/api/properties?landlord_id=${user.id}`)
      const data = await res.json()
      setUserProperties(data.properties || [])
      setUserBookings([])
    } else if (user.role === "tenant") {
      const res = await fetch(`/api/rentals?tenant_id=${user.id}`)
      const data = await res.json()
      setUserBookings(data.rentals || [])
      setUserProperties([])
    } else {
      setUserProperties([])
      setUserBookings([])
    }
  }

  const statsCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Active Properties",
      value: stats?.activeProperties || 0,
      change: "+8%",
      icon: Building,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Monthly Revenue",
      value: `$${stats?.monthlyRevenue?.toLocaleString() || 0}`,
      change: "+15%",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Growth Rate",
      value: "23%",
      change: "+5%",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
  ]

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = userFilter === "all" || user.role === userFilter
    return matchesSearch && matchesFilter
  })

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      propertyFilter === "all" ||
      (propertyFilter === "pending" && !property.approved) ||
      (propertyFilter === "approved" && property.approved)
    return matchesSearch && matchesFilter
  })

  // Chart data
  const monthlyRevenue = [
    { month: "Jan", revenue: 15000 },
    { month: "Feb", revenue: 18000 },
    { month: "Mar", revenue: 22000 },
    { month: "Apr", revenue: 20000 },
    { month: "May", revenue: 25000 },
    { month: "Jun", revenue: 28000 },
  ]

  const propertyStatus = [
    { name: "Approved", value: properties.filter(p => p.approved).length, color: "#10b981" },
    { name: "Pending", value: properties.filter(p => !p.approved).length, color: "#f59e0b" },
    { name: "Rented", value: 12, color: "#3b82f6" },
  ]

  const userRoles = [
    { role: "Landlords", count: users.filter(u => u.role === "landlord").length },
    { role: "Tenants", count: users.filter(u => u.role === "tenant").length },
    { role: "Admins", count: users.filter(u => u.role === "admin").length },
  ]

  const maintenanceByStatus = [
    { status: "Pending", count: maintenanceRequests.filter(r => r.status === "pending").length },
    { status: "In Progress", count: maintenanceRequests.filter(r => r.status === "in-progress").length },
    { status: "Completed", count: maintenanceRequests.filter(r => r.status === "completed").length },
  ]

  const pendingProperties = properties.filter(p => !p.approved)
  const pendingUsers = users.filter(u => !u.verified)

  const openPropertyDetails = async (propertyId: string) => {
    try {
      const res = await fetch(`/api/admin/properties/${propertyId}`);
      const data = await res.json();
      setSelectedProperty(data.property);
      setIsApprovalOpen(true);
    } catch (err) {
      setSelectedProperty(null);
      setIsApprovalOpen(true);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage platform users, properties, and system settings</p>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users, properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Export Data
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
                    <p className="text-sm text-green-600 font-medium">{stat.change} from last month</p>
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
        {/* User Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage platform users and verification</CardDescription>
              </div>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="landlord">Landlords</SelectItem>
                  <SelectItem value="tenant">Tenants</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredUsers.length > 0 ? (
                filteredUsers.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.verified ? "default" : "secondary"}>
                        {user.verified ? "Verified" : "Pending"}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => openDetailView(user)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Detail View
                      </Button>
                      {!user.verified && (
                        <Button size="sm" onClick={() => verifyUser(user.id)}>
                          Verify
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">No users found</p>
                </div>
              )}
            </div>
            {filteredUsers.length > 5 && (
              <div className="mt-4">
                <Button variant="outline" className="w-full bg-transparent">
                  View All Users ({filteredUsers.length})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Property Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Property Management</CardTitle>
                <CardDescription>Review and approve property listings</CardDescription>
              </div>
              <div className="flex gap-2">
              <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
                <Button size="sm" onClick={openCreatePropertyDialog}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Property
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredProperties.length > 0 ? (
                filteredProperties.slice(0, 5).map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={property.images?.[0] || "/placeholder.svg?height=40&width=60"}
                        alt={property.title}
                        className="w-12 h-8 object-cover rounded"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{property.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{property.location}</p>
                        <p className="text-xs font-semibold text-green-600">${property.price}/month</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={property.approved ? "default" : "secondary"}>
                        {property.approved ? "Approved" : "Pending"}
                      </Badge>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openPropertyDetails(property.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {!property.approved && (
                          <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProperty(property)
                                handlePropertyApproval(true)
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedProperty(property)
                                setApprovalReason("")
                            setIsApprovalOpen(true)
                          }}
                        >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                        </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditPropertyDialog(property)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProperty(property)
                            setIsDeletePropertyOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">No properties found</p>
                </div>
              )}
            </div>
            {filteredProperties.length > 5 && (
              <div className="mt-4">
                <Button variant="outline" className="w-full bg-transparent">
                  View All Properties ({filteredProperties.length})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest platform activities and system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {maintenanceRequests.slice(0, 5).map((request) => (
              <div key={request.id} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex-shrink-0">
                  {request.status === "pending" && <Clock className="h-5 w-5 text-orange-600" />}
                  {request.status === "in-progress" && <AlertCircle className="h-5 w-5 text-blue-600" />}
                  {request.status === "completed" && <CheckCircle className="h-5 w-5 text-green-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{request.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {request.tenant_name} • {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Overview</CardTitle>
          <CardDescription>Recent transactions and payment status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Payout</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.slice(0, 5).map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.tenant_name}</TableCell>
                  <TableCell>{payment.property_title}</TableCell>
                  <TableCell>${payment.amount}</TableCell>
                  <TableCell>${payment.commission_amount?.toFixed(2) ?? '-'}</TableCell>
                  <TableCell>
                    <Badge variant={payment.payout_status === 'completed' ? 'default' : payment.payout_status === 'pending' ? 'secondary' : 'destructive'}>
                      {payment.payout_status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="properties" className="space-y-4">
        <TabsList>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-4">
          {/* Property Management Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Property Management</h2>
              <p className="text-gray-600">Manage all properties on the platform</p>
            </div>
            <Button onClick={openCreatePropertyDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>

          {/* Pending Properties Section */}
          {pendingProperties.length > 0 && (
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Pending Approvals ({pendingProperties.length})
                </CardTitle>
                <CardDescription>Properties waiting for admin approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                  {pendingProperties.slice(0, 3).map((property) => (
                    <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        {property.images && property.images.length > 0 && (
                          <img 
                            src={property.images[0]} 
                            alt={property.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold">{property.title}</h3>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {property.location}
                          </p>
                          <p className="text-sm">${property.price}/month • {property.bedrooms} bed, {property.bathrooms} bath</p>
                          <p className="text-xs text-gray-500">
                            Submitted by {property.landlord?.name || 'Unknown Landlord'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openPropertyDetails(property.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedProperty(property)
                            handlePropertyApproval(true)
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProperty(property)
                            setApprovalReason("")
                            setIsApprovalOpen(true)
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pendingProperties.length > 3 && (
                    <div className="text-center pt-2">
                      <Button variant="outline" onClick={() => setPropertyFilter("pending")}>
                        View All Pending Properties ({pendingProperties.length})
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters and Search */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search properties, locations, landlords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    <SelectItem value="pending">Pending Approval</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="rented">Rented</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="relative mb-4">
                      <img
                        src={property.images?.[0] || "/placeholder.svg"}
                        alt={property.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Badge variant={property.approved ? "default" : "secondary"}>
                          {property.approved ? "Approved" : "Pending"}
                        </Badge>
                        <Badge variant={property.available ? "default" : "destructive"}>
                          {property.available ? "Available" : "Rented"}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{property.title}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {property.location}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Bed className="h-4 w-4" />
                            {property.bedrooms}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bath className="h-4 w-4" />
                            {property.bathrooms}
                          </span>
                        </div>
                        <span className="font-semibold text-green-600">
                          ${property.price}/month
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{property.landlord?.name || 'Unknown Landlord'}</span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openPropertyDetails(property.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {!property.approved && (
                          <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProperty(property)
                            handlePropertyApproval(true)
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProperty(property)
                            setApprovalReason("")
                            setIsApprovalOpen(true)
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditPropertyDialog(property)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProperty(property)
                            setIsDeletePropertyOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
              </div>

          {filteredProperties.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No properties found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || propertyFilter !== "all" 
                    ? "Try adjusting your search or filters"
                    : "Get started by adding your first property"
                  }
                </p>
                {!searchTerm && propertyFilter === "all" && (
                  <Button onClick={openCreatePropertyDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                  </Button>
                )}
            </CardContent>
          </Card>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and verifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profile_picture_url} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{user.role}</Badge>
                          <Badge variant={user.verified ? "default" : "secondary"}>
                            {user.verified ? "Verified" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openDetailView(user)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Detail View
                      </Button>
                      {!user.verified && (
                        <Button
                          size="sm"
                          onClick={() => verifyUser(user.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Requests</CardTitle>
              <CardDescription>Monitor and manage maintenance requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{request.title}</h3>
                      <p className="text-sm text-gray-600">{request.description}</p>
                      <p className="text-sm">Property: {request.property?.title || 'Unknown Property'}</p>
                      <p className="text-sm">Tenant: {request.tenant?.name || 'Unknown Tenant'}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{request.priority}</Badge>
                        <Badge variant={request.status === "pending" ? "secondary" : "default"}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Contact
                      </Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messaging" className="space-y-4">
          <AdminMessaging />
        </TabsContent>
      </Tabs>

      {/* Property Approval Dialog */}
      <Dialog open={isApprovalOpen} onOpenChange={setIsApprovalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Property Details</DialogTitle>
            <DialogDescription>
              Review property information and manage approval status
            </DialogDescription>
          </DialogHeader>
          {selectedProperty && (
            <div className="space-y-6">
              {/* Property Images */}
              {selectedProperty.images && selectedProperty.images.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Property Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedProperty.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Property image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Property Information */}
                <div>
                  <h4 className="font-semibold mb-4">Property Information</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500">Title:</span>
                      <p className="font-medium">{selectedProperty.title}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Description:</span>
                      <p className="text-sm">{selectedProperty.description}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Location:</span>
                      <p className="font-medium">{selectedProperty.location}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Price:</span>
                      <p className="font-medium text-green-600">${selectedProperty.price}/month</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Bedrooms:</span>
                        <p className="font-medium">{selectedProperty.bedrooms}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Bathrooms:</span>
                        <p className="font-medium">{selectedProperty.bathrooms}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Area:</span>
                        <p className="font-medium">{selectedProperty.area} sq ft</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Type:</span>
                      <p className="font-medium capitalize">{selectedProperty.type}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={selectedProperty.approved ? "default" : "secondary"}>
                        {selectedProperty.approved ? "Approved" : "Pending Approval"}
                      </Badge>
                      <Badge variant={selectedProperty.available ? "default" : "destructive"}>
                        {selectedProperty.available ? "Available" : "Rented"}
                      </Badge>
                      {selectedProperty.featured && (
                        <Badge variant="outline">Featured</Badge>
                      )}
                    </div>
                </div>
              </div>
              
                {/* Landlord Information */}
              <div>
                  <h4 className="font-semibold mb-4">Landlord Information</h4>
                  <div className="flex items-center gap-4 p-4 bg-green-100 rounded-lg border">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedProperty.landlord?.profile_picture_url || ''} />
                      <AvatarFallback>{selectedProperty.landlord?.name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-bold text-lg text-black">{selectedProperty.landlord?.name || 'Unknown Landlord'}</div>
                      <div className="text-black">{selectedProperty.landlord?.email || 'No email'}</div>
                      {selectedProperty.landlord?.phone && (
                        <div className="text-black">{selectedProperty.landlord.phone}</div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">Landlord</Badge>
                        {/* Optionally, show a verified badge if you have that info */}
                    </div>
                  </div>
                  </div>
                </div>
              </div>

              {/* Approval Actions */}
              {!selectedProperty.approved && (
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4">Approval Actions</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="rejection-reason">Rejection Reason (if rejecting)</Label>
                <Textarea
                        id="rejection-reason"
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                        rows={3}
                />
              </div>

                    <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={() => handlePropertyApproval(false)}
                  disabled={!approvalReason.trim()}
                >
                        <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button onClick={() => handlePropertyApproval(true)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Management Actions */}
              <div className="border-t pt-6">
                <h4 className="font-semibold mb-4">Management Actions</h4>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsApprovalOpen(false)
                      openEditPropertyDialog(selectedProperty)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Property
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsApprovalOpen(false)
                      setSelectedProperty(selectedProperty)
                      setIsDeletePropertyOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Property
                  </Button>
                  <Button variant="outline" onClick={() => setIsApprovalOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Property Dialog */}
      <Dialog open={isCreatePropertyOpen} onOpenChange={setIsCreatePropertyOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
            <DialogDescription>
              Create a new property listing for the platform
            </DialogDescription>
          </DialogHeader>
          <PropertyForm
            formData={propertyFormData}
            setFormData={setPropertyFormData}
            onSubmit={handleCreateProperty}
            onCancel={() => setIsCreatePropertyOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Property Dialog */}
      <Dialog open={isEditPropertyOpen} onOpenChange={setIsEditPropertyOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
            <DialogDescription>
              Update property information and details
            </DialogDescription>
          </DialogHeader>
          <PropertyForm
            formData={propertyFormData}
            setFormData={setPropertyFormData}
            onSubmit={handleUpdateProperty}
            onCancel={() => setIsEditPropertyOpen(false)}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Property Dialog */}
      <Dialog open={isDeletePropertyOpen} onOpenChange={setIsDeletePropertyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this property? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeletePropertyOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProperty}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail View Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUserProfile ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUserProfile.profile_picture_url} />
                  <AvatarFallback>{selectedUserProfile.name?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold text-lg">{selectedUserProfile.name}</div>
                  <div className="text-gray-600">{selectedUserProfile.email}</div>
                  <div className="text-gray-600">{selectedUserProfile.phone}</div>
                  <div className="text-gray-600">{selectedUser?.role}</div>
                </div>
              </div>
                <div>
                <div className="font-semibold">About</div>
                <div className="text-gray-700">{selectedUserProfile.about}</div>
                </div>
              {/* ID Documents */}
              <div className="flex gap-4">
                {selectedUserProfile.id_front_url && (
                <div>
                    <div className="font-semibold mb-1">ID Front</div>
                    <img src={selectedUserProfile.id_front_url} alt="ID Front" className="w-40 h-28 object-cover border rounded" />
                    <a href={selectedUserProfile.id_front_url} target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-600 mt-1">View Full</a>
                </div>
                )}
                {selectedUserProfile.id_back_url && (
                <div>
                    <div className="font-semibold mb-1">ID Back</div>
                    <img src={selectedUserProfile.id_back_url} alt="ID Back" className="w-40 h-28 object-cover border rounded" />
                    <a href={selectedUserProfile.id_back_url} target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-600 mt-1">View Full</a>
                </div>
              )}
              </div>
              {/* Landlord Documents */}
              {selectedUserProfile.landlord_documents && selectedUserProfile.landlord_documents.length > 0 && (
                <div>
                  <div className="font-semibold mb-2">Landlord Documents</div>
                  <ul className="list-disc pl-5">
                    {selectedUserProfile.landlord_documents.map((url: string, idx: number) => (
                      <li key={idx}>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                          Document {idx + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500">No user details found.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Property Form Component
function PropertyForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  isEdit = false
}: {
  formData: any
  setFormData: (data: any) => void
  onSubmit: () => void
  onCancel: () => void
  isEdit?: boolean
}) {
  const [landlords, setLandlords] = useState<any[]>([])

  useEffect(() => {
    const fetchLandlords = async () => {
      try {
        const response = await fetch("/api/admin/users?role=landlord")
        const data = await response.json()
        if (response.ok) {
          setLandlords(data.users || [])
        }
      } catch (error) {
        console.error("Error fetching landlords:", error)
      }
    }
    fetchLandlords()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData({ ...formData, images: files })
  }

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_: any, i: number) => i !== index)
    setFormData({ ...formData, images: newImages })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Property title"
          />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Property description"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Property location"
          />
        </div>
        <div>
          <Label htmlFor="price">Price per Month</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input
            id="bedrooms"
            type="number"
            value={formData.bedrooms}
            onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input
            id="bathrooms"
            type="number"
            value={formData.bathrooms}
            onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="area">Area (sq ft)</Label>
          <Input
            id="area"
            type="number"
            value={formData.area}
            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="landlord_id">Landlord</Label>
        <Select value={formData.landlord_id} onValueChange={(value) => setFormData({ ...formData, landlord_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select landlord" />
          </SelectTrigger>
          <SelectContent>
            {landlords.map((landlord) => (
              <SelectItem key={landlord.id} value={landlord.id}>
                {landlord.name} ({landlord.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="available"
            checked={formData.available}
            onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
          />
          <Label htmlFor="available">Available</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="approved"
            checked={formData.approved}
            onChange={(e) => setFormData({ ...formData, approved: e.target.checked })}
          />
          <Label htmlFor="approved">Approved</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
          />
          <Label htmlFor="featured">Featured</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="images">Property Images</Label>
        <Input
          id="images"
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="mt-1"
        />
        {formData.images.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            {formData.images.map((file: File, index: number) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-20 object-cover rounded"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          {isEdit ? "Update Property" : "Create Property"}
        </Button>
      </div>
    </div>
  )
}
