import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HealthChart, { type HealthChartProps } from './HealthChart';

interface TabItem {
  id: string;
  label: string;
  props: HealthChartProps;
}

const HealthMonitor: React.FC = () => {
  const [activeTab, setActiveTab] = useState('system');

  const tabs: TabItem[] = [
    {
      id: 'system',
      label: 'System Health',
      props: {
        title: "System Health Trend",
        apiUrl: import.meta.env.VITE_HEALTH_API_URL || '/api/health',
        errorTitle: "API Connection Failed",
        errorDescription: "Unable to connect to the health monitoring API. The dashboard cannot display real-time data.",
        statusColorMapping: {
          'healthy': 'bg-green-500',
          'degraded': 'bg-yellow-500',
          'down': 'bg-red-500'
        },
        showQueueCard: false,
        showEmailCard: false,
        gridCols: "md:grid-cols-2"
      }
    },
    {
      id: 'notification',
      label: 'Notification Service',
      props: {
        title: "Notification Service Health Trend",
        apiUrl: import.meta.env.VITE_NOTIFICATION_HEALTH_API_URL || 'http://localhost:3000/api/v1/health',
        errorTitle: "Notification Service API Connection Failed",
        errorDescription: "Unable to connect to the notification service health API. The dashboard cannot display real-time notification service data.",
        statusColorMapping: {
          'healthy': 'bg-green-500',
          'ok': 'bg-green-500',
          'degraded': 'bg-yellow-500',
          'down': 'bg-red-500'
        },
        showQueueCard: true,
        showEmailCard: true,
        gridCols: "md:grid-cols-2 lg:grid-cols-3"
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Health Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor system health and performance metrics
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{tab.label}</CardTitle>
                <CardDescription>
                  Real-time monitoring and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HealthChart {...tab.props} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default HealthMonitor;