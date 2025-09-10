import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface ServiceTab {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const services: ServiceTab[] = [
  {
    id: 'health',
    name: 'Health Monitor',
    icon: '🏥',
    description: 'System health and performance metrics'
  },
  {
    id: 'notifications',
    name: 'Notifications',
    icon: '🔔',
    description: 'Email notifications and delivery status'
  },
  // Future services can be added here
  // {
  //   id: 'logs',
  //   name: 'Log Viewer',
  //   icon: '📝',
  //   description: 'System logs and error tracking'
  // },
  // {
  //   id: 'analytics',
  //   name: 'Analytics',
  //   icon: '📊',
  //   description: 'Usage analytics and insights'
  // }
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { admin, logout, isSuperAdmin } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Get available services based on user role
  const getAvailableServices = () => {
    const baseServices = [...services];
    
    // Add super admin only services
    if (isSuperAdmin()) {
      baseServices.push({
        id: 'users',
        name: 'User Management',
        icon: '👥',
        description: 'Manage admin users and permissions'
      });
    }
    
    return baseServices;
  };

  const availableServices = getAvailableServices();
  return (
    <div style={{
      width: '280px',
      height: '100vh',
      backgroundColor: '#121212FF',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #34495e',
      boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #000000FF',
        backgroundColor: '#1a252f'
      }}>
        <h2 style={{
          margin: '0',
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#ecf0f1'
        }}>
        Admin Dashboard
        </h2>
        <p style={{
          margin: '5px 0 0 0',
          fontSize: '12px',
          color: '#95a5a6',
          fontStyle: 'italic'
        }}>
          System Management Console
        </p>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        padding: '20px 0'
      }}>
        <div style={{
          padding: '0 20px 15px 20px',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#95a5a6',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          Services
        </div>
        
        {availableServices.map((service) => (
          <button
            key={service.id}
            onClick={() => onTabChange(service.id)}
            style={{
              width: '100%',
              padding: '12px 20px',
              border: 'none',
              backgroundColor: activeTab === service.id ? '#3498db' : 'transparent',
              color: activeTab === service.id ? 'white' : '#ecf0f1',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              borderLeft: activeTab === service.id ? '4px solid #2980b9' : '4px solid transparent',
              fontSize: '14px',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== service.id) {
                e.currentTarget.style.backgroundColor = '#34495e';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== service.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '18px' }}>{service.icon}</span>
              <div>
                <div style={{
                  fontWeight: activeTab === service.id ? 'bold' : 'normal',
                  marginBottom: '2px'
                }}>
                  {service.name}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: activeTab === service.id ? '#ecf0f1' : '#95a5a6',
                  opacity: 0.8
                }}>
                  {service.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid #34495e',
        backgroundColor: '#1a252f'
      }}>
        {/* User Info */}
        <div style={{
          marginBottom: '15px',
          padding: '10px',
          backgroundColor: '#2c3e50',
          borderRadius: '4px'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#95a5a6',
            marginBottom: '4px'
          }}>
            Logged in as
          </div>
          <div style={{
            fontSize: '14px',
            color: '#ecf0f1',
            fontWeight: 'bold',
            marginBottom: '2px'
          }}>
            {admin?.username || 'Unknown User'}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#3498db',
            textTransform: 'uppercase',
            fontWeight: 'bold'
          }}>
            {admin?.role || 'No Role'}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: isLoggingOut ? '#95a5a6' : '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: isLoggingOut ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!isLoggingOut) {
              e.currentTarget.style.backgroundColor = '#c0392b';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoggingOut) {
              e.currentTarget.style.backgroundColor = '#e74c3c';
            }
          }}
        >
          {isLoggingOut ? (
            <>
              <span>🔄</span>
              <span>Logging out...</span>
            </>
          ) : (
            <>
              <span>🚪</span>
              <span>Logout</span>
            </>
          )}
        </button>

        {/* Footer */}
        <div style={{
          fontSize: '11px',
          color: '#95a5a6',
          textAlign: 'center',
          marginTop: '15px'
        }}>
          <div>Version 1.0.0</div>
          <div style={{ marginTop: '5px' }}>
            © 2025 NeoVantis
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
