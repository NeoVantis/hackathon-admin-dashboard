import React, { useState } from 'react';
import HealthChart from './HealthChart';
import NotificationHealthChart from './NotificationHealthChart';

interface TabItem {
  id: string;
  label: string;
  component: React.ComponentType;
}

const HealthMonitor: React.FC = () => {
  const [activeTab, setActiveTab] = useState('system');

  const tabs: TabItem[] = [
    {
      id: 'system',
      label: 'System Health',
      component: HealthChart
    },
    {
      id: 'notification',
      label: 'Notification Service',
      component: NotificationHealthChart
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component || HealthChart;

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif', 
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* Header with title on the left */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-start', 
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{ 
          margin: '0', 
          color: '#333',
          fontSize: '28px',
          fontWeight: 'bold'
        }}>
          Health Dashboard
        </h1>
      </div>

      {/* Horizontal Navigation Tabs */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e0e0e0'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '15px 30px',
                border: 'none',
                backgroundColor: activeTab === tab.id ? '#007bff' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#666',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                transition: 'all 0.3s ease',
                borderBottom: activeTab === tab.id ? '3px solid #0056b3' : '3px solid transparent',
                position: 'relative'
              }}
              onMouseOver={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.color = '#333';
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#666';
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <ActiveComponent />
      </div>
    </div>
  );
};

export default HealthMonitor;