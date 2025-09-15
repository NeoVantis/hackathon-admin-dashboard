import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig 
} from '@/components/ui/chart';
import { AlertCircle, RefreshCw } from 'lucide-react';

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

  const chartConfig = {
    memory: {
      label: "Memory Usage",
      color: "var(--chart-1)",
    },
    cpu: {
      label: "CPU Load", 
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig

  const formatTime = (tickItem: number) => {
    const date = new Date(tickItem);
    return date.toLocaleTimeString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'ok': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'down': return 'bg-red-500';
      default: return 'bg-gray-500';
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
      <div className="space-y-6">
        {/* Chart Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>

        {/* Status Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <Skeleton className="h-5 w-5 rounded-full mx-auto" />
                  <Skeleton className="h-4 w-16 mx-auto" />
                  <Skeleton className="h-3 w-20 mx-auto" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Details Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="space-y-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !systemData) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Notification Service API Connection Failed
              </h3>
              <p className="text-muted-foreground mb-4">
                Unable to connect to the notification service health API. The dashboard cannot display real-time notification service data.
              </p>
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mb-4">
                <p className="text-sm text-destructive font-mono">
                  <strong>Error:</strong> {error}
                </p>
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                <p>Please check:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Notification service API server is running</li>
                  <li>Network connectivity to notification service</li>
                  <li>Notification health API endpoint configuration in .env file</li>
                </ul>
              </div>
              <Button onClick={() => window.location.reload()} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Section */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Service Health Trend</CardTitle>
          <CardDescription>
            Data points: {chartData.length} | Last update: {chartData.length > 0 ? new Date(chartData[chartData.length - 1].time).toLocaleTimeString() : 'None'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <LineChart data={chartData}>
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
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      `Time: ${new Date(Number(value)).toLocaleTimeString()}`
                    }
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="memory"
                stroke="var(--color-memory)"
                strokeWidth={2}
                connectNulls={true}
                dot={{ fill: "var(--color-memory)", r: 3, strokeWidth: 2 }}
                activeDot={{ fill: "var(--color-memory)", r: 5, strokeWidth: 2 }}
                name="Memory Usage"
              />
              <Line
                type="monotone"
                dataKey="cpu"
                stroke="var(--color-cpu)"
                strokeWidth={2}
                connectNulls={true}
                dot={{ fill: "var(--color-cpu)", r: 3, strokeWidth: 2 }}
                activeDot={{ fill: "var(--color-cpu)", r: 5, strokeWidth: 2 }}
                name="CPU Load"
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className={`w-5 h-5 rounded-full ${getStatusColor(systemData.status)} mx-auto mb-2`} />
              <div className="text-sm font-medium">Status</div>
              <div className="text-xs text-muted-foreground capitalize">{systemData.status}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-sm font-medium">Uptime</div>
              <div className="text-xs text-muted-foreground">{formatUptime(systemData.uptime)}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-sm font-medium">Version</div>
              <div className="text-xs text-muted-foreground">{systemData.version}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Memory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Total</div>
                <div className="text-sm font-medium">{systemData.memory.total} MB</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Used</div>
                <div className="text-sm font-medium">{systemData.memory.used} MB</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Free</div>
                <div className="text-sm font-medium">{systemData.memory.free} MB</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Usage</div>
                <div className="text-sm font-medium">{systemData.memory.usagePercent}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>CPU</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <div className="text-xs text-muted-foreground">Model</div>
                <div className="text-sm font-medium truncate">{systemData.cpu.model}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Cores</div>
                <div className="text-sm font-medium">{systemData.cpu.cores}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Load Average (1m, 5m, 15m)</div>
                <div className="text-sm font-medium">{systemData.cpu.loadAverage.join(', ')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Database</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(systemData.database.status)}`} />
                <Badge variant="secondary" className="capitalize">
                  {systemData.database.status}
                </Badge>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Response Time</div>
                <div className="text-sm font-medium">{systemData.database.responseTime} ms</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Queue</CardTitle>
          </CardHeader>
          <CardContent>
            {systemData.queue ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(systemData.queue.status)}`} />
                  <Badge variant="secondary" className="capitalize">
                    {systemData.queue.status}
                  </Badge>
                </div>
                {systemData.queue.jobs && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Waiting</div>
                      <div className="font-medium">{systemData.queue.jobs.waiting}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Active</div>
                      <div className="font-medium">{systemData.queue.jobs.active}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Completed</div>
                      <div className="font-medium">{systemData.queue.jobs.completed}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Failed</div>
                      <div className="font-medium">{systemData.queue.jobs.failed}</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">Queue data not available</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Email Service</CardTitle>
          </CardHeader>
          <CardContent>
            {systemData.email ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(systemData.email.status)}`} />
                  <Badge variant="secondary" className="capitalize">
                    {systemData.email.status}
                  </Badge>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Response Time</div>
                  <div className="text-sm font-medium">{systemData.email.responseTime} ms</div>
                </div>
                {systemData.email.smtp && (
                  <div>
                    <div className="text-xs text-muted-foreground">SMTP Configuration</div>
                    <div className="text-xs">
                      {systemData.email.smtp.host}:{systemData.email.smtp.port} 
                      {systemData.email.smtp.secure === 'true' && ' (Secure)'}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">Email service data not available</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Network</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <div className="text-xs text-muted-foreground">Hostname</div>
                <div className="text-sm font-medium">{systemData.network.hostname}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Platform</div>
                <div className="text-sm font-medium">{systemData.network.platform}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Architecture</div>
                <div className="text-sm font-medium">{systemData.network.arch}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HealthChart;
