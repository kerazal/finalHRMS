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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Bed, 
  Bath, 
  Users,
  Upload,
  X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Property {
  id: string
  title: string
  description: string
  location: string
  price: number
  bedrooms: number
  bathrooms: number
  area: number
  type: string
  available: boolean
  approved: boolean
  featured: boolean
  images: string[]
  landlord_id: string
  created_at: string
  landlord: {
    id: string
    name: string
    email: string
    phone: string
    profile_picture_url: string
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

export function AdminPropertyManagement() {
  const { toast } = useToast()
  const [properties, setProperties] = useState<Property[]>([])
  const [landlords, setLandlords] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [approvalReason, setApprovalReason] = useState("")
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    fetchProperties()
    fetchLandlords()
  }, [])

  const fetchProperties = async () => {
    try {
      const response = await fetch("/api/properties?adminView=true")
      const data = await response.json()
      if (response.ok) {
        setProperties(data.properties)
      }
    } catch (error) {
      console.error("Error fetching properties:", error)
      toast({
        title: "Error",
        description: "Failed to fetch properties",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLandlords = async () => {
    try {
      const response = await fetch("/api/admin/users?role=landlord")
      const data = await response.json()
      if (response.ok) {
        setLandlords(data.users)
      }
    } catch (error) {
      console.error("Error fetching landlords:", error)
    }
  }

  const handleCreateProperty = async () => {
    try {
      const formDataToSend = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "images") {
          (value as File[]).forEach((file) => {
            formDataToSend.append("photos", file)
          })
        } else {
          formDataToSend.append(key, String(value))
        }
      })

      const response = await fetch("/api/properties", {
        method: "POST",
        body: formDataToSend,
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Property created successfully",
        })
        setIsCreateOpen(false)
        resetForm()
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
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "images") {
          (value as File[]).forEach((file) => {
            formDataToSend.append("photos", file)
          })
        } else {
          formDataToSend.append(key, String(value))
        }
      })

      const response = await fetch(`/api/admin/properties/${selectedProperty.id}`, {
        method: "PATCH",
        body: formDataToSend,
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Property updated successfully",
        })
        setIsEditOpen(false)
        resetForm()
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
        setIsDeleteOpen(false)
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

  const handlePropertyApproval = async (approved: boolean) => {
    if (!selectedProperty) return

    try {
      const response = await fetch(`/api/admin/properties/${selectedProperty.id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approved,
          reason: !approved ? approvalReason : undefined
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Property ${approved ? 'approved' : 'rejected'} successfully`,
        })
        setIsViewOpen(false)
        setSelectedProperty(null)
        setApprovalReason("")
        fetchProperties()
      } else {
        toast({
          title: "Error",
          description: "Failed to update property approval",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update property approval",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
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

  const openEditDialog = (property: Property) => {
    setSelectedProperty(property)
    setFormData({
      title: property.title,
      description: property.description,
      location: property.location,
      price: property.price.toString(),
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      area: property.area.toString(),
      type: property.type,
      landlord_id: property.landlord_id,
      available: property.available,
      approved: property.approved,
      featured: property.featured,
      images: []
    })
    setIsEditOpen(true)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsCreateOpen(true)
  }

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.landlord?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false
    
    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && !property.approved) ||
      (filter === "approved" && property.approved) ||
      (filter === "available" && property.available) ||
      (filter === "rented" && !property.available)
    
    return matchesSearch && matchesFilter
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Property Management</h1>
            <p className="text-gray-600">Manage all properties on the platform</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Property Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all properties on the platform</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>

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
            <Select value={filter} onValueChange={setFilter}>
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
                      onClick={() => {
                        setSelectedProperty(property)
                        setIsViewOpen(true)
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(property)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedProperty(property)
                        setIsDeleteOpen(true)
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
              {searchTerm || filter !== "all" 
                ? "Try adjusting your search or filters"
                : "Get started by adding your first property"
              }
            </p>
            {!searchTerm && filter === "all" && (
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Property Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
            <DialogDescription>
              Create a new property listing for the platform
            </DialogDescription>
          </DialogHeader>
          <PropertyForm
            formData={formData}
            setFormData={setFormData}
            landlords={landlords}
            onSubmit={handleCreateProperty}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Property Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
            <DialogDescription>
              Update property information and details
            </DialogDescription>
          </DialogHeader>
          <PropertyForm
            formData={formData}
            setFormData={setFormData}
            landlords={landlords}
            onSubmit={handleUpdateProperty}
            onCancel={() => setIsEditOpen(false)}
            isEdit={true}
            selectedProperty={selectedProperty}
          />
        </DialogContent>
      </Dialog>

      {/* View Property Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Property Details</DialogTitle>
            <DialogDescription>
              Review property information and approve or reject
            </DialogDescription>
          </DialogHeader>
          {selectedProperty && (
            <PropertyDetailView
              property={selectedProperty}
              onApprove={() => handlePropertyApproval(true)}
              onReject={() => handlePropertyApproval(false)}
              approvalReason={approvalReason}
              setApprovalReason={setApprovalReason}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this property? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProperty}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Property Form Component
function PropertyForm({ 
  formData, 
  setFormData, 
  landlords, 
  onSubmit, 
  onCancel, 
  isEdit = false,
  selectedProperty 
}: {
  formData: any
  setFormData: (data: any) => void
  landlords: User[]
  onSubmit: () => void
  onCancel: () => void
  isEdit?: boolean
  selectedProperty?: Property | null
}) {
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
        <Label htmlFor="landlord">Landlord</Label>
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

// Property Detail View Component
function PropertyDetailView({ 
  property, 
  onApprove, 
  onReject, 
  approvalReason, 
  setApprovalReason 
}: {
  property: Property
  onApprove: () => void
  onReject: () => void
  approvalReason: string
  setApprovalReason: (reason: string) => void
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">{property.title}</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{property.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span>${property.price}/month</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Bed className="h-4 w-4 text-gray-500" />
                {property.bedrooms} bedrooms
              </span>
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4 text-gray-500" />
                {property.bathrooms} bathrooms
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-500">Area:</span> {property.area} sq ft
            </div>
            <div>
              <span className="text-sm text-gray-500">Type:</span> {property.type}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Landlord Information</h4>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Avatar>
              <AvatarImage src={property.landlord?.profile_picture_url} />
              <AvatarFallback>{property.landlord?.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{property.landlord?.name || 'Unknown Landlord'}</p>
              <p className="text-sm text-gray-600">{property.landlord?.email || 'No email'}</p>
              {property.landlord?.phone && (
                <p className="text-sm text-gray-600">{property.landlord.phone}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Description</h4>
        <p className="text-gray-700">{property.description}</p>
      </div>

      {property.images && property.images.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Property Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {property.images.map((image, index) => (
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

      {!property.approved && (
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
            <Button variant="outline" onClick={onReject} disabled={!approvalReason.trim()}>
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button onClick={onApprove}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 