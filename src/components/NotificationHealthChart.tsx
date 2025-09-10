import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SystemData {
  status: string;
  timestamp: string;
  version: string;
  uptime: number;
  memory: {
    total: number;
    free: number;
    used: number;
    usagePercent: number;
    process: {
      heapUsed: number;
      heapTotal: number;
      external: number;
      rss: number;
    };
  };
  cpu: {
    cores: number;
    loadAverage: number[];
    model: string;
    speed: number;
  };
  database: {
    status: string;
    responseTime: number;
  };
  queue: {
    status: string;
    jobs: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
      delayed: number;
    };
  };
  email: {
    status: string;
    responseTime: number;
    smtp: {
      host: string;
      port: string;
      secure: string;
    };
  };
  network: {
    hostname: string;
    platform: string;
    arch: string;
  };
}

interface DataPoint {
  time: number;
  memory: number;
  cpu: number;
}

const HealthChart: React.FC = () => {
  const [systemData, setSystemData] = useState<SystemData | null>(null);
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use the notification service endpoint from environment variable
        const apiUrl = import.meta.env.VITE_NOTIFICATION_HEALTH_API_URL || 'http://localhost:3000/api/v1/health';
        
        // Simple fetch without security validation
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        setSystemData(data);
        setApiConnected(true);

        // Initialize chart with current data
        const now = Date.now();
        const initialPoint = {
          time: now,
          memory: data.memory.usagePercent,
          cpu: (data.cpu.loadAverage[0] / data.cpu.cores) * 100 // Normalize CPU load to percentage
        };
        setChartData([initialPoint]);
        setError(null);
      } catch (err) {
        console.error('❌ Error details:', {
          name: err instanceof Error ? err.name : 'Unknown',
          message: err instanceof Error ? err.message : 'Unknown error occurred',
          timestamp: new Date().toISOString()
        });
        
        // Simple error message
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(`Failed to connect to API: ${errorMessage}`);
        setApiConnected(false);
        setSystemData(null);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Remove systemData dependency

  // Separate useEffect for polling
  useEffect(() => {
    // Don't start polling if initial connection failed
    if (!apiConnected) {
      return;
    }

    
    const fetchNewDataPoint = async () => {
      try {
        const apiUrl = import.meta.env.VITE_NOTIFICATION_HEALTH_API_URL || 'http://localhost:3000/api/v1/health';
        
        // Simple fetch
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        const currentTime = Date.now();
        const newPoint = {
          time: currentTime,
          memory: data.memory.usagePercent,
          cpu: (data.cpu.loadAverage[0] / data.cpu.cores) * 100
        };
        
        // Reset failure count on successful fetch
        setError(null);
        
        setChartData(prevData => {
          const updatedData = [...prevData.slice(-29), newPoint]; // Keep last 30 points
          return updatedData;
        });
        
        // Update system data for the info cards
        setSystemData(data);
      } catch (error) {
        console.error('❌ API polling failed:', error);
        
        // Simple error message
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(`API connection lost: ${errorMessage}`);
        setApiConnected(false);
        setSystemData(null);
        setChartData([]);
      }
    };

    // Update chart every 2 seconds
    const interval = setInterval(fetchNewDataPoint, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [apiConnected]); // Depend on apiConnected instead of systemData

  const formatTime = (tickItem: number) => {
    const date = new Date(tickItem);
    return date.toLocaleTimeString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#4CAF50';
      case 'ok': return '#4CAF50';
      case 'degraded': return '#FF9800';
      case 'down': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔄</div>
          <div>Loading system health data...</div>
        </div>
      </div>
    );
  }

  if (error || !systemData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          backgroundColor: '#fee',
          border: '2px solid #dc3545',
          borderRadius: '8px',
          padding: '40px',
          maxWidth: '500px',
          textAlign: 'center',
          boxShadow: '0 4px 8px rgba(220, 53, 69, 0.2)'
        }}>
          <div style={{ 
            fontSize: '48px', 
            color: '#dc3545', 
            marginBottom: '20px' 
          }}>
            ⚠️
          </div>
          <h2 style={{ 
            color: '#dc3545', 
            marginBottom: '15px',
            fontFamily: 'Arial, sans-serif'
          }}>
            Notification Service API Connection Failed
          </h2>
          <p style={{ 
            color: '#721c24', 
            marginBottom: '20px',
            lineHeight: '1.5',
            fontFamily: 'Arial, sans-serif'
          }}>
            Unable to connect to the notification service health API. The dashboard cannot display real-time notification service data.
          </p>
          <div style={{
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            padding: '12px',
            marginBottom: '20px',
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#721c24',
            textAlign: 'left'
          }}>
            <strong>Error:</strong> {error}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#6c757d',
            fontFamily: 'Arial, sans-serif'
          }}>
            <p>Please check:</p>
            <ul style={{ textAlign: 'left', margin: '10px 0' }}>
              <li>Notification service API server is running</li>
              <li>Network connectivity to notification service</li>
              <li>Notification health API endpoint configuration in .env file</li>
            </ul>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: 'Arial, sans-serif',
              marginTop: '15px'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
          >
            🔄 Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Chart Section */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '20px',
        marginBottom: '20px',
        height: '450px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: '0', color: '#333' }}>Notification Service Health Trend</h2>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Data points: {chartData.length} | Last update: {chartData.length > 0 ? new Date(chartData[chartData.length - 1].time).toLocaleTimeString() : 'None'}
          </div>
        </div>
        <ResponsiveContainer width="100%" height="100%">
  <LineChart
    data={chartData}
    margin={{ top: 30, right: 30, bottom: 20, left: 20 }} // 👈 fix clipping
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis
      dataKey="time"
      type="number"
      scale="time"
      domain={['dataMin', 'dataMax']}
      tickFormatter={formatTime}
    />
    <YAxis
      domain={[0, 100]}
      label={{
        value: 'Usage (%)',
        angle: -90,
        position: 'insideLeft',
        offset: 10,
      }}
    />
    <Tooltip
      labelFormatter={(value: number) =>
        `Time: ${new Date(value).toLocaleTimeString()}`
      }
      formatter={(value: number, name: string) => [
        `${value.toFixed(2)}%`,
        name === 'Memory' ? 'Memory Usage' : 'CPU Load',
      ]}
    />
    <Legend verticalAlign="top" height={36} /> {/* 👈 keeps legend visible */}
    <Line
      type="monotone"
      dataKey="memory"
      stroke="#8884d8"
      strokeWidth={2}
      dot={{ fill: '#8884d8', strokeWidth: 2, r: 3 }}
      activeDot={{ r: 5, stroke: '#8884d8', strokeWidth: 2 }}
      name="Memory"
    />
    <Line
      type="monotone"
      dataKey="cpu"
      stroke="#82ca9d"
      strokeWidth={2}
      dot={{ fill: '#82ca9d', strokeWidth: 2, r: 3 }}
      activeDot={{ r: 5, stroke: '#82ca9d', strokeWidth: 2 }}
      name="CPU"
    />
  </LineChart>
