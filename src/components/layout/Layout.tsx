import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

// Import page components
import HealthMonitor from '../health/HealthMonitor';
import NotificationsTable from '../notifications/NotificationsTable';
import UserManagement from '../user/UserManagement';
import AdminManagement from '../admin/AdminManagement';
import SendEmail from '../notifications/SendEmail';

const Layout: React.FC = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Routes>
            {/* Default route */}
            <Route path="/" element={<Navigate to="/dashboard/health" replace />} />

            {/* Page routes */}
            <Route path="/health" element={<HealthMonitor />} />
            <Route path="/notifications" element={<NotificationsTable />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/admin-management" element={<AdminManagement />} />
            <Route path="/send-email" element={<SendEmail />} />
          </Routes>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
