import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import {
  User,
  Menu,
  LogOut,
  Bell,
  Check,
  Trash2,
  Calendar,
  Clock,
  Shield
} from 'lucide-react';

interface HeaderProps {
  onSettingsClick: () => void;
  onMobileMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSettingsClick, onMobileMenuClick }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unread_count);
      }
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      await api.markAllNotificationsAsRead();
      await loadNotifications();
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.markNotificationAsRead(id);
      await loadNotifications();
    } catch (e) {
      console.error('Failed to mark as read:', e);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteNotification(id);
      await loadNotifications();
    } catch (e) {
      console.error('Failed to delete notification:', e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'leave_request':
      case 'leave_approved':
      case 'leave_rejected':
        return <Calendar size={16} className="me-2" />;
      case 'attendance':
        return <Clock size={16} className="me-2" />;
      case 'system':
        return <Shield size={16} className="me-2" />;
      default:
        return <Bell size={16} className="me-2" />;
    }
  };

  const getColorClass = (type: string) => {
    switch (type) {
      case 'leave_approved':
        return 'text-success';
      case 'leave_rejected':
        return 'text-danger';
      case 'attendance':
        return 'text-cyan';
      default:
        return 'text-warning';
    }
  };

  return (
    <header className="premium-header">
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <button className="btn btn-premium-secondary d-lg-none me-3 p-2" onClick={onMobileMenuClick} aria-label="Toggle navigation">
            <Menu size={20} />
          </button>
          <div>
            <h4 className="mb-0 fw-800 text-white letter-spacing-tight">
              Hello, {user?.name.split(' ')[0]} <span className="ms-1">✨</span>
            </h4>
            <p className="text-secondary small mb-0 fw-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          {/* Notifications */}
          <div className="dropdown">
            <button className="btn btn-premium-secondary position-relative p-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px', padding: '0.25rem 0.4rem', border: '2px solid var(--midnight-surface)' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <ul className="dropdown-menu dropdown-menu-end p-0 border-0 shadow-lg" style={{ minWidth: '380px', maxHeight: '500px', overflowY: 'auto', backgroundColor: 'var(--midnight-elevated)', borderRadius: 'var(--radius-lg)' }}>
              <li className="p-3 border-bottom border-secondary border-opacity-10 d-flex justify-content-between align-items-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="fw-700 text-white">Notifications</span>
                {unreadCount > 0 && (
                  <button className="btn btn-sm btn-link text-cyan text-decoration-none p-0 fw-600" onClick={handleMarkAllAsRead} disabled={loading}>
                    <Check size={14} className="me-1" />
                    Mark all read
                  </button>
                )}
              </li>
              {notifications.length > 0 ? notifications.map((n) => (
                <li key={n.id} className="border-bottom border-secondary border-opacity-10">
                  <div className={`dropdown-item p-3 ${!n.is_read ? 'notification-unread' : ''}`} style={{ cursor: 'pointer', whiteSpace: 'normal', transition: 'all 0.2s' }} onClick={() => handleMarkAsRead(n.id)}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1 pe-2">
                        <div className={`d-flex align-items-center mb-1 fw-700 small ${getColorClass(n.type)}`}>
                          {getIcon(n.type)}
                          {n.title}
                        </div>
                        <p className="small text-white-50 mb-1 fw-500">{n.message}</p>
                        <small className="text-dimmed" style={{ fontSize: '0.7rem' }}>{new Date(n.created_at).toLocaleString()}</small>
                      </div>
                      <button className="btn btn-sm btn-link text-danger p-0 opacity-50 hover-opacity-100" onClick={(e) => handleDelete(n.id, e)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              )) : (
                <li className="p-5 text-center">
                  <Bell size={48} className="mb-3 text-dimmed opacity-20" />
                  <p className="text-secondary small fw-500">Everything caught up!</p>
                </li>
              )}
            </ul>
          </div>

          <div className="vr mx-2 bg-secondary opacity-10" style={{ height: '24px' }}></div>

          {/* User Profile Summary */}
          <div className="d-flex align-items-center gap-2 ps-2">
            <div className="dropdown">
              <button 
                className="btn btn-premium-secondary p-1 d-flex align-items-center gap-2 border-0 bg-transparent" 
                type="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center fw-800 text-white" 
                  style={{ 
                    width: '36px', 
                    height: '36px', 
                    background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-cyan))',
                    boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  {user?.name.charAt(0)}
                </div>
                <div className="d-none d-md-block text-start">
                  <div className="text-white small fw-700 mt-1">{user?.name}</div>
                  <div className="text-cyan fw-600 text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>{user?.role}</div>
                </div>
              </button>
              <ul className="dropdown-menu dropdown-menu-end p-2 border-0 shadow-lg mt-2" style={{ backgroundColor: 'var(--midnight-elevated)', borderRadius: 'var(--radius-md)', minWidth: '200px' }}>
                <li>
                  <button className="dropdown-item rounded-2 py-2" onClick={onSettingsClick}>
                    <User size={16} className="me-2" />
                    <span className="small fw-600">Profile Settings</span>
                  </button>
                </li>
                <li><hr className="dropdown-divider bg-secondary opacity-10" /></li>
                <li>
                  <button className="dropdown-item rounded-2 py-2 text-danger" onClick={logout}>
                    <LogOut size={16} className="me-2" />
                    <span className="small fw-600">Sign Out</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
