import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Home, Users, Clock, Calendar, FileText, UserPlus, Gift } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange, isMobileOpen, onMobileClose }) => {
  const { isAdmin, user } = useAuth();

  const navigation = [
    { name: 'Dashboard', icon: Home, page: 'dashboard' },
    { name: 'Attendance', icon: Clock, page: 'attendance' },
    { name: 'My Leaves', icon: Calendar, page: 'leave-requests', employeeOnly: true },
    { name: 'Leave Approvals', icon: FileText, page: 'leave-approvals', adminOnly: true },
    { name: 'Holidays', icon: Gift, page: 'holidays' },
    { name: 'Employees', icon: Users, page: 'employees', adminOnly: true },
    { name: 'Add Employee', icon: UserPlus, page: 'add-employees', adminOnly: true },
  ];

  const filteredNavigation = navigation.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.employeeOnly && isAdmin) return false;
    return true;
  });

  const handleNavClick = (page: string) => {
    onPageChange(page);
    onMobileClose && onMobileClose();
  };

  return (
    <div className={`premium-sidebar ${isMobileOpen ? 'show' : ''}`}>
      <div className="premium-sidebar-logo">
        <div className="logo-image mb-3"></div>
      </div>

      <div className="premium-nav-list flex-grow-1">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;
          return (
            <div key={item.name} className="premium-nav-item">
              <button 
                onClick={() => handleNavClick(item.page)} 
                className={`premium-nav-link w-100 bg-transparent ${isActive ? 'active' : ''}`}
                aria-label={`Navigate to ${item.name}`}
              >
                <Icon size={18} className="me-3" />
                <span>{item.name}</span>
                {isActive && (
                  <div className="ms-auto">
                    <div className="bg-cyan rounded-circle" style={{ width: '4px', height: '4px', boxShadow: '0 0 10px #06b6d4' }}></div>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="user-info d-flex align-items-center">
        <div className="user-avatar rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: 'var(--midnight-elevated)', border: '1px solid var(--midnight-border-bright)', color: 'var(--accent-cyan)' }}>
          {user?.name.charAt(0)}
        </div>
        <div className="user-details overflow-hidden">
          <div className="text-white fw-600 text-truncate" style={{ fontSize: '0.85rem' }}>{user?.name}</div>
          <div className="text-secondary text-capitalize" style={{ fontSize: '0.75rem' }}>{user?.role}</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
