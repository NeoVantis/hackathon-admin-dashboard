import React from 'react';
import HealthChart from './HealthChart';

const NotificationHealthChart: React.FC = () => {
  return (
    <HealthChart
      title="Notification Service Health Trend"
      apiUrl={import.meta.env.VITE_NOTIFICATION_HEALTH_API_URL || 'http://localhost:3000/api/v1/health'}
      errorTitle="Notification Service API Connection Failed"
      errorDescription="Unable to connect to the notification service health API. The dashboard cannot display real-time notification service data."
      statusColorMapping={{
        'healthy': 'bg-green-500',
        'ok': 'bg-green-500',
        'degraded': 'bg-yellow-500',
        'down': 'bg-red-500'
      }}
      showQueueCard={true}
      showEmailCard={true}
      gridCols="md:grid-cols-2 lg:grid-cols-3"
    />
  );
};

export default NotificationHealthChart;
