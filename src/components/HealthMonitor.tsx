import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

        {tabs.map((tab) => {
          const Component = tab.component;
          return (
            <TabsContent key={tab.id} value={tab.id} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{tab.label}</CardTitle>
                  <CardDescription>
                    Real-time monitoring and analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Component />
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default HealthMonitor;