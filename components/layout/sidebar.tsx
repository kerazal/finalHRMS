"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useSidebar } from "@/components/providers/sidebar-provider";
import {
  Building2,
  Home,
  MessageSquare,
  Settings,
  Users,
  Wrench,
  CreditCard,
  BarChart3,
  Menu,
  X,
  LogOut,
  User,
  Shield,
  FileText,
  Bell,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  DollarSign,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Key,
  Lock,
  Unlock,
  AlertTriangle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SidebarProps {
  className?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  variant?: "default" | "ghost";
  description?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { isCollapsed, toggleSidebar } = useSidebar();

  const getNavItems = (): NavItem[] => {
    if (!user) return [];

    const baseItems: NavItem[] = [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: Home,
        description: "Overview and statistics",
      },
    ];

    // Admin navigation
    if (user.role === "admin") {
      return [
        ...baseItems,
        {
          title: "Users",
          href: "/dashboard/users",
          icon: Users,
          badge: "Manage",
          description: "User management and verification",
        },
        {
          title: "Properties",
          href: "/dashboard/properties",
          icon: Building2,
          badge: "Approve",
          description: "Property approval and management",
        },
        {
          title: "Payments",
          href: "/dashboard/payments",
          icon: CreditCard,
          badge: "Review",
          description: "Payment processing and tracking",
        },
        {
          title: "Maintenance",
          href: "/dashboard/maintenance",
          icon: Wrench,
          badge: "Requests",
          description: "Maintenance request management",
        },
        {
          title: "Messages",
          href: "/dashboard/messages",
          icon: MessageSquare,
          badge: "Support",
          description: "Communication and support",
        },
        {
          title: "Analytics",
          href: "/dashboard/analytics",
          icon: BarChart3,
          description: "System analytics and reports",
        },
        {
          title: "Settings",
          href: "/dashboard/settings",
          icon: Settings,
          description: "System configuration",
        },
      ];
    }

    // Landlord navigation
    if (user.role === "landlord") {
      return [
        ...baseItems,
        {
          title: "My Properties",
          href: "/dashboard/properties",
          icon: Building2,
          description: "Manage your properties",
        },
        {
          title: "Add Property",
          href: "/dashboard/properties/add",
          icon: Plus,
          description: "List a new property",
        },
        {
          title: "Tenants",
          href: "/dashboard/tenants",
          icon: Users,
          description: "Tenant management",
        },
        {
          title: "Payments",
          href: "/dashboard/payments",
          icon: CreditCard,
          description: "Rent collection and tracking",
        },
        {
          title: "Maintenance",
          href: "/dashboard/maintenance",
          icon: Wrench,
          description: "Maintenance requests",
        },
        {
          title: "Messages",
          href: "/dashboard/messages",
          icon: MessageSquare,
          description: "Communication with tenants",
        },
        {
          title: "Analytics",
          href: "/dashboard/analytics",
          icon: BarChart3,
          description: "Property performance analytics",
        },
        {
          title: "Settings",
          href: "/dashboard/settings",
          icon: Settings,
          description: "Account and property settings",
        },
      ];
    }

    // Tenant navigation
    if (user.role === "tenant") {
      return [
        ...baseItems,
        {
          title: "My Rentals",
          href: "/dashboard/rentals",
          icon: Home,
          description: "Your current rentals",
        },
        {
          title: "Payments",
          href: "/dashboard/payments",
          icon: CreditCard,
          description: "Rent payments and history",
        },
        {
          title: "Maintenance",
          href: "/dashboard/maintenance",
          icon: Wrench,
          description: "Submit maintenance requests",
        },
        {
          title: "Messages",
          href: "/dashboard/messages",
          icon: MessageSquare,
          description: "Contact your landlord",
        },
        {
          title: "Documents",
          href: "/dashboard/documents",
          icon: FileText,
          description: "Lease and rental documents",
        },
        {
          title: "Settings",
          href: "/dashboard/settings",
          icon: Settings,
          description: "Account settings",
        },
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-[60px] items-center border-b px-6 justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Building2 className="h-6 w-6" />
          {!isCollapsed && <span className="font-bold">Rental Manager</span>}
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleSidebar()}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
              >
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start group relative",
                    isActive && "bg-muted"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {!isCollapsed && (
                    <>
                      {item.title}
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {isCollapsed && item.description && (
                    <div className="absolute left-full ml-2 hidden group-hover:block bg-popover text-popover-foreground p-2 rounded-md shadow-md z-50 min-w-[200px]">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            {user?.role === "admin" ? (
              <Shield className="h-4 w-4" />
            ) : user?.role === "landlord" ? (
              <Key className="h-4 w-4" />
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {user?.role}
              </p>
            </div>
          )}
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full justify-start"
              title={isCollapsed ? "Sign Out" : undefined}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {!isCollapsed && "Sign Out"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Confirm Sign Out
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to sign out? You will be redirected to the home page and will need to sign in again to access your dashboard.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => logout()}
                className="bg-red-600 hover:bg-red-700"
              >
                Sign Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn("hidden lg:block", className)}>
        <div className={cn(
          "flex h-screen flex-col border-r bg-background transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}>
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
} 