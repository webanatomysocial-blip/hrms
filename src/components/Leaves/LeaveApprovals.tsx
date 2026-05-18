import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { api } from '../../lib/api';
import { XCircle, Trash2, Clock, Calendar, MessageSquare, RefreshCw, Briefcase, Search } from 'lucide-react';

const LeaveApprovals: React.FC = () => {
  const { user, isAdmin, isManager, hasPermission } = useAuth();
  const { leaveRequests, refreshLeaveRequests } = useData();
  const [loading, setLoading] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [activeTab, setActiveTab] = useState<'requests' | 'balances'>('requests');
  const [balances, setBalances] = useState<any[]>([]);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceSearch, setBalanceSearch] = useState('');
  const [editingBalanceId, setEditingBalanceId] = useState<number | null>(null);
  const [editBalance, setEditBalance] = useState({sl: 0, cl: 0, pl: 0, used_sl: 0, used_cl: 0, used_pl: 0});

  React.useEffect(() => {
    if (activeTab === 'balances') {
      fetchBalances();
    }
  }, [activeTab]);

  const fetchBalances = async () => {
    setBalanceLoading(true);
    try {
      const res = await api.getLeaveBalances();
      if (res.success) setBalances(res.data || []);
    } catch (e) { console.error(e); }
    finally { setBalanceLoading(false); }
  };

  const handleUpdateBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBalanceId === null) return;
    
    const balanceData = balances.find(b => b.employee_id === editingBalanceId);
    if (!balanceData) return;

    try {
      const res = await api.updateLeaveBalance({
        employee_id: editingBalanceId,
        year: balanceData.year,
        ...editBalance
      });
      if (res.success) {
        setEditingBalanceId(null);
        fetchBalances();
      }
    } catch (e) { console.error(e); }
  };

  const openBalanceEdit = (bal: any) => {
    if (editingBalanceId === bal.employee_id) {
      setEditingBalanceId(null);
      return;
    }
    setEditingBalanceId(bal.employee_id);
    setEditBalance({
      sl: Number(bal.sl), 
      cl: Number(bal.cl), 
      pl: Number(bal.pl),
      used_sl: Number(bal.used_sl),
      used_cl: Number(bal.used_cl),
      used_pl: Number(bal.used_pl)
    });
  };

  if (!isAdmin && !isManager && !hasPermission('manage_leaves')) {
    return (
      <div className="container-fluid p-5">
        <div className="premium-card p-5 text-center fade-in">
          <XCircle size={64} className="text-danger mb-4 opacity-50" />
          <h2 className="text-white fw-800 mb-2">Access Denied</h2>
          <p className="text-dimmed mb-0">You don't have the necessary administrative privileges to view this page.</p>
        </div>
      </div>
    );
  }

  const accessibleRequests = leaveRequests.filter(request => {
    if (isAdmin) return true;
    if (isManager || hasPermission('manage_leaves')) {
      return request.employee_role === 'employee';
    }
    return false;
  });

  const filteredRequests = accessibleRequests
    .filter(request => {
      const statusMatch = !filterStatus || request.status === filterStatus;
      if (!statusMatch) return false;
      
      const searchMatch = !balanceSearch || 
        request.employee_name?.toLowerCase().includes(balanceSearch.toLowerCase()) ||
        request.department?.toLowerCase().includes(balanceSearch.toLowerCase()) ||
        request.type?.toLowerCase().includes(balanceSearch.toLowerCase());
      
      return searchMatch;
    })
    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());

  const filteredBalances = balances.filter(bal => 
    !balanceSearch || 
    bal.employee_name?.toLowerCase().includes(balanceSearch.toLowerCase()) ||
    bal.department?.toLowerCase().includes(balanceSearch.toLowerCase())
  );

  const handleApproval = async (id: number, status: 'approved' | 'rejected') => {
    if (!user?.id) return;
    setLoading(id);
    try {
      const response = await api.approveLeaveRequest(id, status, user.id);
      if (response.success) {
        await refreshLeaveRequests();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this request?')) return;
    try {
      const res = await api.deleteLeaveRequest(id);
      if (res.success) await refreshLeaveRequests();
    } catch (error) { console.error(error); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <span className="badge-premium badge-premium-success">Approved</span>;
      case 'rejected': return <span className="badge-premium badge-premium-danger">Rejected</span>;
      case 'manager_approved': return <span className="badge-premium badge-premium-indigo">Manager Approved</span>;
      default: return <span className="badge-premium badge-premium-warning">Pending</span>;
    }
  };

  return (
    <div className="container-fluid fade-in px-0">
      {/* Header Section */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-end">
            <div>
              <h1 className="display-5 fw-800 text-white mb-2">Leave Management</h1>
              <p className="text-secondary fw-500 mb-0">Review employee requests and maintain leave quotas</p>
            </div>
            <button 
              onClick={() => activeTab === 'requests' ? refreshLeaveRequests() : fetchBalances()} 
              className="btn btn-premium-secondary d-flex align-items-center gap-2"
            >
              <RefreshCw size={16} className={loading || balanceLoading ? 'spin' : ''} />
              Sync Data
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="d-inline-flex p-1 rounded-4" style={{ background: 'var(--midnight-surface)', border: '1px solid var(--midnight-border)' }}>
            <button 
              onClick={() => setActiveTab('requests')} 
              className={`btn px-4 py-2 rounded-3 border-0 transition-all ${activeTab === 'requests' ? 'btn-premium-cyan shadow-glow-cyan' : 'text-secondary'}`}
              style={{ background: activeTab === 'requests' ? '' : 'transparent' }}
            >
              <MessageSquare size={16} className="me-2" />
              Requests Review
            </button>
            <button 
              onClick={() => setActiveTab('balances')} 
              className={`btn px-4 py-2 rounded-3 border-0 transition-all ${activeTab === 'balances' ? 'btn-premium-cyan shadow-glow-cyan' : 'text-secondary'}`}
              style={{ background: activeTab === 'balances' ? '' : 'transparent' }}
            >
              <Calendar size={16} className="me-2" />
              Quota Management
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'requests' && (
        <div className="fade-in">
          {/* Filters */}
          <div className="premium-card mb-5 p-4" style={{ background: 'var(--midnight-surface)' }}>
            <div className="row align-items-end g-4">
              <div className="col-md-4">
                <label className="text-dimmed x-small fw-800 uppercase letter-spacing-1 mb-2 d-block">Search Employee</label>
                <div className="position-relative">
                  <Search size={14} className="position-absolute text-secondary" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    className="form-control premium-input ps-5" 
                    placeholder="Search by name..." 
                    value={balanceSearch} // Reusing search state
                    onChange={(e) => setBalanceSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <label className="text-dimmed x-small fw-800 uppercase letter-spacing-1 mb-2 d-block">Request Status</label>
                <select 
                  className="form-select premium-input" 
                  value={filterStatus} 
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending Only</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="manager_approved">Manager Approved</option>
                </select>
              </div>
              <div className="col-md-auto ms-auto text-end">
                 <div className="text-dimmed x-small fw-800 uppercase letter-spacing-1">
                    {filteredRequests.length} active requests
                 </div>
              </div>
            </div>
          </div>

          {/* Requests List */}
          <div className="row g-4">
            {filteredRequests.length > 0 ? filteredRequests.map(req => (
              <div key={req.id} className="col-xl-6 col-xxl-4">
                <div className="premium-card h-100 transition-all hover-translate-y">
                  <div className="premium-card-body">
                    <div className="d-flex justify-content-between align-items-start mb-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="user-avatar-sm" style={{ width: 48, height: 48, fontSize: '1.2rem' }}>
                          {req.employee_name?.charAt(0)}
                        </div>
                        <div>
                          <h5 className="text-white fw-700 mb-0">{req.employee_name}</h5>
                          <span className="text-dimmed small">{req.department || 'Staff'}</span>
                        </div>
                      </div>
                      {getStatusBadge(req.status)}
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-6">
                        <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div className="text-dimmed x-small fw-800 uppercase mb-1">Leave Type</div>
                          <div className="text-white fw-700 small">{req.type}</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div className="text-dimmed x-small fw-800 uppercase mb-1">Duration</div>
                          <div className="text-white fw-700 small">{req.days} Day(s)</div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="d-flex align-items-center gap-2 mb-2 text-dimmed small fw-600">
                        <Calendar size={14} className="text-cyan" />
                        {new Date(req.start_date).toLocaleDateString()} to {new Date(req.end_date).toLocaleDateString()}
                      </div>
                      <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--midnight-border)' }}>
                        <div className="text-secondary small fw-500 line-clamp-3">
                          "{req.reason || 'No reason provided'}"
                        </div>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      {req.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApproval(req.id, 'approved')} 
                            className="btn btn-premium-success flex-grow-1" 
                            disabled={loading === req.id}
                          >
                            {loading === req.id ? <div className="spinner-border spinner-border-sm" /> : 'Approve'}
                          </button>
                          <button 
                            onClick={() => handleApproval(req.id, 'rejected')} 
                            className="btn btn-premium-danger flex-grow-1" 
                            disabled={loading === req.id}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {isAdmin && (
                        <button 
                          onClick={() => handleDelete(req.id)} 
                          className="btn btn-premium-secondary"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-12">
                <div className="premium-card p-5 text-center">
                  <div className="text-dimmed mb-3">
                    <Clock size={48} className="opacity-10" />
                  </div>
                  <h4 className="text-white fw-700">No Leave Requests Found</h4>
                  <p className="text-dimmed small">There are no pending or history items to show for this filter.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'balances' && (
        <div className="fade-in">
          {/* Balance Filters */}
          <div className="premium-card mb-5 p-4" style={{ background: 'var(--midnight-surface)' }}>
            <div className="row align-items-end g-4">
              <div className="col-md-4">
                <label className="text-dimmed x-small fw-800 uppercase letter-spacing-1 mb-2 d-block">Search Quota</label>
                <div className="position-relative">
                  <Search size={14} className="position-absolute text-secondary" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    className="form-control premium-input ps-5" 
                    placeholder="Employee or department..." 
                    value={balanceSearch}
                    onChange={(e) => setBalanceSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-auto ms-auto">
                 <div className="text-dimmed x-small fw-800 uppercase letter-spacing-1 text-end">
                    ANNUAL QUOTA: {new Date().getFullYear()}
                 </div>
              </div>
            </div>
          </div>

          <div className="premium-card overflow-hidden">
            <div className="premium-card-header bg-transparent border-bottom border-secondary border-opacity-10 py-4">
              <h5 className="text-white fw-800 mb-0 d-flex align-items-center gap-2">
                <Briefcase size={20} className="text-cyan" />
                Employee Leave Quotas
              </h5>
            </div>
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
                <thead>
                  <tr className="border-bottom border-secondary border-opacity-10">
                    <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1">Employee</th>
                    <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1 text-center">Sick (SL)</th>
                    <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1 text-center">Casual (CL)</th>
                    <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1 text-center">Earned (PL)</th>
                    <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1 text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBalances.length > 0 ? filteredBalances.map(bal => (
                    <React.Fragment key={bal.employee_id}>
                      <tr className={`border-bottom border-secondary border-opacity-05 ${editingBalanceId === bal.employee_id ? 'bg-cyan bg-opacity-05' : ''}`}>
                        <td className="px-4 py-4">
                          <div className="d-flex align-items-center gap-3">
                            <div className="user-avatar-sm" style={{ width: 40, height: 40, background: 'var(--midnight-elevated)' }}>
                              {bal.employee_name?.charAt(0)}
                            </div>
                            <div>
                              <div className="text-white fw-700 small">{bal.employee_name}</div>
                              <div className="text-dimmed x-small">{bal.department || 'Staff'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="d-flex flex-column align-items-center">
                            <span className="text-white fw-800 h5 mb-0">{bal.sl}</span>
                            <span className="text-dimmed x-small fw-600">Used: {bal.used_sl}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="d-flex flex-column align-items-center">
                            <span className="text-white fw-800 h5 mb-0">{bal.cl}</span>
                            <span className="text-dimmed x-small fw-600">Used: {bal.used_cl}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="d-flex flex-column align-items-center">
                            <span className="text-white fw-800 h5 mb-0">{bal.pl}</span>
                            <span className="text-dimmed x-small fw-600">Used: {bal.used_pl}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-end">
                          <button 
                            onClick={() => openBalanceEdit(bal)} 
                            className={`btn btn-sm px-4 py-2 ${editingBalanceId === bal.employee_id ? 'btn-premium-cyan shadow-glow-cyan' : 'btn-premium-cyan'}`}
                          >
                            Adjust
                          </button>
                        </td>
                      </tr>
                      {editingBalanceId === bal.employee_id && (
                        <tr className="bg-cyan bg-opacity-02">
                          <td colSpan={5} className="p-0 border-0">
                            <div className="p-4 mx-4 mb-4 rounded-3 border border-cyan border-opacity-10 shadow-lg fade-in" style={{ background: 'rgba(255,255,255,0.01)' }}>
                              <form onSubmit={handleUpdateBalance}>
                                <div className="row g-4">
                                  <div className="col-md-6">
                                    <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--midnight-border)' }}>
                                      <h6 className="text-white x-small fw-800 uppercase mb-3">Total Allowed</h6>
                                      <div className="row g-2">
                                        <div className="col-4">
                                          <label className="text-dimmed xx-small fw-800 uppercase mb-1 d-block">SL</label>
                                          <input type="number" step="0.5" className="form-control form-control-sm bg-dark border-secondary border-opacity-20" value={editBalance.sl} onChange={e => setEditBalance({...editBalance, sl: parseFloat(e.target.value) || 0})} />
                                        </div>
                                        <div className="col-4">
                                          <label className="text-dimmed xx-small fw-800 uppercase mb-1 d-block">CL</label>
                                          <input type="number" step="0.5" className="form-control form-control-sm bg-dark border-secondary border-opacity-20" value={editBalance.cl} onChange={e => setEditBalance({...editBalance, cl: parseFloat(e.target.value) || 0})} />
                                        </div>
                                        <div className="col-4">
                                          <label className="text-dimmed xx-small fw-800 uppercase mb-1 d-block">PL</label>
                                          <input type="number" step="0.5" className="form-control form-control-sm bg-dark border-secondary border-opacity-20" value={editBalance.pl} onChange={e => setEditBalance({...editBalance, pl: parseFloat(e.target.value) || 0})} />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="p-3 rounded-3" style={{ background: 'rgba(99,102,241,0.03)', border: '1px solid rgba(99,102,241,0.1)' }}>
                                      <h6 className="text-indigo x-small fw-800 uppercase mb-3">Used (Adjust)</h6>
                                      <div className="row g-2">
                                        <div className="col-4">
                                          <label className="text-dimmed xx-small fw-800 uppercase mb-1 d-block">SL</label>
                                          <input type="number" step="0.5" className="form-control form-control-sm bg-dark border-secondary border-opacity-20" value={editBalance.used_sl} onChange={e => setEditBalance({...editBalance, used_sl: parseFloat(e.target.value) || 0})} />
                                        </div>
                                        <div className="col-4">
                                          <label className="text-dimmed xx-small fw-800 uppercase mb-1 d-block">CL</label>
                                          <input type="number" step="0.5" className="form-control form-control-sm bg-dark border-secondary border-opacity-20" value={editBalance.used_cl} onChange={e => setEditBalance({...editBalance, used_cl: parseFloat(e.target.value) || 0})} />
                                        </div>
                                        <div className="col-4">
                                          <label className="text-dimmed xx-small fw-800 uppercase mb-1 d-block">PL</label>
                                          <input type="number" step="0.5" className="form-control form-control-sm bg-dark border-secondary border-opacity-20" value={editBalance.used_pl} onChange={e => setEditBalance({...editBalance, used_pl: parseFloat(e.target.value) || 0})} />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-12 d-flex justify-content-end gap-2">
                                    <button type="button" onClick={() => setEditingBalanceId(null)} className="btn btn-sm btn-premium-secondary px-4">Cancel</button>
                                    <button type="submit" className="btn btn-sm btn-premium-cyan px-4 shadow-glow-cyan">Save Changes</button>
                                  </div>
                                </div>
                              </form>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )) : (
                    <tr>
                      <td colSpan={5} className="text-center py-5">
                        <div className="text-dimmed small">{balanceLoading ? 'Fetching data...' : 'No balance records found.'}</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper

export default LeaveApprovals;
