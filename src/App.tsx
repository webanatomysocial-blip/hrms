import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Login from './components/Auth/Login';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import Attendance from './components/Attendance/Attendance';
import LeaveRequest from './components/Leaves/LeaveRequest';
import LeaveApprovals from './components/Leaves/LeaveApprovals';
import Holiday from './components/Holidays/Holidays';
import AddEmployees from './components/Employees/AddEmployee';
import EmployeeList from './components/Employees/EmployeeList';
import Setting from './components/Settings/Settings';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ background: '#0f0f0f' }}>
        <div className="text-center">
          <div className="premium-spinner mb-3"></div>
          <h5 style={{ color: '#ffffff' }}>Loading WebAnatomy HRMS...</h5>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    if (showSettings) {
      return <Setting />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onPageChange={handlePageChange} />;
      case 'attendance':
        return <Attendance />;
      case 'leave-requests':
        return <LeaveRequest />;
      case 'leave-approvals':
        return <LeaveApprovals />;
      case 'holidays':
        return <Holiday />;
      case 'employees':
        return user.role === 'admin' ? <EmployeeList onPageChange={handlePageChange} /> : <Dashboard onPageChange={handlePageChange} />;
      case 'add-employees':
        return user.role === 'admin' ? <AddEmployees /> : <Dashboard onPageChange={handlePageChange} />;
      default:
        return <Dashboard onPageChange={handlePageChange} />;
    }
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    setShowSettings(false);
    setSidebarOpen(false);
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
    setCurrentPage('settings');
    setSidebarOpen(false);
  };

  const handleMobileMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleMobileClose = () => {
    setSidebarOpen(false);
  };

  return (
    <DataProvider>
      <div className="dashboard-container">
        {/* Mobile Overlay */}
        <div 
          className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
          onClick={handleMobileClose}
        />

        {/* Sidebar */}
        <Sidebar
          currentPage={showSettings ? 'settings' : currentPage}
          onPageChange={handlePageChange}
          isMobileOpen={sidebarOpen}
          onMobileClose={handleMobileClose}
        />

        {/* Main content area */}
        <div className="premium-content">
          <Header 
            onSettingsClick={handleSettingsClick}
            onMobileMenuClick={handleMobileMenuClick}
          />
          <main className="premium-main">
            {renderPage()}
          </main>
        </div>
      </div>
    </DataProvider>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
