import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Receipt, PlusCircle, CheckCircle, XCircle, Trash2 } from 'lucide-react';

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

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-cyan" /></div>;

  return (
    <div className="container-fluid fade-in">
      <h1 className="display-6 fw-800 text-white mb-4">Expenses & Claims</h1>

      <div className="row g-4">
        {!isAdmin && (
          <div className="col-md-5">
            <div className="premium-card p-4" style={{ 
              background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
              <h5 className="text-white fw-800 mb-4 d-flex align-items-center" style={{ letterSpacing: '0.5px' }}>
                <PlusCircle className="me-2 text-cyan" size={22} /> Submit Reimbursement
              </h5>
              {message && (
                <div className="alert border-0 py-2 text-white small mb-4" style={{ 
                  background: 'rgba(6, 182, 212, 0.15)', 
                  borderLeft: '4px solid var(--accent-cyan)',
                  borderRadius: '8px'
                }}>
                  {message}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="text-secondary small fw-700 text-uppercase mb-2 d-block" style={{ letterSpacing: '0.5px' }}>Title/Reason</label>
                  <input 
                    type="text" 
                    className="form-control text-white" 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.03)', 
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                    }}
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="e.g. Travel fuel" 
                  />
                </div>
                <div className="mb-3">
                  <label className="text-secondary small fw-700 text-uppercase mb-2 d-block" style={{ letterSpacing: '0.5px' }}>Amount (INR)</label>
                  <input 
                    type="number" 
                    className="form-control text-white" 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.03)', 
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                    }}
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    placeholder="0.00" 
                  />
                </div>
                <div className="mb-3">
                  <label className="text-secondary small fw-700 text-uppercase mb-2 d-block" style={{ letterSpacing: '0.5px' }}>Expense Date</label>
                  <input 
                    type="date" 
                    className="form-control text-white" 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.03)', 
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                    }}
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                  />
                </div>
                <div className="mb-4">
                  <label className="text-secondary small fw-700 text-uppercase mb-2 d-block" style={{ letterSpacing: '0.5px' }}>Proof / Attachment</label>
                  <input 
                    type="file" 
                    className="form-control text-white" 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.03)', 
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                    }}
                    accept=".pdf,.xlsx,.xls,.doc,.docx,.png,.jpg,.jpeg,.csv"
                    onChange={(e) => setAttachment(e.target.files?.[0] || null)} 
                  />
                </div>
                <button type="submit" className="btn btn-premium-cyan w-100 py-3 fw-800 shadow-glow-cyan" style={{ borderRadius: '12px' }}>
                  Submit Claim
                </button>
              </form>
            </div>
          </div>
        )}

        <div className={isAdmin ? 'col-12' : 'col-md-7'}>
          <div className="premium-card p-4" style={{ 
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <h5 className="text-white fw-800 mb-4 d-flex align-items-center" style={{ letterSpacing: '0.5px' }}>
              <Receipt className="me-2 text-cyan" size={22} /> Expense Log
            </h5>

            {/* Filter Controls */}
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <input 
                  type="text" 
                  className="form-control text-white" 
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.03)', 
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '10px 14px'
                  }}
                  placeholder="Search reason or employee..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <select 
                  className="form-select text-white" 
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.03)', 
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '10px 14px'
                  }}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="" className="bg-dark">All Statuses</option>
                  <option value="pending" className="bg-dark">Pending</option>
                  <option value="approved" className="bg-dark">Approved</option>
                  <option value="rejected" className="bg-dark">Rejected</option>
                </select>
              </div>
              <div className="col-md-4">
                <input 
                  type="month" 
                  className="form-control text-white" 
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.03)', 
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '10px 14px'
                  }}
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="table align-middle mb-0" style={{ background: 'transparent', border: 'none' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', borderTop: 'none' }}>
                    {isAdmin && <th className="small fw-800 text-uppercase pb-3" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', letterSpacing: '1px' }}>Employee</th>}
                    <th className="small fw-800 text-uppercase pb-3" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', letterSpacing: '1px' }}>Title</th>
                    <th className="small fw-800 text-uppercase pb-3" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', letterSpacing: '1px' }}>Amount</th>
                    <th className="small fw-800 text-uppercase pb-3" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', letterSpacing: '1px' }}>Date</th>
                    <th className="small fw-800 text-uppercase pb-3" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', letterSpacing: '1px' }}>Status</th>
                    <th className="small fw-800 text-uppercase pb-3" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', letterSpacing: '1px' }}>Attachment</th>
                    <th className="small fw-800 text-uppercase pb-3" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', letterSpacing: '1px' }}>Actions</th>
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
                    <tr key={exp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: 'transparent' }}>
                      {isAdmin && <td className="text-white fw-600 py-3" style={{ background: 'transparent', border: 'none' }}>{exp.employee_name}</td>}
                      <td className="text-white fw-600 py-3" style={{ background: 'transparent', border: 'none' }}>{exp.title}</td>
                      <td className="text-cyan fw-800 py-3" style={{ background: 'transparent', border: 'none' }}>₹{exp.amount}</td>
                      <td className="small fw-600 py-3" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)' }}>{exp.date}</td>
                      <td className="py-3" style={{ background: 'transparent', border: 'none' }}>
                        <span className={`badge rounded-pill text-uppercase px-3 py-2 fw-700`} style={{
                          background: exp.status === 'approved' ? 'rgba(34,197,94,0.15)' : exp.status === 'rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(251,191,36,0.15)',
                          color: exp.status === 'approved' ? 'var(--success)' : exp.status === 'rejected' ? '#ef4444' : 'var(--accent-gold)',
                          fontSize: '0.65rem',
                          letterSpacing: '0.5px'
                        }}>{exp.status}</span>
                      </td>
                      <td className="py-3" style={{ background: 'transparent', border: 'none' }}>
                        {exp.attachment_path ? (
                          <a href={`/api/${exp.attachment_path.replace('api/', '')}`} 
                             target="_blank" 
                             rel="noreferrer" 
                             className="text-cyan small fw-700 d-inline-flex align-items-center gap-1 hover-underline"
                             style={{ cursor: 'pointer', background: 'rgba(6,182,212,0.1)', padding: '6px 12px', borderRadius: '8px', border: 'none' }}>
                            View Proof
                          </a>
                        ) : (
                          <span className="small" style={{ color: 'rgba(255,255,255,0.4)' }}>No file</span>
                        )}
                      </td>
                      <td style={{ background: 'transparent', border: 'none' }}>
                        <div className="d-flex gap-2">
                          {isAdmin && exp.status === 'pending' && (
                            <>
                              <button onClick={() => handleApprove(exp.id, 'approved')} className="btn btn-sm btn-success p-1" title="Approve"><CheckCircle size={16} /></button>
                              <button onClick={() => handleApprove(exp.id, 'rejected')} className="btn btn-sm btn-danger p-1" title="Reject"><XCircle size={16} /></button>
                            </>
                          )}
                          {(isAdmin || exp.status === 'pending') && (
                            <button onClick={() => handleDeleteExpense(exp.id)} className="btn btn-sm btn-danger p-1" title="Delete Claim">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
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
