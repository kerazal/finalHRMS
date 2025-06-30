"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  MessageSquare, 
  Send, 
  Search, 
  Users, 
  Building, 
  Home,
  Clock,
  CheckCircle
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  role: string
  profile_picture_url?: string
}

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  subject: string
  content: string
  read: boolean
  created_at: string
  sender: User
  receiver: User
}

interface Conversation {
  otherUser: User
  lastMessage: Message
  unreadCount: number
}

export function AdminMessaging() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchConversations()
      fetchUsers()
    }
  }, [user])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.otherUser.id)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    try {
      const response = await fetch(`/api/messages/conversations?userId=${user?.id}`)
      const data = await response.json()
      if (response.ok) {
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      const data = await response.json()
      if (response.ok) {
        setUsers(data.users.filter((u: User) => u.id !== user?.id))
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchMessages = async (otherUserId: string) => {
    try {
      const response = await fetch(`/api/messages?userId=${user?.id}&otherUserId=${otherUserId}`)
      const data = await response.json()
      if (response.ok) {
        setMessages(data.messages)
        // Mark messages as read
        markMessagesAsRead(otherUserId)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const markMessagesAsRead = async (otherUserId: string) => {
    try {
      await fetch("/api/messages/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          otherUserId
        })
      })
    } catch (error) {
      console.error("Error marking messages as read:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.id}`
        },
        body: JSON.stringify({
          receiver_id: selectedConversation.otherUser.id,
          content: newMessage,
          subject: "Admin Message"
        })
      })

      if (response.ok) {
        setNewMessage("")
        // Refresh messages
        fetchMessages(selectedConversation.otherUser.id)
        // Refresh conversations to update last message
        fetchConversations()
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

  const startNewConversation = async (targetUser: User) => {
    // Check if conversation already exists
    const existingConversation = conversations.find(
      conv => conv.otherUser.id === targetUser.id
    )
    
    if (existingConversation) {
      setSelectedConversation(existingConversation)
    } else {
      // Create a new conversation entry
      const newConversation: Conversation = {
        otherUser: targetUser,
        lastMessage: {
          id: "",
          sender_id: user?.id || "",
          receiver_id: targetUser.id,
          subject: "",
          content: "",
          read: false,
          created_at: new Date().toISOString(),
          sender: user as User,
          receiver: targetUser
        },
        unreadCount: 0
      }
      setSelectedConversation(newConversation)
      setMessages([])
    }
  }

  const filteredConversations = conversations.filter((conversation) => {
    const matchesSearch = conversation.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conversation.otherUser.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Messaging</h1>
            <p className="text-gray-600">Communicate with tenants and landlords</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-300 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2 animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-300 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Messaging</h1>
          <p className="text-gray-600 dark:text-gray-400">Communicate with tenants and landlords</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversations
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.otherUser.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation?.otherUser.id === conversation.otherUser.id
                        ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                        : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.otherUser.profile_picture_url} />
                        <AvatarFallback>{conversation.otherUser.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {conversation.otherUser.name}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {conversation.otherUser.email}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {conversation.otherUser.role === "landlord" ? (
                            <Building className="h-3 w-3 text-blue-600" />
                          ) : conversation.otherUser.role === "tenant" ? (
                            <Home className="h-3 w-3 text-green-600" />
                          ) : (
                            <Users className="h-3 w-3 text-purple-600" />
                          )}
                          <Badge variant="outline" className="text-xs">
                            {conversation.otherUser.role}
                          </Badge>
                        </div>
                        {conversation.lastMessage && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConversation.otherUser.profile_picture_url} />
                      <AvatarFallback>{selectedConversation.otherUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{selectedConversation.otherUser.name}</CardTitle>
                      <CardDescription>{selectedConversation.otherUser.email}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline">{selectedConversation.otherUser.role}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 mb-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                            message.sender_id === user?.id
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 dark:bg-gray-800"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs opacity-70">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </span>
                            {message.read && message.sender_id === user?.id && (
                              <CheckCircle className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    className="flex-1"
                    rows={2}
                  />
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No conversation selected</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Select a conversation from the list or start a new one
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Start a new conversation:</p>
                  <div className="flex flex-wrap gap-2">
                    {users.slice(0, 5).map((user) => (
                      <Button
                        key={user.id}
                        size="sm"
                        variant="outline"
                        onClick={() => startNewConversation(user)}
                      >
                        {user.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
} 