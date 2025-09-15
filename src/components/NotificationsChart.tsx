import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Mail, RefreshCw, Search, X } from 'lucide-react';

interface Notification {
  id: string;
  notificationType: string;
  recipientEmail: string;
  content: string;
  status: string;
  scheduledAt: string;
  sentAt: string | null;
}

const NotificationsChart: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = `${import.meta.env.VITE_NOTIFICATIONS_API_URL || '/api/notifications'}?page=${page}&limit=${limit}`;
      
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
      
      if (data.success) {
        setNotifications(data.data.notifications);
        setCurrentPage(data.data.page);
        setTotalPages(data.data.totalPages);
        setTotal(data.data.total);
      } else {
        throw new Error(data.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      // Simple error message
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchNotifications(currentPage);
  }, [currentPage, fetchNotifications]);

  // Filter notifications based on search term and date filter
  useEffect(() => {
    let filtered = notifications;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(notification => 
        notification.id.toLowerCase().includes(searchLower) ||
        notification.recipientEmail.toLowerCase().includes(searchLower)
      );
    }

    // Apply date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(notification => {
        const notificationDate = new Date(notification.scheduledAt);
        return notificationDate.toDateString() === filterDate.toDateString();
      });
    }

    // Apply status filter
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(notification => 
        notification.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, dateFilter, statusFilter]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    const colorClass = getStatusColor(status);
    return (
      <Badge className={`${colorClass} text-white`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const formatId = (id: string) => {
    return id.substring(0, 12) + '...';
  };

  const openModal = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedNotification(null);
    setShowModal(false);
  };

  const renderModal = () => {
    if (!showModal || !selectedNotification) return null;

    return (
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Notification Details
            </DialogTitle>
            <DialogDescription>
              Complete information for notification {formatId(selectedNotification.id)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">ID</Label>
                <div className="mt-1 p-2 bg-muted rounded-md font-mono text-xs break-all">
                  {selectedNotification.id}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                <div className="mt-1">
                  <Badge variant="secondary">
                    {selectedNotification.notificationType}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Recipient</Label>
                <div className="mt-1 text-sm">
                  {selectedNotification.recipientEmail}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <div className="mt-1">
                  {getStatusBadge(selectedNotification.status)}
                </div>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Content</Label>
              <div className="mt-1 p-3 bg-muted border rounded-md max-h-60 overflow-y-auto">
                <div className="text-sm whitespace-pre-wrap break-words">
                  {selectedNotification.content}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Scheduled At</Label>
                <div className="mt-1 text-sm text-muted-foreground">
                  {formatDate(selectedNotification.scheduledAt)}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Sent At</Label>
                <div className="mt-1 text-sm text-muted-foreground">
                  {selectedNotification.sentAt ? formatDate(selectedNotification.sentAt) : 'Not sent yet'}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, total)} of {total} notifications
        </div>
        
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          {pageNumbers.map(pageNum => (
            <Button
              key={pageNum}
              variant={pageNum === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(pageNum)}
            >
              {pageNum}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-6 w-6" />
              <CardTitle>Notifications Dashboard</CardTitle>
            </div>
            <CardDescription>
              Email notification delivery status and history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Error Loading Notifications
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => fetchNotifications(currentPage)} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-6 w-6" />
            <CardTitle>Notifications Dashboard</CardTitle>
          </div>
          <CardDescription>
            Email notification delivery status and history
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Search and Filter */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <Label htmlFor="search">Search by ID or Email</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Enter notification ID or recipient email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="date">Filter by Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="status">Filter by Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setDateFilter('');
                    setStatusFilter('all');
                  }}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>
            
            {(searchTerm || dateFilter || (statusFilter && statusFilter !== 'all')) && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                <div className="flex items-center gap-2 text-sm">
                  <strong>Filters applied:</strong>
                  {searchTerm && <Badge variant="secondary">Search: "{searchTerm}"</Badge>}
                  {dateFilter && <Badge variant="secondary">Date: {new Date(dateFilter).toLocaleDateString()}</Badge>}
                  {statusFilter && statusFilter !== 'all' && <Badge variant="secondary">Status: {statusFilter}</Badge>}
                  <span className="text-muted-foreground">
                    Showing {filteredNotifications.length} of {notifications.length} notifications
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          {(searchTerm || dateFilter || (statusFilter && statusFilter !== 'all')) && filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or clear the filters
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">ID</TableHead>
                    <TableHead className="w-20">Type</TableHead>
                    <TableHead className="w-48">Recipient</TableHead>
                    <TableHead className="min-w-[300px]">Content</TableHead>
                    <TableHead className="w-24 text-center">Status</TableHead>
                    <TableHead className="w-36">Scheduled</TableHead>
                    <TableHead className="w-36">Sent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(searchTerm || dateFilter || (statusFilter && statusFilter !== 'all') ? filteredNotifications : notifications).map((notification) => (
                    <TableRow key={notification.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-mono text-xs">
                        <div 
                          className="p-1 bg-muted rounded border hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                          onClick={() => openModal(notification)}
                          title={`Click to view full details - ${notification.id}`}
                        >
                          {formatId(notification.id)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {notification.notificationType}
                        </Badge>
                      </TableCell>
                      <TableCell className="break-words text-sm">
                        {notification.recipientEmail}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div 
                          className="p-2 bg-muted/50 border rounded-md max-h-20 overflow-y-auto cursor-pointer hover:bg-muted transition-colors"
                          onClick={() => openModal(notification)}
                          title="Click to view full content"
                        >
                          <div className="text-sm line-clamp-2 max-w-xs">
                            {notification.content.length > 150 
                              ? `${notification.content.substring(0, 150)}...` 
                              : notification.content}
                          </div>
                          {notification.content.length > 150 && (
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                              Click to view more...
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(notification.status)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(notification.scheduledAt)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {notification.sentAt ? formatDate(notification.sentAt) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && !searchTerm && !dateFilter && (!statusFilter || statusFilter === 'all') && renderPagination()}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {renderModal()}
    </div>
  );
};

export default NotificationsChart;
