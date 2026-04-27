import React, { useState} from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { api } from '../../lib/api';
import { Gift, Plus, Edit, Trash2, Calendar, Globe, Building, Star } from 'lucide-react';
import { Holiday as HolidayType } from '../../types';

const Holiday: React.FC = () => {
  const { isAdmin, hasPermission } = useAuth();
  const { holidays, refreshHolidays } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<HolidayType | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'public' as 'public' | 'company' | 'optional',
    description: '',
  });

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.createHoliday(formData);
      if (response.success) {
        setShowAddModal(false);
        setFormData({
          name: '',
          date: '',
          type: 'public',
          description: '',
        });
        await refreshHolidays();
        showSuccessMessage('Holiday added successfully');
      }
    } catch (error) {
      console.error('Add holiday failed:', error);
      showErrorMessage('Failed to add holiday. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditHoliday = (holiday: HolidayType) => {
    setEditingHoliday(holiday);
    setFormData({
      name: holiday.name,
      date: holiday.date,
      type: holiday.type,
      description: holiday.description || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHoliday) return;

    setLoading(true);
    try {
      const response = await api.updateHoliday(editingHoliday.id, formData);
      if (response.success) {
        setShowEditModal(false);
        setEditingHoliday(null);
        await refreshHolidays();
        showSuccessMessage('Holiday updated successfully');
      }
    } catch (error) {
      console.error('Update holiday failed:', error);
      showErrorMessage('Failed to update holiday. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHoliday = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await api.deleteHoliday(id);
      if (response.success) {
        await refreshHolidays();
        showSuccessMessage('Holiday deleted successfully');
      }
    } catch (error) {
      console.error('Delete holiday failed:', error);
      showErrorMessage('Failed to delete holiday. Please try again.');
    }
  };

  const showSuccessMessage = (message: string) => {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed';
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
      <strong>Success!</strong> ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
  };

  const showErrorMessage = (message: string) => {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed';
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
      <strong>Error!</strong> ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'public':
        return <Globe size={16} className="text-success" />;
      case 'company':
        return <Building size={16} className="text-warning" />;
      case 'optional':
        return <Star size={16} className="text-info" />;
      default:
        return <Gift size={16} className="text-muted" />;
    }
  };


  // Sort holidays by date
  const sortedHolidays = [...holidays].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const upcomingHolidays = sortedHolidays.filter(h => new Date(h.date) >= new Date());
  const pastHolidays = sortedHolidays.filter(h => new Date(h.date) < new Date());

  return (
    <div className="container-fluid fade-in px-0">
      {/* Header */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-end">
            <div>
              <h1 className="display-5 fw-800 text-white mb-2">Company Holidays</h1>
              <p className="text-secondary fw-500 mb-0">View upcoming public and company holiday schedules</p>
            </div>
            {(isAdmin || hasPermission('manage_holidays')) && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-premium-add d-flex align-items-center px-4 py-3 shadow-lg"
              >
                <Plus className="me-2" size={20} />
                Add Holiday
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="row mb-5">
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="premium-stat-card h-100">
            <div className="premium-stat-icon" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--accent-cyan)' }}>
              <Gift size={24} />
            </div>
            <div className="premium-stat-number">{holidays.length}</div>
            <div className="premium-stat-label">Total Holidays</div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="premium-stat-card h-100">
            <div className="premium-stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>
              <Globe size={24} />
            </div>
            <div className="premium-stat-number">{holidays.filter(h => h.type === 'public').length}</div>
            <div className="premium-stat-label">Public Holidays</div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="premium-stat-card h-100">
            <div className="premium-stat-icon" style={{ background: 'rgba(251,191,36,0.1)', color: 'var(--accent-gold)' }}>
              <Building size={24} />
            </div>
            <div className="premium-stat-number">{holidays.filter(h => h.type === 'company').length}</div>
            <div className="premium-stat-label">Company Events</div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="premium-stat-card h-100">
            <div className="premium-stat-icon" style={{ background: 'rgba(6,182,212,0.1)', color: 'var(--accent-cyan)' }}>
              <Star size={24} />
            </div>
            <div className="premium-stat-number">{upcomingHolidays.length}</div>
            <div className="premium-stat-label">Upcoming Holidays</div>
          </div>
        </div>
      </div>

      {/* Upcoming Holidays Grid */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="premium-card border-0 shadow-lg overflow-hidden" style={{ background: 'var(--midnight-card)' }}>
            <div className="premium-card-header bg-transparent py-4 border-bottom border-secondary border-opacity-10 px-4">
              <h5 className="mb-0 fw-800 text-white d-flex align-items-center">
                <Calendar className="me-3 text-cyan" size={22} />
                Upcoming Holidays ({upcomingHolidays.length})
              </h5>
            </div>
            <div className="premium-card-body p-4 p-md-5">
              {upcomingHolidays.length > 0 ? (
                <div className="row g-4">
                  {upcomingHolidays.map((holiday) => (
                    <div key={holiday.id} className="col-xl-4 col-md-6">
                      <div className="group transition-all hover-translate-y p-4 rounded-4 border border-secondary border-opacity-10 position-relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.01)' }}>
                        <div className="d-flex justify-content-between align-items-start mb-4">
                          <div className="d-flex align-items-center">
                            <div className="rounded-3 p-2 me-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                              {getTypeIcon(holiday.type)}
                            </div>
                            <span className={`badge rounded-pill px-3 py-1 fw-700 text-uppercase`} style={{ 
                              fontSize: '0.6rem', 
                              background: 'rgba(255,255,255,0.05)',
                              color: holiday.type === 'public' ? 'var(--success)' : 
                                     holiday.type === 'company' ? 'var(--accent-gold)' : 'var(--accent-cyan)',
                              border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                              {holiday.type}
                            </span>
                          </div>
                          {(isAdmin || hasPermission('manage_holidays')) && (
                            <div className="dropdown opacity-0 group-hover-opacity-100 transition-all">
                              <button
                                className="btn btn-sm btn-premium-secondary px-2 py-1"
                                data-bs-toggle="dropdown"
                              >
                                <Edit size={14} />
                              </button>
                              <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end border-secondary border-opacity-10 shadow-lg">
                                <li>
                                  <button className="dropdown-item py-2 fw-600 small" onClick={() => handleEditHoliday(holiday)}>
                                    <Edit size={14} className="me-2" /> Edit Holiday
                                  </button>
                                </li>
                                <li><hr className="dropdown-divider opacity-10" /></li>
                                <li>
                                  <button className="dropdown-item py-2 fw-600 small text-danger" onClick={() => handleDeleteHoliday(holiday.id, holiday.name)}>
                                    <Trash2 size={14} className="me-2" /> Delete Holiday
                                  </button>
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        <h4 className="text-white fw-800 mb-2">{holiday.name}</h4>
                        <div className="text-secondary small fw-700 uppercase mb-3 tracking-wider" style={{ fontSize: '0.65rem' }}>
                          {new Date(holiday.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        
                        {holiday.description && (
                          <p className="text-dimmed small fw-500 mb-4 line-clamp-2">{holiday.description}</p>
                        )}
                        
                        <div className="d-flex align-items-center justify-content-between pt-3 border-top border-secondary border-opacity-05">
                          <div className="text-cyan fw-800 small uppercase" style={{ fontSize: '0.6rem' }}>
                            {Math.ceil((new Date(holiday.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} DAYS REMAINING
                          </div>
                          <div className="progress flex-grow-1 ms-3" style={{ height: '4px', background: 'rgba(255,255,255,0.03)' }}>
                            <div className="progress-bar bg-cyan" style={{ width: '30%' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <Gift size={64} className="text-dimmed opacity-10 mb-4" />
                  <h4 className="text-white fw-700 mb-2">No Holidays schedule</h4>
                  <p className="text-secondary small fw-500 mb-0">There are no upcoming holidays listed in the current calendar.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Past Holidays Table */}
      {pastHolidays.length > 0 && (
        <div className="row">
          <div className="col-12">
            <div className="premium-card border-0 shadow-lg overflow-hidden" style={{ background: 'var(--midnight-card)' }}>
              <div className="premium-card-header bg-transparent py-4 border-bottom border-secondary border-opacity-10 px-4">
                <h5 className="mb-0 fw-800 text-white d-flex align-items-center">
                  <Globe className="me-3 text-indigo" size={22} />
                  Past Holidays ({pastHolidays.length})
                </h5>
              </div>
              <div className="premium-card-body p-0">
                <div className="table-responsive">
                  <table className="premium-table mb-0">
                    <thead>
                      <tr>
                        <th>Holiday Name</th>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Description</th>
                        {(isAdmin || hasPermission('manage_holidays')) && <th className="text-end">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {pastHolidays.reverse().map((holiday) => (
                        <tr key={holiday.id}>
                          <td><div className="text-white fw-700">{holiday.name}</div></td>
                          <td>
                            <div className="text-secondary small fw-600">
                              {new Date(holiday.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className={`badge rounded-pill px-3 py-1 fw-700 text-uppercase`} style={{ 
                                fontSize: '0.55rem', 
                                background: 'rgba(255,255,255,0.03)',
                                color: holiday.type === 'public' ? 'var(--success)' : 
                                       holiday.type === 'company' ? 'var(--accent-gold)' : 'var(--accent-cyan)',
                                border: '1px solid rgba(255,255,255,0.05)'
                              }}>
                                {holiday.type}
                              </span>
                            </div>
                          </td>
                          <td><div className="text-dimmed small fw-500 line-clamp-1">{holiday.description || 'No context logged.'}</div></td>
                          {(isAdmin || hasPermission('manage_holidays')) && (
                            <td className="text-end">
                              <div className="d-flex justify-content-end gap-2">
                                <button
                                  onClick={() => handleEditHoliday(holiday)}
                                  className="btn btn-sm btn-premium-secondary p-2"
                                  title="Edit Holiday"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteHoliday(holiday.id, holiday.name)}
                                  className="btn btn-sm btn-premium-danger p-2"
                                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid #ef4444' }}
                                  title="Delete Holiday"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals for Add/Edit */}
      {(showAddModal || showEditModal) && (
        <div className="modal show d-block premium-modal" style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ background: 'var(--midnight-card)', borderRadius: 'var(--radius-xl)' }}>
              <div className="modal-header border-bottom border-secondary border-opacity-10 py-4 px-4 bg-white bg-opacity-02">
                <h5 className="modal-title fw-800 text-white d-flex align-items-center">
                  {showAddModal ? <Plus className="me-3 text-cyan" size={22} /> : <Edit className="me-3 text-cyan" size={22} />}
                  {showAddModal ? 'Add New Holiday' : `Edit Holiday: ${editingHoliday?.name}`}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}></button>
              </div>
              <div className="modal-body p-4 px-md-5 py-md-5">
                <form onSubmit={showAddModal ? handleAddHoliday : handleUpdateHoliday}>
                  <div className="mb-4">
                    <label className="text-secondary small fw-700 text-uppercase mb-2 d-block">Holiday Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="form-control bg-opacity-05 border-secondary border-opacity-10 py-3 text-white"
                        style={{ borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}
                        placeholder="e.g., New Year's Day"
                      />
                  </div>

                  <div className="row g-4 mb-4">
                    <div className="col-md-6">
                      <label className="text-secondary small fw-700 text-uppercase mb-2 d-block">Holiday Date *</label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        className="form-control bg-opacity-05 border-secondary border-opacity-10 py-3 text-white"
                        style={{ borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="text-secondary small fw-700 text-uppercase mb-2 d-block">Type *</label>
                      <select
                        required
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          type: e.target.value as 'public' | 'company' | 'optional' 
                        }))}
                        className="form-select bg-opacity-05 border-secondary border-opacity-10 py-3 text-white"
                        style={{ borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}
                      >
                        <option value="public" className="bg-dark">Public Holiday</option>
                        <option value="company" className="bg-dark">Company Holiday</option>
                        <option value="optional" className="bg-dark">Optional Holiday</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="text-secondary small fw-700 text-uppercase mb-2 d-block">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="form-control bg-opacity-05 border-secondary border-opacity-10 py-3 text-white"
                      style={{ borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}
                      rows={3}
                      placeholder="Brief description of the holiday..."
                    />
                  </div>

                  <div className="d-flex justify-content-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                      className="btn btn-premium-secondary px-4 py-2"
                      disabled={loading}
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-premium-add px-5 py-2 shadow-glow-cyan"
                    >
                      {loading ? (
                        <><div className="spinner-border spinner-border-sm me-2" /> Saving...</>
                      ) : (
                        showAddModal ? <><Plus className="me-2" size={18} /> Save Holiday</> : <><Edit className="me-2" size={18} /> Update Holiday</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Holiday;
