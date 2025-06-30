"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Home, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  DollarSign, 
  Phone, 
  Mail, 
  MessageSquare,
  Star,
  ArrowLeft,
  CalendarDays,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
  images: string[]
  amenities: string[]
  landlord: {
    id: string
    name: string
    email: string
    phone: string
    profile_picture_url?: string
  }
  created_at: string
  available: boolean
}

export default function PropertyDetailsPage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [bookingStart, setBookingStart] = useState<Date | null>(null)
  const [bookingEnd, setBookingEnd] = useState<Date | null>(null)
  const [bookingMessage, setBookingMessage] = useState("")
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchProperty()
    }
  }, [params.id])

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/properties/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setProperty(data.property)
      } else {
        toast({
          title: "Error",
          description: "Failed to load property details",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load property details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiver_id: property?.landlord.id,
          subject: `Inquiry about ${property?.title}`,
          content: formData.get("message") as string,
        }),
      })

      if (response.ok) {
        toast({
          title: "Message sent",
          description: "Your message has been sent to the landlord",
        })
        setIsContactOpen(false)
        ;(e.target as HTMLFormElement).reset()
      } else {
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    }
  }

  const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!bookingStart || !bookingEnd) {
      toast({ title: "Missing dates", description: "Please select start and end dates.", variant: "destructive" })
      return
    }
    setBookingLoading(true)
    try {
      const response = await fetch("/api/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: property?.id,
          tenant_id: user?.id,
          landlord_id: property?.landlord.id,
          start_date: bookingStart.toISOString(),
          end_date: bookingEnd.toISOString(),
          monthly_rent: property?.price,
          deposit: property?.price, // or another logic
          status: "pending",
          message: bookingMessage,
        }),
      })
      if (response.ok) {
        toast({ title: "Booking Requested", description: "Your booking request has been sent to the landlord." })
        setIsBookingOpen(false)
        setBookingStart(null)
        setBookingEnd(null)
        setBookingMessage("")
      } else {
        const data = await response.json()
        toast({ title: "Error", description: data.error || "Failed to book property", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to book property", variant: "destructive" })
    } finally {
      setBookingLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full border-red-300 shadow-lg">
          <CardHeader className="flex flex-col items-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-2" />
            <CardTitle className="text-red-600">Error Loading Property</CardTitle>
            <CardDescription className="text-center text-gray-600">
              We couldn't load the property details. The property may not exist or there was a network issue.<br />
              Please try again later or return to the <Link href="/properties" className="text-blue-600 underline">properties page</Link>.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Back Button */}
      <Link href="/properties" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to Properties
      </Link>

      {/* Property Images */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
            {property.images && property.images.length > 0 ? (
              <img
                src={property.images[selectedImage]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Home className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
          
          {property.images && property.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? "border-blue-500" : "border-gray-200"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${property.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Property Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{property.title}</h1>
            <p className="text-xl text-gray-600 flex items-center gap-2 mt-2">
              <MapPin className="h-5 w-5" />
              {property.location}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              <DollarSign className="h-4 w-4 mr-1" />
              ${property.price}/month
            </Badge>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {property.type}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Bed className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="font-semibold">{property.bedrooms}</p>
              <p className="text-sm text-gray-600">Bedrooms</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Bath className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="font-semibold">{property.bathrooms}</p>
              <p className="text-sm text-gray-600">Bathrooms</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Square className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="font-semibold">{property.area}</p>
              <p className="text-sm text-gray-600">sq ft</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="text-gray-600 leading-relaxed">{property.description}</p>
          </div>

          {property.amenities && property.amenities.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity, index) => (
                  <Badge key={index} variant="secondary">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Contact Actions */}
          <div className="flex gap-4">
            <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Landlord
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Contact Landlord</DialogTitle>
                  <DialogDescription>
                    Send a message to {property.landlord.name} about this property
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleContact} className="space-y-4">
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Hi, I'm interested in this property..."
                      required
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsContactOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Send Message</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="flex-1">
              <CalendarDays className="h-4 w-4 mr-2" />
              Schedule Viewing
            </Button>

            {user?.role === "tenant" && property.available && (
              <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1" variant="default">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Book Now
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Book this Property</DialogTitle>
                    <DialogDescription>
                      Submit a booking request for <span className="font-semibold">{property.title}</span>
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleBooking} className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <Label>Start Date</Label>
                        <Calendar
                          mode="single"
                          selected={bookingStart}
                          onSelect={setBookingStart}
                          className="border rounded-md"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <Label>End Date</Label>
                        <Calendar
                          mode="single"
                          selected={bookingEnd}
                          onSelect={setBookingEnd}
                          className="border rounded-md"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="booking-message">Message (optional)</Label>
                      <Textarea
                        id="booking-message"
                        value={bookingMessage}
                        onChange={e => setBookingMessage(e.target.value)}
                        placeholder="Add a message for the landlord (optional)"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsBookingOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={bookingLoading}>
                        {bookingLoading ? "Booking..." : "Submit Booking"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      {/* Landlord Information */}
      <Card>
        <CardHeader>
          <CardTitle>About the Landlord</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={property.landlord.profile_picture_url} />
              <AvatarFallback>{property.landlord.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{property.landlord.name}</h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {property.landlord.email}
                </span>
                {property.landlord.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {property.landlord.phone}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={`tel:${property.landlord.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Call ${property.landlord.name}`}
                    >
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>Call landlord</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={`mailto:${property.landlord.email}?subject=Inquiry about ${encodeURIComponent(property.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Email ${property.landlord.name}`}
                    >
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>Email landlord</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 