</ResponsiveContainer>
      </div>

      {/* Status Cards */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', justifyContent: 'center' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '15px',
          textAlign: 'center',
          flex: 1,
          maxWidth: '200px'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(systemData.status),
            margin: '0 auto 10px'
          }}></div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Status</div>
          <div style={{ fontSize: '12px', color: '#666', textTransform: 'capitalize' }}>{systemData.status}</div>
        </div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '15px',
          textAlign: 'center',
          flex: 1,
          maxWidth: '200px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Uptime</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{formatUptime(systemData.uptime)}</div>
        </div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '15px',
          textAlign: 'center',
          flex: 1,
          maxWidth: '200px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Version</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{systemData.version}</div>
        </div>
      </div>

      {/* Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Memory</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Total</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{systemData.memory.total} MB</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Used</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{systemData.memory.used} MB</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Free</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{systemData.memory.free} MB</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Usage</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{systemData.memory.usagePercent}%</div>
            </div>
          </div>
        </div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>CPU</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Model</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{systemData.cpu.model}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Cores</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{systemData.cpu.cores}</div>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Load Average (1m, 5m, 15m)</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                {systemData.cpu.loadAverage.join(', ')}
              </div>
            </div>
          </div>
        </div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Database</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(systemData.database.status)
            }}></div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', textTransform: 'capitalize' }}>
              {systemData.database.status}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Response Time</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{systemData.database.responseTime} ms</div>
          </div>
        </div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Queue</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(systemData.queue.status)
            }}></div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', textTransform: 'capitalize' }}>
              {systemData.queue.status}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
            <div>
              <div style={{ color: '#666' }}>Waiting</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{systemData.queue.jobs.waiting}</div>
            </div>
            <div>
              <div style={{ color: '#666' }}>Active</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{systemData.queue.jobs.active}</div>
            </div>
            <div>
              <div style={{ color: '#666' }}>Completed</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{systemData.queue.jobs.completed}</div>
            </div>
            <div>
              <div style={{ color: '#666' }}>Failed</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{systemData.queue.jobs.failed}</div>
            </div>
          </div>
        </div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Email Service</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(systemData.email.status)
            }}></div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', textTransform: 'capitalize' }}>
              {systemData.email.status}
            </div>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>Response Time</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{systemData.email.responseTime} ms</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>SMTP Configuration</div>
            <div style={{ fontSize: '12px', color: '#333' }}>
              {systemData.email.smtp.host}:{systemData.email.smtp.port} 
              {systemData.email.smtp.secure === 'true' && ' (Secure)'}
            </div>
          </div>
        </div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Network</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Hostname</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{systemData.network.hostname}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Platform</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{systemData.network.platform}</div>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Architecture</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{systemData.network.arch}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthChart;
