import React, { useState, useEffect, useCallback } from 'react';

interface Notification {
  id: string;
  notificationType: string;
  recipientEmail: string;
  content: string;
  status: string;
  scheduledAt: string;
  sentAt: string | null;
}

interface NotificationResponse {
  success: boolean;
  message: string;
  data: {
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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
  const [statusFilter, setStatusFilter] = useState('');
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${import.meta.env.VITE_NOTIFICATIONS_API_URL}?page=${page}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: NotificationResponse = await response.json();
      
      if (data.success) {
        setNotifications(data.data.notifications);
        setCurrentPage(data.data.page);
        setTotalPages(data.data.totalPages);
        setTotal(data.data.total);
      } else {
        throw new Error(data.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
    if (statusFilter) {
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
        return '#27ae60';
      case 'pending':
        return '#f39c12';
      case 'failed':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const getStatusBadge = (status: string) => (
    <span
      style={{
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: getStatusColor(status),
        textTransform: 'uppercase'
      }}
    >
      {status}
    </span>
  );

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
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
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}
        onClick={closeModal}
      >
        <div
          style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '80%',
            maxHeight: '80%',
            overflow: 'auto',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            minWidth: '600px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '2px solid #f0f0f0',
            paddingBottom: '15px'
          }}>
            <h3 style={{ margin: 0, color: '#333', fontSize: '20px' }}>
              Notification Details
            </h3>
            <button
              onClick={closeModal}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                padding: '5px'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ display: 'grid', gap: '15px' }}>
            <div>
              <strong style={{ color: '#555', fontSize: '14px' }}>ID:</strong>
              <div style={{
                fontFamily: 'monospace',
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                marginTop: '5px',
                fontSize: '13px',
                wordBreak: 'break-all'
              }}>
                {selectedNotification.id}
              </div>
            </div>
            
            <div>
              <strong style={{ color: '#555', fontSize: '14px' }}>Type:</strong>
              <div style={{ marginTop: '5px' }}>
                <span style={{
                  padding: '4px 8px',
                  backgroundColor: '#e3f2fd',
                  color: '#1976d2',
                  borderRadius: '4px',
                  fontSize: '13px'
                }}>
                  {selectedNotification.notificationType}
                </span>
              </div>
            </div>
            
            <div>
              <strong style={{ color: '#555', fontSize: '14px' }}>Recipient:</strong>
              <div style={{ marginTop: '5px', fontSize: '14px' }}>
                {selectedNotification.recipientEmail}
              </div>
            </div>
            
            <div>
              <strong style={{ color: '#555', fontSize: '14px' }}>Status:</strong>
              <div style={{ marginTop: '5px' }}>
                {getStatusBadge(selectedNotification.status)}
              </div>
            </div>
            
            <div>
              <strong style={{ color: '#555', fontSize: '14px' }}>Content:</strong>
              <div style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                padding: '12px',
                marginTop: '5px',
                lineHeight: '1.5',
                fontSize: '14px',
                color: '#333',
                maxHeight: '200px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap'
              }}>
                {selectedNotification.content}
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <strong style={{ color: '#555', fontSize: '14px' }}>Scheduled At:</strong>
                <div style={{ marginTop: '5px', fontSize: '13px', color: '#666' }}>
                  {formatDate(selectedNotification.scheduledAt)}
                </div>
              </div>
              
              <div>
                <strong style={{ color: '#555', fontSize: '14px' }}>Sent At:</strong>
                <div style={{ marginTop: '5px', fontSize: '13px', color: '#666' }}>
                  {selectedNotification.sentAt ? formatDate(selectedNotification.sentAt) : 'Not sent yet'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        borderTop: '1px solid #ddd',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, total)} of {total} notifications
        </div>
        
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              backgroundColor: currentPage === 1 ? '#f5f5f5' : 'white',
              color: currentPage === 1 ? '#999' : '#333',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              borderRadius: '4px'
            }}
          >
            Previous
          </button>
          
          {pageNumbers.map(pageNum => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                backgroundColor: pageNum === currentPage ? '#3498db' : 'white',
                color: pageNum === currentPage ? 'white' : '#333',
                cursor: 'pointer',
                borderRadius: '4px',
                fontWeight: pageNum === currentPage ? 'bold' : 'normal'
              }}
            >
              {pageNum}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              backgroundColor: currentPage === totalPages ? '#f5f5f5' : 'white',
              color: currentPage === totalPages ? '#999' : '#333',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              borderRadius: '4px'
            }}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔄</div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center', color: '#e74c3c' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
          <h2>Error Loading Notifications</h2>
          <p>{error}</p>
          <button
            onClick={() => fetchNotifications(currentPage)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #ddd',
          backgroundColor: '#3498db',
          color: 'white'
        }}>
          <h2 style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>
            📧 Notifications Dashboard
          </h2>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
            Email notification delivery status and history
          </p>
        </div>

        {/* Search and Filter */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #ddd',
          backgroundColor: 'white'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 200px 150px 120px',
            gap: '15px',
            alignItems: 'end'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#555'
              }}>
                Search by ID or Email
              </label>
              <input
                type="text"
                placeholder="Enter notification ID or recipient email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3498db';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#ddd';
                }}
              />
            </div>
            
            <div>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#555'
              }}>
                Filter by Date
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3498db';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#ddd';
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#555'
              }}>
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  backgroundColor: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3498db';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#ddd';
                }}
              >
                <option value="">All Statuses</option>
                <option value="sent">Sent</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            
            <button
              onClick={() => {
                setSearchTerm('');
                setDateFilter('');
                setStatusFilter('');
              }}
              style={{
                padding: '10px 16px',
                backgroundColor: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#7f8c8d';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#95a5a6';
              }}
            >
              Clear
            </button>
          </div>
          
          {(searchTerm || dateFilter || statusFilter) && (
            <div style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: '#e8f4fd',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#2c3e50'
            }}>
              <strong>Filters applied:</strong>
              {searchTerm && <span style={{ marginLeft: '10px', padding: '2px 6px', backgroundColor: '#3498db', color: 'white', borderRadius: '3px', fontSize: '12px' }}>Search: "{searchTerm}"</span>}
              {dateFilter && <span style={{ marginLeft: '10px', padding: '2px 6px', backgroundColor: '#e67e22', color: 'white', borderRadius: '3px', fontSize: '12px' }}>Date: {new Date(dateFilter).toLocaleDateString()}</span>}
              {statusFilter && <span style={{ marginLeft: '10px', padding: '2px 6px', backgroundColor: '#9b59b6', color: 'white', borderRadius: '3px', fontSize: '12px' }}>Status: {statusFilter}</span>}
              <span style={{ marginLeft: '10px', color: '#7f8c8d' }}>
                Showing {filteredNotifications.length} of {notifications.length} notifications
              </span>
            </div>
          )}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          {(searchTerm || dateFilter || statusFilter) && filteredNotifications.length === 0 ? (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: '#666',
              backgroundColor: '#f8f9fa'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
              <h3 style={{ margin: '0 0 10px 0', color: '#555' }}>No notifications found</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Try adjusting your search criteria or clear the filters
              </p>
            </div>
          ) : (
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold', width: '140px' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold', width: '80px' }}>Type</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold', width: '200px' }}>Recipient</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold', minWidth: '300px' }}>Content</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd', fontWeight: 'bold', width: '100px' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold', width: '150px' }}>Scheduled</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold', width: '150px' }}>Sent</th>
                </tr>
              </thead>
              <tbody>
                {(searchTerm || dateFilter || statusFilter ? filteredNotifications : notifications).map((notification, index) => (
                  <tr
                    key={notification.id}
                    style={{
                      backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                      borderBottom: '1px solid #eee'
                    }}
                  >
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '11px', verticalAlign: 'top' }}>
                      <div 
                        title={`Click to view full details - ${notification.id}`}
                        style={{
                          backgroundColor: '#f1f3f4',
                          padding: '4px 6px',
                          borderRadius: '4px',
                          border: '1px solid #e0e0e0',
                          wordBreak: 'break-all',
                          lineHeight: '1.2',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => openModal(notification)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#e8f0fe';
                          e.currentTarget.style.borderColor = '#3498db';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f1f3f4';
                          e.currentTarget.style.borderColor = '#e0e0e0';
                        }}
                      >
                        {formatId(notification.id)}
                      </div>
                    </td>
                    <td style={{ padding: '12px', verticalAlign: 'top' }}>
                      <span style={{
                        padding: '2px 6px',
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {notification.notificationType}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#666', verticalAlign: 'top', fontSize: '13px' }}>
                      <div style={{ wordBreak: 'break-word' }}>
                        {notification.recipientEmail}
                      </div>
                    </td>
                    <td style={{ padding: '12px', verticalAlign: 'top' }}>
                      <div 
                        title="Click to view full content"
                        style={{
                          backgroundColor: '#fafafa',
                          border: '1px solid #e0e0e0',
                          borderRadius: '6px',
                          padding: '8px',
                          lineHeight: '1.4',
                          fontSize: '13px',
                          color: '#333',
                          maxHeight: '80px',
                          overflowY: 'auto',
                          wordBreak: 'break-word',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => openModal(notification)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f0f8ff';
                          e.currentTarget.style.borderColor = '#3498db';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#fafafa';
                          e.currentTarget.style.borderColor = '#e0e0e0';
                        }}
                      >
                        {truncateContent(notification.content)}
                        {notification.content.length > 150 && (
                          <div style={{
                            fontSize: '11px',
                            color: '#3498db',
                            marginTop: '4px',
                            fontWeight: 'bold'
                          }}>
                            Click to view more...
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', verticalAlign: 'top' }}>
                      {getStatusBadge(notification.status)}
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#666', verticalAlign: 'top' }}>
                      {formatDate(notification.scheduledAt)}
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#666', verticalAlign: 'top' }}>
                      {notification.sentAt ? formatDate(notification.sentAt) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && !searchTerm && !dateFilter && !statusFilter && renderPagination()}
      </div>

      {/* Modal */}
      {renderModal()}
    </div>
  );
};

export default NotificationsChart;
