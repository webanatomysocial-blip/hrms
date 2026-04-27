import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { api } from '../../lib/api';
import { CheckCircle, XCircle, Clock, Calendar, MessageSquare } from 'lucide-react';

const LeaveApprovals: React.FC = () => {
  const { user, isAdmin, hasPermission } = useAuth();
  const { leaveRequests, refreshLeaveRequests } = useData();
  const [loading, setLoading] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState('');

  if (!isAdmin && !hasPermission('manage_leaves')) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <h3>Access Denied</h3>
            <p>You don't have permission to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  const accessibleRequests = leaveRequests.filter(request => {
    if (isAdmin) return true; // Admins see everything
    if (hasPermission('manage_leaves')) {
      // Managers only see regular employees
      return request.employee_role === 'employee';
    }
    return false;
  });

  const filteredRequests = accessibleRequests
    .filter(request => {
      const statusMatch = !filterStatus || request.status === filterStatus;
      if (!statusMatch) return false;

      if (isAdmin) return true;
      // Managers only see pending requests in their list
      return request.status === 'pending';
    })
    .sort((a, b) => {
      // Pending/Manager Approved first
      const priority = (s: string) => s === 'pending' ? 2 : s === 'manager_approved' ? 1 : 0;
      if (priority(a.status) !== priority(b.status)) return priority(b.status) - priority(a.status);
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });

  const handleApproval = async (id: number, status: 'approved' | 'rejected') => {
    if (!user?.id) return;

    setLoading(id);
    try {
      const response = await api.approveLeaveRequest(id, status, user.id);
      if (response.success) {
        await refreshLeaveRequests();
        
        // Show success message
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed';
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
          <strong>Success!</strong> Leave request ${status} successfully.
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 5000);
      }
    } catch (error) {
      console.error('Approval failed:', error);
      alert(`Failed to ${status} leave request. Please try again.`);
    } finally {
      setLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} className="text-success" />;
      case 'manager_approved':
        return <CheckCircle size={16} className="text-info" />;
      case 'rejected':
        return <XCircle size={16} className="text-danger" />;
      case 'pending':
        return <Clock size={16} className="text-warning" />;
      default:
        return <Clock size={16} className="text-muted" />;
    }
  };


  const pendingCount = accessibleRequests.filter(l => l.status === 'pending').length;
  const approvedCount = accessibleRequests.filter(l => l.status === 'approved').length;
  const rejectedCount = accessibleRequests.filter(l => l.status === 'rejected').length;

  return (
    <div className="container-fluid fade-in px-0">
      {/* Header */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-end">
            <div>
              <h1 className="display-5 fw-800 text-white mb-2">Leave Approvals</h1>
              <p className="text-secondary fw-500 mb-0">Review and manage employee leave requests</p>
            </div>
            <div className="text-end">
              <div className="text-dimmed small fw-700 uppercase mb-1" style={{ fontSize: '0.6rem' }}>Company Status</div>
              <div className="d-flex gap-2">
                <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3 py-1 fw-700" style={{ fontSize: '0.65rem' }}>{pendingCount} PENDING</span>
                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1 fw-700" style={{ fontSize: '0.65rem' }}>{approvedCount} ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="row mb-5">
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="premium-stat-card h-100">
            <div className="premium-stat-icon" style={{ background: 'rgba(251,191,36,0.1)', color: 'var(--accent-gold)' }}>
              <Clock size={24} />
            </div>
            <div className="premium-stat-number">{pendingCount}</div>
            <div className="premium-stat-label">Pending Approval</div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="premium-stat-card h-100">
            <div className="premium-stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>
              <CheckCircle size={24} />
            </div>
            <div className="premium-stat-number">{approvedCount}</div>
            <div className="premium-stat-label">Approved Leaves</div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="premium-stat-card h-100">
            <div className="premium-stat-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
              <XCircle size={24} />
            </div>
            <div className="premium-stat-number">{rejectedCount}</div>
            <div className="premium-stat-label">Rejected Requests</div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="premium-stat-card h-100">
            <div className="premium-stat-icon" style={{ background: 'rgba(6,182,212,0.1)', color: 'var(--accent-cyan)' }}>
              <Calendar size={24} />
            </div>
            <div className="premium-stat-number">{accessibleRequests.length}</div>
            <div className="premium-stat-label">Total Requests</div>
          </div>
        </div>
      </div>

      {/* Discovery Layer (Filters) */}
      <div className="premium-card mb-5 border-0 shadow-lg" style={{ background: 'var(--midnight-card)' }}>
        <div className="premium-card-body py-4">
          <div className="row g-4 align-items-end">
            <div className="col-lg-5">
              <label className="text-secondary small fw-700 text-uppercase mb-2 d-block">
                <Clock size={14} className="me-2 text-gold" />
                Filter by Status
              </label>
              <select
                className="form-select bg-opacity-05 border-secondary border-opacity-10 py-2 text-white"
                style={{ borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="" className="bg-dark">All Requests</option>
                <option value="pending" className="bg-dark">Pending (Stage 1)</option>
                <option value="manager_approved" className="bg-dark">Manager Approved (Stage 2)</option>
                <option value="approved" className="bg-dark">Final Approved</option>
                <option value="rejected" className="bg-dark">Rejected</option>
              </select>
            </div>
            <div className="col-lg-3">
              <button
                onClick={() => setFilterStatus('')}
                className="btn btn-premium-secondary w-100 py-2 border-secondary border-opacity-10"
              >
                Reset Filters
              </button>
            </div>
            <div className="col-lg-4 text-end d-none d-lg-block">
              <div className="text-dimmed small fw-600 fst-italic">
                Showing <span className="text-white fw-800">{filteredRequests.length}</span> requests
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Request Stream */}
      <div className="row">
        <div className="col-12">
          <div className="premium-card border-0 shadow-lg" style={{ background: 'var(--midnight-card)' }}>
            <div className="premium-card-header bg-transparent py-4 border-bottom border-secondary border-opacity-10">
              <h5 className="mb-0 fw-800 text-white d-flex align-items-center">
                <MessageSquare className="me-3 text-cyan" size={22} />
                Leave Requests ({filteredRequests.length})
              </h5>
            </div>
            <div className="premium-card-body p-4">
              {filteredRequests.length > 0 ? (
                <div className="row g-4">
                  {filteredRequests.map((request) => (
                    <div key={request.id} className="col-12">
                      <div className="group transition-all hover-bg-white-opacity-02 p-4 rounded-3 d-flex flex-column flex-lg-row align-items-lg-center justify-content-between border border-secondary border-opacity-05" style={{ background: 'rgba(255,255,255,0.01)' }}>
                        <div className="d-flex align-items-start gap-4 mb-4 mb-lg-0">
                          <div 
                            className="rounded-3 d-flex align-items-center justify-content-center fw-800 shadow-sm"
                            style={{ 
                              width: '56px', 
                              height: '56px', 
                              background: 'var(--midnight-elevated)',
                              border: '1px solid var(--midnight-border-bright)',
                              color: 'var(--accent-cyan)',
                              fontSize: '1.2rem'
                            }}
                          >
                            {request.employee_name.charAt(0)}
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-3 mb-2">
                              <h5 className="text-white fw-800 mb-0">{request.employee_name}</h5>
                              <span className={`badge-premium ${
                                request.type === 'sick' ? 'badge-premium-danger' : 
                                request.type === 'vacation' ? 'badge-premium-success' : 
                                'badge-premium-indigo'
                              }`}>
                                {request.type}
                              </span>
                              {request.is_unpaid && (
                                <span className="badge-premium badge-premium-warning">UNPAID</span>
                              )}
                            </div>
                            <div className="d-flex align-items-center gap-4 text-dimmed small fw-600 mb-2">
                              <span className="d-flex align-items-center">
                                <Calendar size={14} className="me-2 text-indigo" />
                                {new Date(request.start_date).toLocaleDateString()} — {new Date(request.end_date).toLocaleDateString()}
                              </span>
                              <span className="d-flex align-items-center">
                                <Clock size={14} className="me-2 text-cyan" />
                                {request.days} Days
                              </span>
                            </div>
                            <div className="d-flex align-items-start gap-2 bg-white bg-opacity-02 p-3 rounded-3 mt-3 border border-secondary border-opacity-05">
                              <MessageSquare size={14} className="mt-1 text-dimmed" />
                              <div className="text-secondary small fw-500 line-clamp-2">{request.reason}</div>
                            </div>
                            <div className="text-dimmed fw-500 mt-2" style={{ fontSize: '0.65rem' }}>
                              Submitted on {new Date(request.created_at || '').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              {request.manager_approved_by_name && (
                                <span className="ms-2 ps-2 border-start border-secondary border-opacity-20 fst-italic text-info">Endorsed by Manager: {request.manager_approved_by_name}</span>
                              )}
                              {request.approved_by_name && (
                                <span className="ms-2 ps-2 border-start border-secondary border-opacity-20 fst-italic text-success">Final Approval by: {request.approved_by_name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-end min-width-200">
                          <div className="d-flex flex-column gap-3">
                            <div className="d-flex align-items-center justify-content-end gap-3">
                              <div className="text-end">
                                <div className={`fw-800 text-uppercase small ${
                                  request.status === 'approved' ? 'text-success' :
                                  request.status === 'manager_approved' ? 'text-info' :
                                  request.status === 'rejected' ? 'text-danger' :
                                  'text-warning'
                                }`} style={{ fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                                  {request.status === 'manager_approved' ? 'Stage: Manager Endorsed' : 
                                   request.status === 'approved' ? 'Final Approved' :
                                   request.status === 'rejected' ? 'Rejected' :
                                   'Pending Stage 1'}
                                </div>
                              </div>
                              <div 
                                className="rounded-circle d-flex align-items-center justify-content-center shadow-lg" 
                                style={{ 
                                  width: '44px', 
                                  height: '44px', 
                                  background: request.status === 'approved' ? 'rgba(16,185,129,0.15)' : 
                                             request.status === 'manager_approved' ? 'rgba(6,182,212,0.15)' :
                                             request.status === 'rejected' ? 'rgba(239,68,68,0.15)' : 
                                             'rgba(251,191,36,0.15)',
                                  color: request.status === 'approved' ? 'var(--success)' : 
                                         request.status === 'manager_approved' ? 'var(--accent-cyan)' :
                                         request.status === 'rejected' ? '#ef4444' : 
                                         'var(--accent-gold)',
                                  border: `1px solid ${request.status === 'approved' ? 'rgba(16,185,129,0.2)' : 
                                                    request.status === 'manager_approved' ? 'rgba(6,182,212,0.2)' :
                                                    request.status === 'rejected' ? 'rgba(239,68,68,0.2)' : 
                                                    'rgba(251,191,36,0.2)'}`
                                }}
                              >
                                {getStatusIcon(request.status)}
                              </div>
                            </div>
                            
                            {(request.status === 'pending' || (isAdmin && request.status === 'manager_approved')) && (
                              <div className="d-flex gap-2 justify-content-end mt-2">
                                <button
                                  onClick={() => handleApproval(request.id, 'approved')}
                                  disabled={loading === request.id}
                                  className={`btn ${isAdmin && request.status === 'manager_approved' ? 'btn-premium-success' : 'btn-premium-cyan'} btn-sm px-4 py-2 fw-800 shadow-glow-cyan`}
                                  style={{ fontSize: '0.65rem' }}
                                >
                                  {loading === request.id ? (
                                    <div className="spinner-border spinner-border-sm" role="status" />
                                  ) : (
                                    <>{isAdmin && request.status === 'manager_approved' ? 'FINAL APPROVE' : 
                                       isAdmin ? 'ENDORSE & APPROVE' : 'ENDORSE REQUEST'}</>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleApproval(request.id, 'rejected')}
                                  disabled={loading === request.id}
                                  className="btn btn-premium-danger btn-sm px-4 py-2 fw-800 shadow-glow-danger"
                                  style={{ fontSize: '0.65rem' }}
                                >
                                  {loading === request.id ? (
                                    <div className="spinner-border spinner-border-sm" role="status" />
                                  ) : (
                                    <>REJECT</>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <Calendar size={64} className="text-dimmed opacity-10 mb-4" />
                  <h4 className="text-white fw-700 mb-2">No Requests Found</h4>
                  <p className="text-secondary small fw-500 mb-0">
                    {filterStatus ? `No leave requests match the current '${filterStatus}' filter.` : 'There are no leave requests to show.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveApprovals;
