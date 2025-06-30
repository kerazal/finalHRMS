"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Download, Search, DollarSign, Calendar, CheckCircle, Clock, AlertCircle, CreditCard, TrendingUp } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

export default function PaymentsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [payments, setPayments] = useState<any[]>([])
  const [filteredPayments, setFilteredPayments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  useEffect(() => {
    fetchPayments()
  }, [user])

  useEffect(() => {
    filterPayments()
  }, [payments, searchTerm, statusFilter, typeFilter])

  const fetchPayments = async () => {
    try {
      const endpoint =
        user?.role === "admin" ? "/api/admin/payments" : `/api/payments?userId=${user?.id}&role=${user?.role}`

      const response = await fetch(endpoint)
      const data = await response.json()

      if (response.ok) {
        setPayments(data.payments || [])
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterPayments = () => {
    const filtered = payments.filter((payment) => {
      const matchesSearch =
        payment.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.property_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || payment.status === statusFilter
      const matchesType = typeFilter === "all" || payment.type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })

    setFilteredPayments(filtered)
  }

  const handlePaymentAction = async (paymentId: string, action: string) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        toast({ title: "Success", description: `Payment ${action} successful` })
        fetchPayments()
      }
    } catch (error) {
      toast({ title: "Error", description: `Failed to ${action} payment`, variant: "destructive" })
    }
  }

  const exportPayments = () => {
    const csvContent = [
      ["Date", "Tenant", "Property", "Amount", "Type", "Status", "Transaction ID"],
      ...filteredPayments.map((payment) => [
        new Date(payment.created_at).toLocaleDateString(),
        payment.tenant_name,
        payment.property_title,
        payment.amount,
        payment.type,
        payment.status,
        payment.transaction_id || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "payments.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
      refunded: "outline",
    }
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
  }

  const totalAmount = filteredPayments.reduce(
    (sum, payment) => (payment.status === "completed" ? sum + payment.amount : sum),
    0,
  )

  const pendingAmount = filteredPayments.reduce(
    (sum, payment) => (payment.status === "pending" ? sum + payment.amount : sum),
    0,
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            Manage and track payment transactions
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,234</div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2350</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12,234</div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>
              A list of recent payment transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Property #1234</p>
                  <p className="text-sm text-muted-foreground">Rent Payment</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$1,200</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Property #5678</p>
                  <p className="text-sm text-muted-foreground">Security Deposit</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$2,400</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
