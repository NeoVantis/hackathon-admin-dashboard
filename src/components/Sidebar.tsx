import React from 'react';

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
        
        {services.map((service) => (
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

      {/* Footer */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid #34495e',
        backgroundColor: '#1a252f'
      }}>
        <div style={{
          fontSize: '11px',
          color: '#95a5a6',
          textAlign: 'center'
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
