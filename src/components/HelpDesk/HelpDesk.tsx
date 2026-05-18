import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { LifeBuoy, Plus, MessageSquare, AlertCircle, CheckCircle, Clock, ChevronLeft, Send, Trash2 } from 'lucide-react';

const HelpDesk: React.FC = () => {
  const { user, isAdmin, isManager } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Create form state
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('general');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.getTickets();
      if (res.success) {
        setTickets(res.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (ticketId: number) => {
    try {
      const res = await api.getTicketMessages(ticketId);
      if (res.success) {
        setMessages(res.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;
    try {
      const res = await api.createTicket({ subject, description, priority, category });
      if (res.success) {
        setSubject('');
        setDescription('');
        setPriority('medium');
        setCategory('general');
        setView('list');
        fetchTickets();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;
    try {
      const res = await api.addTicketMessage(selectedTicket.id, newMessage);
      if (res.success) {
        setNewMessage('');
        fetchMessages(selectedTicket.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusChange = async (ticketId: number, status: string) => {
    try {
      const res = await api.updateTicketStatus(ticketId, status);
      if (res.success) {
        fetchTickets();
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setView('detail');
    fetchMessages(ticket.id);
  };

  return (
    <div className="container-fluid fade-in px-0 py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="display-6 fw-800 text-white mb-2 d-flex align-items-center">
              <LifeBuoy className="text-cyan me-3" size={32} /> Help Desk
            </h1>
            <p className="text-secondary fw-600 mb-0">Get support, report issues, or track your ongoing requests.</p>
          </div>
          {view === 'list' ? (
            !isAdmin && (
              <button 
                onClick={() => setView('create')} 
                className="btn btn-premium-add d-flex align-items-center px-4 py-3 shadow-glow-cyan"
                style={{ borderRadius: '12px' }}
              >
                <Plus size={20} className="me-2" /> New Ticket
              </button>
            )
          ) : (
            <button 
              onClick={() => { setView('list'); setSelectedTicket(null); }} 
              className="btn btn-outline-secondary d-flex align-items-center px-4 py-2"
              style={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            >
              <ChevronLeft size={18} className="me-2" /> Back to List
            </button>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          {view === 'list' && (
            <div className="premium-card shadow-lg fade-in" style={{ background: 'var(--midnight-card)' }}>
              {loading ? (
                <div className="text-center py-5">
                  <div className="premium-spinner mx-auto mb-3"></div>
                  <p className="text-dimmed">Fetching your tickets...</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-5 px-4">
                  <div className="mb-4 opacity-20">
                    <LifeBuoy size={80} className="text-cyan mx-auto" />
                  </div>
                  <h4 className="text-white fw-800">No Tickets Yet</h4>
                  <p className="text-dimmed mb-4">{isAdmin ? 'No tickets have been submitted yet.' : 'Need help? Create your first support ticket to get started.'}</p>
                  {!isAdmin && (
                    <button onClick={() => setView('create')} className="btn btn-premium-cyan px-5">
                      <Plus size={18} className="me-2" /> Create First Ticket
                    </button>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle mb-0">
                    <thead className="border-bottom border-secondary border-opacity-10">
                      <tr>
                        <th className="px-4 py-3 text-dimmed small fw-700">Ticket Details</th>
                        {(isAdmin || isManager) && <th className="px-4 py-3 text-dimmed small fw-700">Requester</th>}
                        <th className="px-4 py-3 text-dimmed small fw-700 d-none d-md-table-cell">Category</th>
                        <th className="px-4 py-3 text-dimmed small fw-700">Status</th>
                        <th className="px-4 py-3 text-dimmed small fw-700 text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map(ticket => (
                        <tr key={ticket.id} onClick={() => openTicket(ticket)} className="cursor-pointer border-bottom border-secondary border-opacity-05">
                          <td className="px-4 py-3">
                            <div className="d-flex align-items-center">
                              <div className="ticket-icon me-3 d-none d-sm-flex align-items-center justify-content-center" 
                                   style={{ width: '36px', height: '36px', background: 'rgba(6, 182, 212, 0.05)', borderRadius: '10px', color: 'var(--accent-cyan)' }}>
                                <MessageSquare size={16} />
                              </div>
                              <div>
                                <div className="fw-700 text-white small mb-0">{ticket.subject}</div>
                                <div className="text-dimmed x-small fw-600">#{ticket.id} • {new Date(ticket.created_at).toLocaleDateString()}</div>
                              </div>
                            </div>
                          </td>
                          {(isAdmin || isManager) && (
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-center">
                                <div className="user-avatar-sm me-2" style={{ width: '24px', height: '24px', fontSize: '0.6rem' }}>{ticket.employee_name?.charAt(0)}</div>
                                <div className="fw-600 small text-secondary d-none d-sm-block">{ticket.employee_name}</div>
                              </div>
                            </td>
                          )}
                          <td className="px-4 py-3 d-none d-md-table-cell">
                            <span className="badge-premium badge-premium-indigo" style={{ fontSize: '0.6rem' }}>{ticket.category.replace('_', ' ')}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="d-flex align-items-center gap-2">
                              <div className={`status-dot ${ticket.status}`} style={{ 
                                width: '6px', 
                                height: '6px', 
                                borderRadius: '50%',
                                backgroundColor: ticket.status === 'resolved' ? 'var(--success)' : 
                                               ticket.status === 'in_progress' ? 'var(--info)' : 'var(--warning)',
                                boxShadow: `0 0 8px ${ticket.status === 'resolved' ? 'var(--success)' : 
                                                     ticket.status === 'in_progress' ? 'var(--info)' : 'var(--warning)'}`
                              }}></div>
                              <span className="text-capitalize x-small fw-700 text-white opacity-80">
                                {ticket.status.replace('_', ' ')}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-end">
                            <button className="btn btn-sm btn-outline-secondary py-1 px-3 fw-700" style={{ fontSize: '0.65rem' }}>
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {view === 'create' && (
            <div className="row justify-content-center fade-in">
              <div className="col-lg-7">
                <div className="premium-card shadow-lg">
                  <div className="premium-card-header bg-transparent border-bottom border-secondary border-opacity-10 py-4">
                    <h4 className="text-white fw-800 mb-0">Create New Support Ticket</h4>
                    <p className="text-dimmed small mb-0 mt-1">Fill in the details below and our team will get back to you shortly.</p>
                  </div>
                  <div className="premium-card-body p-4">
                    <form onSubmit={handleCreateSubmit}>
                      <div className="mb-4">
                        <label className="text-secondary small fw-700 mb-2 text-uppercase">Subject</label>
                        <input 
                          type="text" 
                          className="form-control premium-input" 
                          value={subject} 
                          onChange={e => setSubject(e.target.value)} 
                          required 
                          placeholder="What can we help you with?"
                        />
                      </div>
                      <div className="row mb-4">
                        <div className="col-md-6">
                          <label className="text-secondary small fw-700 mb-2 text-uppercase">Category</label>
                          <select 
                            className="form-select premium-input" 
                            value={category} 
                            onChange={e => setCategory(e.target.value)}
                          >
                            <option value="general">General Inquiry</option>
                            <option value="it_support">IT & Technical Support</option>
                            <option value="hr_payroll">HR & Payroll</option>
                            <option value="hardware">Hardware Request</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="text-secondary small fw-700 mb-2 text-uppercase">Priority</label>
                          <select 
                            className="form-select premium-input" 
                            value={priority} 
                            onChange={e => setPriority(e.target.value)}
                          >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                          </select>
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="text-secondary small fw-700 mb-2 text-uppercase">Detailed Description</label>
                        <textarea 
                          className="form-control premium-input" 
                          rows={5}
                          value={description} 
                          onChange={e => setDescription(e.target.value)} 
                          required 
                          placeholder="Please provide as much detail as possible..."
                        />
                      </div>
                      <div className="d-flex gap-3">
                        <button type="button" onClick={() => setView('list')} className="btn btn-premium-secondary flex-grow-1">
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-premium-cyan flex-grow-2">
                          Submit Ticket
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === 'detail' && selectedTicket && (
            <div className="row fade-in">
              <div className="col-lg-8 mb-4">
                <div className="premium-card d-flex flex-column h-100 shadow-lg" style={{ minHeight: '650px' }}>
                  {/* Chat Header */}
                  <div className="p-4 border-bottom border-secondary border-opacity-10 d-flex justify-content-between align-items-center bg-transparent">
                    <div className="d-flex align-items-center">
                      <div className="me-3 p-3 rounded-3" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}>
                        <LifeBuoy size={24} />
                      </div>
                      <div>
                        <h5 className="text-white fw-800 mb-1">{selectedTicket.subject}</h5>
                        <div className="text-dimmed small fw-600 d-flex align-items-center gap-2">
                          <span>Ticket #{selectedTicket.id}</span>
                          <span className="opacity-30">•</span>
                          <span className="text-capitalize">{selectedTicket.category.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-end">
                       <span className={`badge-premium ${
                          selectedTicket.status === 'resolved' ? 'badge-premium-success' : 
                          selectedTicket.status === 'in_progress' ? 'badge-premium-indigo' : 'badge-premium-warning'
                        }`}>
                          {selectedTicket.status.replace('_', ' ')}
                        </span>
                        <div className="text-dimmed x-small mt-1 fw-600">Opened {new Date(selectedTicket.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="chat-messages p-4 flex-grow-1 overflow-auto custom-scrollbar" style={{ maxHeight: '450px' }}>
                    {/* Original Request */}
                    <div className="d-flex mb-4">
                      <div className="user-avatar-sm me-3 mt-1" style={{ background: 'var(--midnight-elevated)', border: '1px solid var(--midnight-border-bright)' }}>
                        {selectedTicket.employee_name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="text-white fw-700 small">{selectedTicket.employee_name || 'User'} <span className="text-dimmed fw-500 ms-2">(Original Request)</span></span>
                          <span className="text-dimmed x-small">{new Date(selectedTicket.created_at).toLocaleString()}</span>
                        </div>
                        <div className="p-3 rounded-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.03)', color: '#e2e8f0', fontSize: '0.9rem', lineHeight: '1.6' }}>
                          {selectedTicket.description}
                        </div>
                      </div>
                    </div>

                    <div className="separator mb-4 d-flex align-items-center gap-3">
                       <div className="flex-grow-1" style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
                       <span className="text-dimmed x-small fw-700 text-uppercase letter-spacing-1">Conversation</span>
                       <div className="flex-grow-1" style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
                    </div>

                    {messages.length === 0 ? (
                       <div className="text-center py-4 opacity-50">
                          <MessageSquare size={32} className="mx-auto mb-2 text-dimmed" />
                          <p className="text-dimmed small">No replies yet</p>
                       </div>
                    ) : (
                      messages.map(msg => (
                        <div key={msg.id} className={`d-flex mb-4 ${msg.sender_id === user?.id ? 'flex-row-reverse' : ''}`}>
                          <div className={`${msg.sender_id === user?.id ? 'ms-3' : 'me-3'} mt-1`}>
                             <div className="user-avatar-sm" style={{ 
                                background: msg.sender_id === user?.id ? 'var(--accent-cyan)' : 'var(--midnight-elevated)', 
                                color: msg.sender_id === user?.id ? '#000' : 'var(--accent-cyan)',
                                border: '1px solid var(--midnight-border-bright)'
                             }}>
                                {msg.sender_name?.charAt(0) || 'A'}
                             </div>
                          </div>
                          <div className={`flex-grow-1 ${msg.sender_id === user?.id ? 'text-end' : ''}`} style={{ maxWidth: '80%' }}>
                            <div className={`d-flex align-items-center gap-2 mb-2 ${msg.sender_id === user?.id ? 'justify-content-end' : ''}`}>
                              <span className="text-white fw-700 small">{msg.sender_name}</span>
                              <span className="text-dimmed x-small">{new Date(msg.created_at).toLocaleString()}</span>
                            </div>
                            <div className="p-3 rounded-4" style={{ 
                               background: msg.sender_id === user?.id ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.05))' : 'rgba(255,255,255,0.03)', 
                               border: msg.sender_id === user?.id ? '1px solid rgba(6, 182, 212, 0.1)' : '1px solid rgba(255,255,255,0.03)',
                               color: '#e2e8f0', 
                               fontSize: '0.9rem', 
                               lineHeight: '1.6',
                               textAlign: 'left',
                               display: 'inline-block'
                            }}>
                              {msg.message}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Reply Box */}
                  <div className="p-4 border-top border-secondary border-opacity-10 mt-auto bg-transparent">
                    {selectedTicket.status === 'resolved' ? (
                      <div className="text-center p-4 rounded-4" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                        <div className="d-flex align-items-center justify-content-center gap-2 mb-1 fw-800">
                           <CheckCircle size={20} /> TICKET RESOLVED
                        </div>
                        <p className="small mb-0 opacity-70">This ticket has been marked as resolved and is now closed for replies.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSendMessage} className="d-flex gap-3">
                        <input 
                          type="text" 
                          className="form-control premium-input border-0 py-3 px-4" 
                          style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.04)' }}
                          value={newMessage} 
                          onChange={e => setNewMessage(e.target.value)} 
                          placeholder="Type your message here..."
                          required
                        />
                        <button type="submit" className="btn btn-premium-cyan px-4" style={{ borderRadius: '14px' }}>
                          <Send size={18} className="me-2" /> Send
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="col-lg-4">
                <div className="premium-card p-4 mb-4 shadow-lg h-100">
                  <h5 className="text-white fw-800 mb-4 pb-2 border-bottom border-secondary border-opacity-10">Ticket Metadata</h5>
                  
                  <div className="metadata-item mb-4">
                    <div className="text-dimmed x-small fw-800 text-uppercase mb-2 letter-spacing-1">Requester</div>
                    <div className="d-flex align-items-center p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
                       <div className="user-avatar-sm me-3">{selectedTicket.employee_name?.charAt(0)}</div>
                       <div className="text-white fw-700">{selectedTicket.employee_name}</div>
                    </div>
                  </div>
                  
                  <div className="row mb-4">
                     <div className="col-6">
                        <div className="text-dimmed x-small fw-800 text-uppercase mb-2 letter-spacing-1">Category</div>
                        <div className="text-white fw-700 text-capitalize small p-2 rounded-2 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                           {selectedTicket.category.replace('_', ' ')}
                        </div>
                     </div>
                     <div className="col-6">
                        <div className="text-dimmed x-small fw-800 text-uppercase mb-2 letter-spacing-1">Priority</div>
                        <div className={`badge-premium w-100 text-center ${
                           selectedTicket.priority === 'high' ? 'badge-premium-danger' : 
                           selectedTicket.priority === 'medium' ? 'badge-premium-warning' : 'badge-premium-cyan'
                        }`}>
                           {selectedTicket.priority}
                        </div>
                     </div>
                  </div>

                  {(isAdmin || isManager) && selectedTicket.status !== 'resolved' && (
                    <div className="pt-4 mt-4 border-top border-secondary border-opacity-10">
                      <h6 className="text-dimmed x-small fw-800 text-uppercase mb-3 letter-spacing-1">Management Actions</h6>
                      <div className="d-grid gap-3">
                        <button 
                          onClick={() => handleStatusChange(selectedTicket.id, 'in_progress')} 
                          className="btn btn-premium-secondary d-flex justify-content-between align-items-center"
                          disabled={selectedTicket.status === 'in_progress'}
                        >
                          <span>In Progress</span>
                          <Clock size={16} />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(selectedTicket.id, 'resolved')} 
                          className="btn btn-premium-success d-flex justify-content-between align-items-center"
                        >
                          <span>Resolve Ticket</span>
                          <CheckCircle size={16} />
                        </button>
                        {isAdmin && (
                          <button 
                            onClick={async () => {
                              if (confirm('Are you sure you want to permanently delete this ticket?')) {
                                try {
                                  const res = await api.deleteTicket(selectedTicket.id);
                                  if (res.success) {
                                    setView('list');
                                    fetchTickets();
                                  }
                                } catch (e) { console.error(e); }
                              }
                            }} 
                            className="btn btn-outline-danger d-flex justify-content-between align-items-center mt-2"
                            style={{ borderRadius: '10px', fontSize: '0.75rem' }}
                          >
                            <span>Delete Ticket</span>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-5 p-4 rounded-4" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05), transparent)', border: '1px dashed rgba(6, 182, 212, 0.2)' }}>
                     <p className="text-dimmed small mb-0 fw-500">
                        <AlertCircle size={14} className="me-2 text-cyan" />
                        Our support team usually responds within 2-4 hours during business days.
                     </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpDesk;
