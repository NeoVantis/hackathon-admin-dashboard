import * as React from "react"
import {
  Activity,
  Bell,
  Building,
  Mail,
  Settings,
  Shield,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
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

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AppSidebar({ activeTab, onTabChange, ...props }: AppSidebarProps) {
  const { admin, isSuperAdmin, getRoleName } = useAuth()

  // Define navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      {
        title: "User Management",
        url: "users",
        icon: Users,
        isActive: activeTab === "users",
      },
      {
        title: "Health Monitor",
        url: "health",
        icon: Activity,
        isActive: activeTab === "health",
      },
      {
        title: "Notifications",
        url: "notifications", 
        icon: Bell,
        isActive: activeTab === "notifications",
      },
      {
        title: "Send Email",
        url: "send-email",
        icon: Mail,
        isActive: activeTab === "send-email",
      },
    ]

    // Add super admin only items
    if (isSuperAdmin()) {
      baseItems.push({
        title: "Admin Management",
        url: "admin-management",
        icon: Shield,
        isActive: activeTab === "admin-management",
      })
    }

    return baseItems
  }

  const navSecondary = [
    {
      title: "Settings",
      url: "settings",
      icon: Settings,
    },
  ]

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
        <NavMain items={getNavItems()} onItemClick={onTabChange} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
