import React, { useState } from 'react';
import Sidebar from './Sidebar';
import HealthMonitor from './HealthMonitor';
import NotificationsChart from './NotificationsChart';
import UserManagement from './UserManagement';
import AdminManagement from './AdminManagement';
import SendEmail from './SendEmail';

const Layout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('health');

  const renderContent = () => {
    switch (activeTab) {
      case 'health':
        return <HealthMonitor />;
      case 'notifications':
        return <NotificationsChart />;
      case 'users':
        return <UserManagement />;
      case 'admin-management':
        return <AdminManagement />;
      case 'send-email':
        return <SendEmail />;
      default:
        return (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#f5f5f5',
            color: '#666'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚧</div>
              <h2>Service Coming Soon</h2>
              <p>This service is currently under development.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden'
    }}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div style={{
        flex: 1,
        overflow: 'auto',
        backgroundColor: '#f5f5f5'
      }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default Layout;
