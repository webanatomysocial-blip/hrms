import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { api } from '../../lib/api';
import { Calendar, Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const LeaveRequest: React.FC = () => {
  const { user } = useAuth();
  const { leaveRequests, refreshLeaveRequests } = useData();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    type: 'sick' as 'sick' | 'vacation' | 'personal' | 'maternity' | 'paternity',
    start_date: '',
    end_date: '',
    reason: '',
    is_unpaid: false,
  });

  const userLeaves = leaveRequests.filter(leave => leave.employee_id === user?.id)
    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    try {
      const days = calculateDays(formData.start_date, formData.end_date);
      const leaveData = {
        ...formData,
        employee_id: user.id,
        days: days,
      };

      const response = await api.createLeaveRequest(leaveData);
      if (response.success) {
        setShowRequestForm(false);
        setFormData({
          type: 'sick',
          start_date: '',
          end_date: '',
          reason: '',
          is_unpaid: false,
        });
        await refreshLeaveRequests();
        
        // Show success message
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed';
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
          <strong>Success!</strong> Leave request submitted successfully.
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 5000);
      }
    } catch (error) {
      console.error('Leave request failed:', error);
      alert('Failed to submit leave request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const calculateLeaveAllowance = (joiningDate?: string) => {
    if (!joiningDate) return { paid: 12, lop: 6 }; // Default to existing employee if no date
    const join = new Date(joiningDate);
    const now = new Date();
    
    // Calculate full months completed
    let months = (now.getFullYear() - join.getFullYear()) * 12 + (now.getMonth() - join.getMonth());
    if (now.getDate() < join.getDate()) months--;

    if (months < 4) return { paid: 0, lop: 0 };
    if (months === 4) return { paid: 1, lop: 0.5 };
    if (months === 5) return { paid: 2, lop: 1 }; // Progression based on 'half leaves unabled' logic
    return { paid: 12, lop: 6 };
  };

  const allowance = calculateLeaveAllowance(user?.joining_date);
  const paidTaken = userLeaves.filter(l => l.status === 'approved' && !l.is_unpaid).reduce((sum, l) => sum + l.days, 0);
  const lopTaken = userLeaves.filter(l => l.status === 'approved' && l.is_unpaid).reduce((sum, l) => sum + l.days, 0);
  
  const remainingPaid = Math.max(0, allowance.paid - paidTaken);
  const remainingLop = Math.max(0, allowance.lop - lopTaken);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} className="text-success" />;
      case 'rejected':
        return <XCircle size={16} className="text-danger" />;
      case 'pending':
        return <Clock size={16} className="text-warning" />;
      default:
        return <AlertCircle size={16} className="text-muted" />;
    }
  };


  return (
    <div className="container-fluid fade-in px-0">
      {/* Header */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-end">
            <div>
              <h1 className="display-5 fw-800 text-white mb-2">My Leaves</h1>
              <p className="text-secondary fw-500 mb-0">Track and manage your leave requests</p>
            </div>
            <button
              onClick={() => setShowRequestForm(true)}
              className="btn btn-premium-add d-flex align-items-center px-4 py-3 shadow-lg"
            >
              <Plus className="me-2" size={20} />
              New Leave Request
            </button>
          </div>
        </div>
      </div>

      {/* Leave Statistics */}
      <div className="row mb-5">
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="premium-stat-card h-100 shadow-glow-indigo">
            <div className="premium-stat-icon" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent-indigo)' }}>
              <Calendar size={24} />
            </div>
            <div className="premium-stat-number">{remainingPaid} / {allowance.paid}</div>
            <div className="premium-stat-label">Remaining Paid Leaves</div>
            <div className="mt-2 text-dimmed small fw-600">{paidTaken} days taken</div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="premium-stat-card h-100 shadow-glow-cyan">
            <div className="premium-stat-icon" style={{ background: 'rgba(6,182,212,0.1)', color: 'var(--accent-cyan)' }}>
              <AlertCircle size={24} />
            </div>
            <div className="premium-stat-number">{remainingLop} / {allowance.lop}</div>
            <div className="premium-stat-label">Remaining LOP Balance</div>
            <div className="mt-2 text-dimmed small fw-600">{lopTaken} days applied</div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="premium-stat-card h-100">
            <div className="premium-stat-icon" style={{ background: 'rgba(251,191,36,0.1)', color: 'var(--accent-gold)' }}>
              <Clock size={24} />
            </div>
            <div className="premium-stat-number">{userLeaves.filter(l => l.status === 'pending').length}</div>
            <div className="premium-stat-label">Pending Approval</div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="premium-stat-card h-100">
            <div className="premium-stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>
              <CheckCircle size={24} />
            </div>
            <div className="premium-stat-number">
              {userLeaves.filter(l => l.status === 'approved').length}
            </div>
            <div className="premium-stat-label">Approved Requests</div>
          </div>
        </div>
      </div>

      {/* Leave Request Form Modal */}
      {showRequestForm && (
        <div className="modal show d-block premium-modal" style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ background: 'var(--midnight-card)', borderRadius: 'var(--radius-xl)' }}>
              <div className="modal-header border-bottom border-secondary border-opacity-10 py-4 px-4 bg-midnight-elevated">
                <h5 className="modal-title fw-800 text-white d-flex align-items-center">
                  <Calendar className="me-3 text-cyan" size={22} />
                  New Leave Request
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRequestForm(false)}></button>
              </div>
              <div className="modal-body p-4 p-md-5">
                <form onSubmit={handleSubmit}>
                  <div className="row g-4 mb-4">
                    <div className="col-md-6">
                      <label className="text-secondary small fw-700 text-uppercase mb-2 d-block">Leave Type</label>
                      <select
                        required
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          type: e.target.value as any
                        }))}
                        className="form-select bg-opacity-05 border-secondary border-opacity-10 py-3 text-white"
                        style={{ borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}
                      >
                        <option value="sick" className="bg-dark">Sick Leave</option>
                        <option value="vacation" className="bg-dark">Vacation / Personal Leave</option>
                        <option value="personal" className="bg-dark">Personal / Emergency Leave</option>
                        <option value="maternity" className="bg-dark">Maternity Leave</option>
                        <option value="paternity" className="bg-dark">Paternity Leave</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="text-secondary small fw-700 text-uppercase mb-2 d-block">Total Days</label>
                      <div className="form-control bg-white bg-opacity-02 border-secondary border-opacity-05 py-3 text-cyan fw-800" style={{ borderRadius: 'var(--radius-md)' }}>
                        {calculateDays(formData.start_date, formData.end_date)} Day(s) Request
                      </div>
                    </div>
                  </div>

                  <div className="row g-4 mb-4">
                    <div className="col-md-6">
                      <label className="text-secondary small fw-700 text-uppercase mb-2 d-block">Start Date</label>
                      <input
                        type="date"
                        required
                        value={formData.start_date}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          start_date: e.target.value
                        }))}
                        className="form-control bg-opacity-05 border-secondary border-opacity-10 py-3 text-white"
                        style={{ borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="text-secondary small fw-700 text-uppercase mb-2 d-block">End Date</label>
                      <input
                        type="date"
                        required
                        value={formData.end_date}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          end_date: e.target.value
                        }))}
                        className="form-control bg-opacity-05 border-secondary border-opacity-10 py-3 text-white"
                        style={{ borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}
                        min={formData.start_date || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-secondary small fw-700 text-uppercase mb-2 d-block">Reason</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.reason}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        reason: e.target.value
                      }))}
                      className="form-control bg-opacity-05 border-secondary border-opacity-10 py-3 text-white"
                      style={{ borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}
                      placeholder="Why are you taking leave?"
                    />
                  </div>

                  <div className="mb-5">
                    <div className="form-check custom-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="unpaidLeave"
                        checked={formData.is_unpaid}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          is_unpaid: e.target.checked
                        }))}
                      />
                      <label className="form-check-label text-secondary small fw-700 text-uppercase ms-2" htmlFor="unpaidLeave">
                        Unpaid Leave
                      </label>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowRequestForm(false)}
                      className="btn btn-premium-secondary px-4 py-2"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-premium-add px-5 py-2 shadow-glow-cyan"
                    >
                      {loading ? (
                        <div className="spinner-border spinner-border-sm me-2" role="status" />
                      ) : (
                        <Calendar className="me-3" size={18} />
                      )}
                      {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Requests List */}
      <div className="row">
        <div className="col-12">
          <div className="premium-card border-0 shadow-lg" style={{ background: 'var(--midnight-card)' }}>
            <div className="premium-card-header bg-transparent py-4 border-bottom border-secondary border-opacity-10">
              <h5 className="mb-0 fw-800 text-white d-flex align-items-center">
                <Calendar className="me-3 text-indigo" size={22} />
                Leave History
              </h5>
            </div>
            <div className="premium-card-body p-4">
              {userLeaves.length > 0 ? (
                <div className="row g-4">
                  {userLeaves.map((leave) => (
                    <div key={leave.id} className="col-12">
                      <div className="group transition-all hover-bg-white-opacity-02 p-4 rounded-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between border border-secondary border-opacity-05" style={{ background: 'rgba(255,255,255,0.01)' }}>
                        <div className="d-flex align-items-start gap-4 mb-3 mb-md-0">
                          <div 
                            className="rounded-3 p-3 text-center" 
                            style={{ 
                              background: 'rgba(255,255,255,0.03)', 
                              border: '1px solid rgba(255,255,255,0.05)',
                              minWidth: '100px'
                            }}
                          >
                            <div className="text-white fw-800 h4 mb-0">{leave.days}</div>
                            <div className="text-dimmed small fw-700 uppercase" style={{ fontSize: '0.6rem' }}>Days</div>
                          </div>
                          <div>
                            <div className="d-flex align-items-center gap-3 mb-2">
                              <span className={`badge rounded-pill px-3 py-1 fw-700 text-uppercase`} style={{ 
                                fontSize: '0.6rem', 
                                background: leave.type === 'sick' ? 'rgba(239,68,68,0.1)' : 
                                           leave.type === 'vacation' ? 'rgba(16,185,129,0.1)' : 
                                           'rgba(99,102,241,0.1)',
                                color: leave.type === 'sick' ? '#ef4444' : 
                                       leave.type === 'vacation' ? 'var(--success)' : 
                                       'var(--accent-indigo)',
                                border: `1px solid rgba(255,255,255,0.05)`
                              }}>
                                {leave.type}
                              </span>
                              {leave.is_unpaid && (
                                <span className="badge bg-warning bg-opacity-10 text-warning px-2 py-1 rounded-pill" style={{ fontSize: '0.55rem' }}>UNPAID</span>
                              )}
                            </div>
                            <h6 className="text-white fw-700 mb-2">{leave.reason}</h6>
                            <div className="d-flex align-items-center gap-4 text-dimmed small fw-600">
                              <span className="d-flex align-items-center">
                                <Calendar size={14} className="me-2 opacity-50 text-indigo" />
                                {new Date(leave.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(leave.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              {leave.approved_by_name && (
                                <span className="d-flex align-items-center">
                                  <CheckCircle size={14} className="me-2 opacity-50 text-cyan" />
                                  Approved by: {leave.approved_by_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="d-flex align-items-center justify-content-end gap-3 mb-3">
                            <div className="text-end">
                              <div className={`fw-800 text-uppercase small mb-1 ${
                                leave.status === 'approved' ? 'text-success' :
                                leave.status === 'rejected' ? 'text-danger' :
                                'text-warning'
                              }`} style={{ fontSize: '0.7rem' }}>
                                Status: {leave.status}
                              </div>
                              <div className="text-dimmed fw-500" style={{ fontSize: '0.65rem' }}>
                                Submitted: {new Date(leave.created_at || '').toLocaleDateString()}
                              </div>
                            </div>
                            <div 
                              className="rounded-circle d-flex align-items-center justify-content-center" 
                              style={{ 
                                width: '40px', 
                                height: '40px', 
                                background: leave.status === 'approved' ? 'rgba(16,185,129,0.1)' : 
                                           leave.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 
                                           'rgba(251,191,36,0.1)',
                                color: leave.status === 'approved' ? 'var(--success)' : 
                                       leave.status === 'rejected' ? '#ef4444' : 
                                       'var(--accent-gold)'
                              }}
                            >
                              {getStatusIcon(leave.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <Calendar size={64} className="text-dimmed opacity-10 mb-4" />
                  <h4 className="text-white fw-700 mb-2">No Leave Requests Found</h4>
                  <p className="text-secondary small fw-500 mb-4">You haven't submitted any leave requests yet.</p>
                  <button
                    onClick={() => setShowRequestForm(true)}
                    className="btn btn-premium-primary px-4 py-2"
                  >
                    Submit Your First Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequest;
