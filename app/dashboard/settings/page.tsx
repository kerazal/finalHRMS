"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { User, Bell, Shield, CreditCard, Upload, Save, Eye, EyeOff, Mail } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    about: "",
    avatar: null as File | null,
    profile_picture_url: "",
  })
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    maintenance_alerts: true,
    payment_reminders: true,
    marketing_emails: false,
  })
  const [security, setSecurity] = useState({
    two_factor_enabled: false,
    login_alerts: true,
    session_timeout: "30",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserSettings()
    }
  }, [user])

  const fetchUserSettings = async () => {
    try {
      const response = await fetch(`/api/users/${user?.id}/settings`)
      const data = await response.json()

      if (response.ok) {
        setProfileData((prev) => ({
          ...prev,
          ...data.profile,
          profile_picture_url: data.profile.profile_picture_url || ""
        }))
        setNotifications(data.notifications || {})
        setSecurity(data.security || {})
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    }
  }

  const updateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const form = e.target as HTMLFormElement
      const formData = new FormData()
      formData.append("name", profileData.name)
      formData.append("email", profileData.email)
      formData.append("phone", profileData.phone)
      formData.append("about", profileData.about)
      if (profileData.avatar) {
        formData.append("profilePicture", profileData.avatar)
      }
      const response = await fetch(`/api/users/${user?.id}/profile`, {
        method: "PATCH",
        body: formData,
      })
      if (response.ok) {
        const result = await response.json()
        toast({ title: "Success", description: "Profile updated successfully" })
        setProfileData((prev) => ({
          ...prev,
          avatar: null,
          profile_picture_url: result.user?.profile_picture_url || prev.profile_picture_url
        }))
        fetchUserSettings()
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const updateNotifications = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/users/${user?.id}/notifications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifications),
      })

      if (response.ok) {
        toast({ title: "Success", description: "Notification preferences updated" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update notifications", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const updateSecurity = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/users/${user?.id}/security`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(security),
      })

      if (response.ok) {
        toast({ title: "Success", description: "Security settings updated" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update security settings", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const changePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.target)
    const passwordData = {
      current_password: formData.get("current_password"),
      new_password: formData.get("new_password"),
      confirm_password: formData.get("confirm_password"),
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({ title: "Error", description: "New passwords don't match", variant: "destructive" })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/users/${user?.id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      })

      if (response.ok) {
        toast({ title: "Success", description: "Password changed successfully" })
        e.target.reset()
      } else {
        const data = await response.json()
        toast({ title: "Error", description: data.error || "Failed to change password", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to change password", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  // Enhanced profile picture upload handler
  const handleAvatarChange = (file: File | null) => {
    if (!file) return
    // Validate file type and size (max 2MB)
    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Only image files are allowed.", variant: "destructive" })
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Error", description: "Image size must be less than 2MB.", variant: "destructive" })
      return
    }
    setProfileData(prev => ({
      ...prev,
      avatar: file,
      profile_picture_url: URL.createObjectURL(file)
    }))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>
              Update your personal information and profile picture
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={updateProfile} className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div
                    className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${dragActive ? 'border-primary bg-primary/10' : 'border-gray-300 bg-gray-100'}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragActive(true) }}
                    onDragLeave={e => { e.preventDefault(); setDragActive(false) }}
                    onDrop={e => {
                      e.preventDefault();
                      setDragActive(false)
                      const file = e.dataTransfer.files[0]
                      handleAvatarChange(file)
                    }}
                    title="Click or drag to upload"
                  >
                    {profileData.profile_picture_url ? (
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={profileData.profile_picture_url} />
                        <AvatarFallback>{profileData.name?.[0] || "?"}</AvatarFallback>
                </Avatar>
                    ) : (
                      <span className="text-gray-400">Upload</span>
                    )}
                <input
                      ref={fileInputRef}
                  type="file"
                  accept="image/*"
                      className="hidden"
                      onChange={e => handleAvatarChange(e.target.files?.[0] || null)}
                />
                    <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow">
                      <Upload className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <span className="block text-xs text-gray-500 mt-2 text-center">Max 2MB. JPG, PNG, GIF.</span>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                      onChange={e => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      required
                />
              </div>
                  <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                      onChange={e => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      required
                />
              </div>
                  <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                      onChange={e => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="about">About</Label>
                <Textarea
                  id="about"
                  value={profileData.about}
                  onChange={e => setProfileData(prev => ({ ...prev, about: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
              </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Notification settings will be implemented here
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

