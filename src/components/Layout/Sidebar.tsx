import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Home, Users, Clock, Calendar, FileText, UserPlus, Gift, DollarSign, Receipt, Megaphone, LifeBuoy } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange, isMobileOpen, onMobileClose }) => {
  const { isAdmin, user, hasPermission } = useAuth();

  const navigation = [
    { name: 'Dashboard', icon: Home, page: 'dashboard' },
    { name: 'Announcements', icon: Megaphone, page: 'announcements' },
    { name: 'Attendance', icon: Clock, page: 'attendance' },
    { name: 'Leaves', icon: Calendar, page: 'leave-requests', employeeOnly: true },
    { name: 'Approvals', icon: FileText, page: 'leave-approvals', permission: 'manage_leaves' },
    { name: 'Payroll', icon: DollarSign, page: 'payroll' },
    { name: 'Expenses', icon: Receipt, page: 'expenses' },
    { name: 'Support / Help', icon: LifeBuoy, page: 'helpdesk' },
    { name: 'Holidays', icon: Gift, page: 'holidays' },
    { name: 'Employees', icon: Users, page: 'employees', permission: 'manage_employees' },
    { name: 'Add Employee', icon: UserPlus, page: 'add-employees', permission: 'manage_employees' },
  ];

  const filteredNavigation = navigation.filter(item => {
    if (item.permission && !hasPermission(item.permission)) return false;
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
        <div className="logo-image"></div>
      </div>

      <div className="premium-nav-list flex-grow-1 overflow-auto px-2">
        <div className="text-dimmed small fw-700 text-uppercase px-3 mb-3" style={{ fontSize: '0.65rem', letterSpacing: '0.1rem' }}>Menu</div>
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;
          return (
            <div key={item.name} className="premium-nav-item mx-2">
              <button 
                onClick={() => handleNavClick(item.page)} 
                className={`premium-nav-link w-100 bg-transparent border-0 d-flex align-items-center ${isActive ? 'active' : ''}`}
                style={{ padding: '0.75rem 1rem' }}
                aria-label={`Navigate to ${item.name}`}
              >
                <div className={`nav-icon-wrapper me-3 d-flex align-items-center justify-content-center ${isActive ? 'active' : ''}`} 
                     style={{ 
                       width: '32px', 
                       height: '32px', 
                       borderRadius: '8px',
                       transition: 'all 0.3s',
                       backgroundColor: isActive ? 'var(--accent-cyan-glow)' : 'transparent',
                       color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'
                     }}>
                  <Icon size={18} />
                </div>
                <span style={{ fontSize: '0.85rem', transition: 'all 0.3s' }} className={isActive ? 'text-white fw-700' : 'text-secondary'}>
                  {item.name}
                </span>
                {isActive && (
                  <div className="ms-auto">
                    <div className="bg-cyan rounded-circle shadow-glow-cyan" style={{ width: '5px', height: '5px' }}></div>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="user-info d-flex align-items-center m-3 p-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--midnight-border)' }}>
        <div className="user-avatar rounded-circle me-3 d-flex align-items-center justify-content-center shadow-sm" 
             style={{ 
               width: '38px', 
               height: '38px', 
               backgroundColor: 'var(--midnight-elevated)', 
               border: '1px solid var(--midnight-border-bright)', 
               color: 'var(--accent-cyan)',
               fontSize: '0.9rem',
               fontWeight: 'bold'
             }}>
          {user?.name.charAt(0)}
        </div>
        <div className="user-details overflow-hidden">
          <div className="text-white fw-700 text-truncate" style={{ fontSize: '0.8rem' }}>{user?.name}</div>
          <div className="text-dimmed text-uppercase fw-700" style={{ fontSize: '0.6rem', letterSpacing: '0.05rem' }}>{user?.role}</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
