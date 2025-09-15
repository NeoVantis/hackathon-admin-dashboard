import * as React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  Activity,
  Bell,
  Building,
  Mail,
  Shield,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/sidebar/nav-main"
import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { admin, isSuperAdmin, getRoleName } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Define navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      {
        title: "User Management",
        url: "/dashboard/users",
        icon: Users,
        isActive: location.pathname === "/dashboard/users",
      },
      {
        title: "Health Monitor",
        url: "/dashboard/health",
        icon: Activity,
        isActive: location.pathname === "/dashboard/health",
      },
      {
        title: "Notifications",
        url: "/dashboard/notifications", 
        icon: Bell,
        isActive: location.pathname === "/dashboard/notifications",
      },
      {
        title: "Send Email",
        url: "/dashboard/send-email",
        icon: Mail,
        isActive: location.pathname === "/dashboard/send-email",
      },
    ]

    // Add super admin only items
    if (isSuperAdmin()) {
      baseItems.push({
        title: "Admin Management",
        url: "/dashboard/admin-management",
        icon: Shield,
        isActive: location.pathname === "/dashboard/admin-management",
      })
    }

    return baseItems
  }

  const handleNavigation = (url: string) => {
    navigate(url)
  }

  const userData = {
    name: admin?.username || "Unknown User",
    email: "admin@neovantis.com",
    avatar: "/avatars/user.jpg",
    role: getRoleName(),
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#" className="flex items-center gap-2">
                <Building className="size-5" />
                <span className="text-base font-semibold">NeoVantis Admin</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={getNavItems()} onItemClick={handleNavigation} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
