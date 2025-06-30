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
import { Building, DollarSign, Users, Plus, Eye, Edit, TrendingUp, Wrench, Home, Upload, X, MessageSquare, Calendar, MapPin, Bed, Bath } from "lucide-react"
import { useStats } from "@/hooks/use-stats"
import useAuth from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

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
  created_at: string
  description?: string
}

interface MaintenanceRequest {
  id: string
  title: string
  description: string
  priority: string
  status: string
  created_at: string
}

interface Rental {
  id: string
  property_id: string
  tenant_id: string
  monthly_rent: number
  status: string
  start_date: string
  end_date: string
  tenant: {
    name: string
    email: string
  }
  property: {
    title: string
  }
}

export function LandlordDashboard() {
  const { stats, isLoading } = useStats()
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const [properties, setProperties] = useState<Property[]>([])
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([])
  const [rentals, setRentals] = useState<Rental[]>([])
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false)
  const [isSubmittingProperty, setIsSubmittingProperty] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([])
  const [photoPreview, setPhotoPreview] = useState<string[]>([])
  const [premium, setPremium] = useState(user?.premium)
  const [isPremiumLoading, setIsPremiumLoading] = useState(false)
  const [propertyType, setPropertyType] = useState("")
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  useEffect(() => {
    if (user) {
      fetchProperties()
      fetchMaintenanceRequests()
      fetchRentals()
    }
    setPremium(user?.premium)
  }, [user])

  useEffect(() => {
    // Show modal if at limit and not premium
    if (!premium && properties.length >= 10) {
      setShowPlanModal(true)
    } else {
      setShowPlanModal(false)
    }
  }, [premium, properties.length])

  const fetchProperties = async () => {
    try {
      const response = await fetch("/api/properties?landlord_id=" + user?.id)
      const data = await response.json()
      if (response.ok) {
        setProperties(data.properties)
      }
    } catch (error) {
      console.error("Error fetching properties:", error)
    }
  }

  const fetchMaintenanceRequests = async () => {
    try {
      const response = await fetch("/api/maintenance?landlord_id=" + user?.id)
      const data = await response.json()
      if (response.ok) {
        setMaintenanceRequests(data.requests)
      }
    } catch (error) {
      console.error("Error fetching maintenance requests:", error)
    }
  }

  const fetchRentals = async () => {
    try {
      const response = await fetch("/api/rentals?landlord_id=" + user?.id)
      const data = await response.json()
      if (response.ok) {
        setRentals(data.rentals)
      }
    } catch (error) {
      console.error("Error fetching rentals:", error)
    }
  }

  const handlePhotoUpload = (files: FileList | null) => {
    if (files) {
      const newPhotos = Array.from(files)
      setSelectedPhotos(prev => [...prev, ...newPhotos])
      
      // Create preview URLs
      newPhotos.forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPhotoPreview(prev => [...prev, e.target?.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index))
    setPhotoPreview(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddProperty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmittingProperty(true)

    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not loaded. Please log in again.",
        variant: "destructive",
      })
      setIsSubmittingProperty(false)
      return
    }

    if (selectedPhotos.length === 0) {
      toast({
        title: "Error",
        description: "At least one property photo is required",
        variant: "destructive",
      })
      setIsSubmittingProperty(false)
      return
    }

    if (!propertyType) {
      toast({
        title: "Error",
        description: "Please select a property type",
        variant: "destructive",
      })
      setIsSubmittingProperty(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    selectedPhotos.forEach(photo => {
      formData.append("photos", photo)
    })
    formData.append("landlord_id", user.id)
    formData.append("type", propertyType)

    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Property submitted successfully",
          description: "Your property will be reviewed by admin before being published.",
        })
        setIsAddPropertyOpen(false)
        fetchProperties()
        ;(e.target as HTMLFormElement).reset()
        setSelectedPhotos([])
        setPhotoPreview([])
        setPropertyType("")
      } else {
        let errorMsg = data.error || "Failed to submit property"
        if (data.error && data.error.toLowerCase().includes("landlord not found")) {
          errorMsg = "Your account could not be found as a landlord. Please contact support or try logging out and in again."
        }
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit property",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingProperty(false)
    }
  }

  const updateMaintenanceStatus = async (requestId: string, status: string) => {
    try {
      const response = await fetch(`/api/maintenance/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          title: "Status updated",
          description: "Maintenance request status has been updated.",
        })
        fetchMaintenanceRequests()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
    }
  }

  const handleUpgradeToPremium = async () => {
    if (!user) return
    setIsPremiumLoading(true)
    try {
      const res = await fetch("/api/payments/premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: user.id, 
          email: user.email, 
          name: user.name || user.email?.split('@')[0] || 'User'
        })
      })
      const data = await res.json()
      if (res.ok && data.checkout_url) {
        setIsRedirecting(true)
        window.location.href = data.checkout_url
      } else {
        toast({ 
          title: "Error", 
          description: data.error || "Failed to start payment.", 
          variant: "destructive" 
        })
      }
    } catch (error) {
      console.error("Premium upgrade error:", error)
      toast({ 
        title: "Error", 
        description: "Failed to start payment.", 
        variant: "destructive" 
      })
    } finally {
      setIsPremiumLoading(false)
    }
  }

  // Chart data
  const monthlyRevenue = [
    { month: "Jan", revenue: 2500 },
    { month: "Feb", revenue: 2800 },
    { month: "Mar", revenue: 3200 },
    { month: "Apr", revenue: 3000 },
    { month: "May", revenue: 3500 },
    { month: "Jun", revenue: 3800 },
  ]

  const propertyStatus = [
    { name: "Approved", value: properties.filter(p => p.approved).length, color: "#10b981" },
    { name: "Pending", value: properties.filter(p => !p.approved).length, color: "#f59e0b" },
    { name: "Rented", value: rentals.filter(r => r.status === "active").length, color: "#3b82f6" },
  ]

  const maintenanceByPriority = [
    { priority: "Low", count: maintenanceRequests.filter(r => r.priority === "low").length },
    { priority: "Medium", count: maintenanceRequests.filter(r => r.priority === "medium").length },
    { priority: "High", count: maintenanceRequests.filter(r => r.priority === "high").length },
    { priority: "Urgent", count: maintenanceRequests.filter(r => r.priority === "urgent").length },
  ]

  const statsCards = [
    {
      title: "My Properties",
      value: stats?.myProperties || 0,
      change: "+2 this month",
      icon: Building,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Monthly Income",
      value: `$${stats?.monthlyIncome?.toLocaleString() || 0}`,
      change: "+12% from last month",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Active Tenants",
      value: stats?.activeTenants || 0,
      change: "95% occupancy rate",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Pending Requests",
      value: maintenanceRequests.filter((r) => r.status === "pending").length,
      change: "3 new this week",
      icon: Wrench,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Landlord Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your properties and rentals</p>
        </div>
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Premium Status and Go Premium Button */}
      <div className="mb-6 flex items-center gap-4">
        <Badge variant={premium ? "default" : "secondary"}>
          {premium ? "Premium Landlord" : "Free Landlord"}
        </Badge>
        {!premium && (
          <Button onClick={handleUpgradeToPremium} disabled={isPremiumLoading || isRedirecting}>
            Upgrade to Premium (100,000 ETB)
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold">{properties.length}</p>
              </div>
              <Home className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Rentals</p>
                <p className="text-2xl font-bold">{rentals.filter(r => r.status === "active").length}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold">
                  ${rentals.filter(r => r.status === "active").reduce((sum, r) => sum + r.monthly_rent, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold">{maintenanceRequests.filter(r => r.status === "pending").length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={propertyStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {propertyStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Properties Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>My Properties</CardTitle>
              <CardDescription>Manage your property listings</CardDescription>
            </div>
            <Dialog open={isAddPropertyOpen} onOpenChange={setIsAddPropertyOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Property</DialogTitle>
                  <DialogDescription>
                    Submit a new property for admin approval
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddProperty} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Property Title</Label>
                      <Input id="title" name="title" required />
                    </div>
                    <div>
                      <Label htmlFor="type">Property Type</Label>
                      <Select value={propertyType} onValueChange={setPropertyType} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="house">House</SelectItem>
                          <SelectItem value="condo">Condo</SelectItem>
                          <SelectItem value="studio">Studio</SelectItem>
                        </SelectContent>
                      </Select>
                      <input type="hidden" name="type" value={propertyType} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" name="location" required />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" required />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">Monthly Rent ($)</Label>
                      <Input id="price" name="price" type="number" required />
                    </div>
                    <div>
                      <Label htmlFor="bedrooms">Bedrooms</Label>
                      <Input id="bedrooms" name="bedrooms" type="number" required />
                    </div>
                    <div>
                      <Label htmlFor="bathrooms">Bathrooms</Label>
                      <Input id="bathrooms" name="bathrooms" type="number" required />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="area">Area (sq ft)</Label>
                    <Input id="area" name="area" type="number" required />
                  </div>

                  <div>
                    <Label>Property Photos (Required - At least 1)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e.target.files)}
                        className="hidden"
                        id="photos"
                      />
                      <label htmlFor="photos" className="cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload photos</p>
                      </label>
                    </div>
                    
                    {photoPreview.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {photoPreview.map((preview, index) => (
                          <div key={index} className="relative">
                            <img src={preview} alt="Preview" className="w-full h-20 object-cover rounded" />
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              className="absolute top-0 right-0 h-6 w-6 p-0"
                              onClick={() => removePhoto(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddPropertyOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmittingProperty || !user?.id}>
                      {isSubmittingProperty ? "Submitting..." : "Submit Property"}
                    </Button>
                  </div>
                  {!user?.id && (
                    <p className="text-red-500 text-sm mt-2">User not loaded. Please log in again to add a property.</p>
                  )}
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {properties.map((property) => (
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
                    <p className="text-sm text-gray-600">{property.location}</p>
                    <p className="text-sm">${property.price}/month</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={property.approved ? "default" : "secondary"}>
                    {property.approved ? "Approved" : "Pending Approval"}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => { setSelectedProperty(property); setIsDetailOpen(true); }}>
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {maintenanceRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{request.title}</h3>
                  <p className="text-sm text-gray-600">{request.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{request.priority}</Badge>
                    <Badge variant={request.status === "pending" ? "secondary" : "default"}>
                      {request.status}
                    </Badge>
                  </div>
                </div>
                <Select value={request.status} onValueChange={(value) => updateMaintenanceStatus(request.id, value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Rentals */}
      <Card>
        <CardHeader>
          <CardTitle>Active Rentals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rentals.filter(r => r.status === "active").map((rental) => (
              <div key={rental.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{rental.property.title}</h3>
                  <p className="text-sm text-gray-600">Tenant: {rental.tenant.name}</p>
                  <p className="text-sm">${rental.monthly_rent}/month</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Chat
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

      {/* Premium Plan Modal */}
      <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade Your Plan</DialogTitle>
            <DialogDescription>
              You have reached the free plan limit of 10 property listings. Upgrade to premium to list unlimited properties.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <Button variant="outline" disabled className="w-full">
              Continue with Free Plan (10/10 used)
            </Button>
            <Button onClick={handleUpgradeToPremium} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
              {(isPremiumLoading || isRedirecting) ? "Redirecting..." : "Upgrade to Premium (100,000 ETB)"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Property Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Property Details</DialogTitle>
            <DialogDescription>Full details of your property listing</DialogDescription>
          </DialogHeader>
          {selectedProperty && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">{selectedProperty.title}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{selectedProperty.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span>${selectedProperty.price}/month</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Bed className="h-4 w-4 text-gray-500" />
                        {selectedProperty.bedrooms} bedrooms
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="h-4 w-4 text-gray-500" />
                        {selectedProperty.bathrooms} bathrooms
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Type:</span> {selectedProperty.type}
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Created:</span> {new Date(selectedProperty.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
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
              </div>
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-700">{selectedProperty.description || 'No description provided.'}</p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => {/* TODO: Implement edit logic */}}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => {/* TODO: Implement delete logic */}}>Delete</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
