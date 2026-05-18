import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Receipt, PlusCircle, CheckCircle, XCircle, Trash2, Search, Edit2 } from 'lucide-react';

const Expenses: React.FC = () => {
  const { isAdmin } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ title: '', amount: '', date: '' });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.getExpenses();
      if (res.success) setExpenses(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !date) return;
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('amount', amount);
      fd.append('date', date);
      if (attachment) {
        fd.append('attachment', attachment);
      }
      const res = await api.submitExpense(fd);
      if (res.success) {
        setMessage('Claim submitted successfully!');
        setTitle('');
        setAmount('');
        setDate('');
        setAttachment(null);
        fetchExpenses();
      } else {
        setMessage(res.message || 'Failed to submit claim');
      }
    } catch (err) {
      setMessage('Failed to submit claim');
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (!confirm('Are you sure you want to delete this expense claim?')) return;
    try {
      const res = await api.deleteExpense(id);
      if (res.success) {
        fetchExpenses();
      } else {
        alert(res.message || 'Failed to delete expense');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (id: number, status: 'approved' | 'rejected') => {
    try {
      const res = await api.approveExpense(id, status);
      if (res.success) {
        fetchExpenses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null) return;
    try {
      const res = await api.updateExpense(editingId, editData);
      if (res.success) {
        setEditingId(null);
        fetchExpenses();
      } else {
        alert(res.message || 'Failed to update expense');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (exp: any) => {
    if (editingId === exp.id) {
      setEditingId(null);
      return;
    }
    setEditingId(exp.id);
    setEditData({ title: exp.title, amount: exp.amount, date: exp.date });
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}><div className="premium-spinner" /></div>;

  return (
    <div className="container-fluid fade-in px-0">
      <div className="row mb-5">
        <div className="col-12">
          <h1 className="display-5 fw-800 text-white mb-2">Expenses & Claims</h1>
          <p className="text-secondary fw-500 mb-0">Track reimbursements and financial claims across the organization.</p>
        </div>
      </div>

      <div className="row g-4">
        {!isAdmin && (
          <div className="col-xl-4">
            <div className="premium-card">
              <div className="premium-card-header bg-transparent border-bottom border-secondary border-opacity-10 py-4">
                <h5 className="text-white fw-800 mb-0 d-flex align-items-center">
                  <PlusCircle className="me-2 text-cyan" size={20} /> Submit Claim
                </h5>
              </div>
              <div className="premium-card-body p-4">
                {message && (
                  <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'} border-0 py-3 text-white small mb-4`} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    {message}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="text-dimmed x-small fw-800 text-uppercase mb-2 d-block letter-spacing-1">Title / Purpose</label>
                    <input 
                      type="text" 
                      className="form-control premium-input" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      placeholder="e.g. Client Meeting Travel" 
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="text-dimmed x-small fw-800 text-uppercase mb-2 d-block letter-spacing-1">Amount (INR)</label>
                    <div className="position-relative">
                      <span className="position-absolute text-secondary fw-bold" style={{ left: '16px', top: '50%', transform: 'translateY(-50%)' }}>₹</span>
                      <input 
                        type="number" 
                        className="form-control premium-input ps-5" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                        placeholder="0.00" 
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="text-dimmed x-small fw-800 text-uppercase mb-2 d-block letter-spacing-1">Expense Date</label>
                    <input 
                      type="date" 
                      className="form-control premium-input" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)} 
                      required
                    />
                  </div>
                  <div className="mb-5">
                    <label className="text-dimmed x-small fw-800 text-uppercase mb-2 d-block letter-spacing-1">Proof of Expense</label>
                    <input 
                      type="file" 
                      className="form-control premium-input" 
                      accept=".pdf,.xlsx,.xls,.doc,.docx,.png,.jpg,.jpeg,.csv"
                      onChange={(e) => setAttachment(e.target.files?.[0] || null)} 
                    />
                    <div className="text-dimmed x-small mt-2">Max file size: 5MB (PDF, Images, Excel)</div>
                  </div>
                  <button type="submit" className="btn btn-premium-cyan w-100 py-3 fw-800 shadow-glow-cyan">
                    Submit Reimbursement
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className={isAdmin ? 'col-12' : 'col-xl-8'}>
          <div className="premium-card">
            <div className="premium-card-header bg-transparent border-bottom border-secondary border-opacity-10 py-4 d-flex justify-content-between align-items-center">
              <h5 className="text-white fw-800 mb-0 d-flex align-items-center">
                <Receipt className="me-2 text-cyan" size={20} /> Reimbursement Logs
              </h5>
              <span className="badge-premium badge-premium-indigo">{expenses.length} TOTAL CLAIMS</span>
            </div>

            <div className="p-4 bg-midnight-surface border-bottom border-secondary border-opacity-05">
              <div className="row g-4 align-items-end">
                <div className="col-md-5">
                  <label className="text-dimmed x-small fw-800 uppercase letter-spacing-1 mb-2 d-block">Search Claims</label>
                  <div className="position-relative">
                    <Search size={14} className="position-absolute text-secondary" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="text" 
                      className="form-control premium-input ps-5" 
                      placeholder="Description or employee..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="text-dimmed x-small fw-800 uppercase letter-spacing-1 mb-2 d-block">Filter Status</label>
                  <select 
                    className="form-select premium-input" 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="text-dimmed x-small fw-800 uppercase letter-spacing-1 mb-2 d-block">Filter Month</label>
                  <input 
                    type="month" 
                    className="form-control premium-input" 
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
                <thead>
                  <tr className="border-bottom border-secondary border-opacity-10">
                    {isAdmin && <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1">Employee</th>}
                    <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1">Title</th>
                    <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1 text-end">Amount</th>
                    <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1">Date</th>
                    <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1 text-center">Status</th>
                    <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1 text-center">Proof</th>
                    <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.filter(exp => {
                    const matchesStatus = !filterStatus || exp.status === filterStatus;
                    const matchesMonth = !filterMonth || (exp.date && exp.date.startsWith(filterMonth));
                    const matchesSearch = !searchQuery || 
                      (exp.title && exp.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
                      (exp.employee_name && exp.employee_name.toLowerCase().includes(searchQuery.toLowerCase()));
                    return matchesStatus && matchesMonth && matchesSearch;
                  }).map((exp: any) => (
                    <React.Fragment key={exp.id}>
                      <tr className={`border-bottom border-secondary border-opacity-05 ${editingId === exp.id ? 'bg-cyan bg-opacity-05' : ''}`}>
                      {isAdmin && (
                        <td className="px-4 py-4">
                          <div className="d-flex align-items-center gap-2">
                             <div className="user-avatar-sm" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>{exp.employee_name?.charAt(0)}</div>
                             <div className="text-white fw-600 small">{exp.employee_name}</div>
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-4">
                        <div className="text-white fw-700 small">{exp.title}</div>
                        <div className="text-dimmed x-small">ID: #{exp.id}</div>
                      </td>
                      <td className="px-4 py-4 text-end">
                        <div className="text-cyan fw-800 font-monospace h6 mb-0">₹{Number(exp.amount).toLocaleString('en-IN')}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-secondary small fw-600">{new Date(exp.date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`badge-premium ${
                          exp.status === 'approved' ? 'badge-premium-success' : 
                          exp.status === 'rejected' ? 'badge-premium-danger' : 'badge-premium-warning'
                        }`}>
                          {exp.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {exp.attachment_path ? (
                          <a href={`/api/${exp.attachment_path.replace('api/', '')}`} 
                             target="_blank" 
                             rel="noreferrer" 
                             className="btn btn-premium-secondary btn-sm px-3 x-small">
                            View Proof
                          </a>
                        ) : (
                          <span className="text-dimmed x-small">No file</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-end">
                        <div className="d-flex justify-content-end gap-2">
                          {isAdmin && exp.status === 'pending' && (
                            <>
                              <button onClick={() => handleApprove(exp.id, 'approved')} className="btn btn-premium-success btn-sm p-2" title="Approve"><CheckCircle size={14} /></button>
                              <button onClick={() => handleApprove(exp.id, 'rejected')} className="btn btn-premium-danger btn-sm p-2" title="Reject"><XCircle size={14} /></button>
                            </>
                          )}
                          {(isAdmin || exp.status !== 'approved') && (
                            <>
                              <button onClick={() => startEdit(exp)} className={`btn btn-sm p-2 ${editingId === exp.id ? 'btn-premium-cyan shadow-glow-cyan' : 'btn-premium-secondary'}`} title="Edit Claim">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => handleDeleteExpense(exp.id)} className="btn btn-premium-secondary btn-sm p-2" title="Delete Claim">
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {editingId === exp.id && (
                        <tr className="bg-cyan bg-opacity-02">
                          <td colSpan={isAdmin ? 7 : 6} className="p-0 border-0">
                            <div className="p-4 mx-4 mb-4 rounded-3 border border-cyan border-opacity-10 shadow-lg fade-in" style={{ background: 'rgba(255,255,255,0.01)' }}>
                              <form onSubmit={handleUpdateExpense}>
                                <div className="row g-4">
                                  <div className="col-12">
                                    <label className="text-dimmed x-small fw-800 uppercase mb-2 d-block">Title / Purpose</label>
                                    <input type="text" className="form-control form-control-sm bg-dark border-secondary border-opacity-20 text-white" value={editData.title} onChange={(e) => setEditData({...editData, title: e.target.value})} required />
                                  </div>
                                  <div className="col-md-6">
                                    <label className="text-dimmed x-small fw-800 uppercase mb-2 d-block">Amount (INR)</label>
                                    <div className="position-relative">
                                      <span className="position-absolute text-secondary fw-bold" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem' }}>₹</span>
                                      <input type="number" className="form-control form-control-sm bg-dark border-secondary border-opacity-20 text-white ps-4" value={editData.amount} onChange={(e) => setEditData({...editData, amount: e.target.value})} required />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <label className="text-dimmed x-small fw-800 uppercase mb-2 d-block">Date</label>
                                    <input type="date" className="form-control form-control-sm bg-dark border-secondary border-opacity-20 text-white" value={editData.date} onChange={(e) => setEditData({...editData, date: e.target.value})} required />
                                  </div>
                                  <div className="col-12 d-flex justify-content-end gap-2 mt-4">
                                    <button type="button" onClick={() => setEditingId(null)} className="btn btn-sm btn-premium-secondary px-4">Cancel</button>
                                    <button type="submit" className="btn btn-sm btn-premium-cyan px-4 shadow-glow-cyan">Save Changes</button>
                                  </div>
                                </div>
                              </form>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
