import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { api } from '../../lib/api';
import { UserPlus, User, Mail, Calendar, Shield } from 'lucide-react';

const AddEmployees: React.FC = () => {
  const { isAdmin, hasPermission } = useAuth();
  const { refreshEmployees } = useData();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '123456',
    role: 'employee' as 'admin' | 'manager' | 'employee',
    permissions: [] as string[],
    department: '',
    position: '',
    joining_date: new Date().toISOString().split('T')[0],
    manager_id: '',
  });

  if (!isAdmin && !hasPermission('manage_employees')) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.createEmployee({
        ...formData,
        manager_id: formData.manager_id ? parseInt(formData.manager_id) : undefined
      });
      if (response.success) {
        setFormData({
          name: '',
          email: '',
          password: '123456',
          role: 'employee',
          permissions: [],
          department: '',
          position: '',
          joining_date: new Date().toISOString().split('T')[0],
          manager_id: '',
        });

        await refreshEmployees();
        
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed';
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
          <strong>Success!</strong> Employee added successfully.
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 5000);
      }
    } catch (error: any) {
      console.error('Add employee failed:', error);
      alert(error.message || 'Failed to add employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    'CEO',
    'CMO',
    'Account Manager',
    'Developers',
    'Designers',
    'SEO',
    'SMM',
    'SuccessWikis',
    'Performance Marketer',
    'Sales'
  ];

  return (
    <div className="container-fluid fade-in px-0">
      <div className="row mb-5">
        <div className="col-12">
          <h1 className="display-5 fw-800 text-white mb-2">Add New Employee</h1>
          <p className="text-secondary fw-500 mb-0">Quickly add a new team member to the system and assign their credentials</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-xl-9 col-lg-11">
          <div className="premium-card border-0 shadow-lg" style={{ background: 'var(--midnight-card)' }}>
            <div className="premium-card-header bg-transparent py-4 border-bottom border-secondary border-opacity-10">
              <h5 className="mb-0 fw-800 text-white d-flex align-items-center">
                <UserPlus className="me-3 text-cyan" size={24} />
                Employee Information
              </h5>
            </div>
            <div className="premium-card-body p-4 p-md-5">
              <form onSubmit={handleSubmit} autoComplete="on">
                <div className="row g-5">
                  <div className="col-lg-6">
                    <h6 className="text-secondary small fw-700 text-uppercase mb-4 d-flex align-items-center">
                      <span className="p-1 rounded bg-cyan bg-opacity-10 me-2"></span> Personal Details
                    </h6>
                    
                    <div className="mb-4">
                      <label className="text-secondary small fw-700 text-uppercase mb-2 d-block" htmlFor="employeeName">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <div className="position-relative">
                        <User className="position-absolute top-50 start-0 translate-middle-y ms-3 text-dimmed opacity-50" size={18} />
                        <input
                          id="employeeName"
                          name="name"
                          type="text"
                          required
                          autoComplete="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="form-control bg-opacity-05 border-secondary border-opacity-10 py-3 ps-5 text-white"
                          placeholder="Enter legal full name"
                          style={{ borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="text-secondary small fw-700 text-uppercase mb-2 d-block" htmlFor="employeeEmail">
                        Email Address <span className="text-danger">*</span>
                      </label>
                      <div className="position-relative">
                        <Mail className="position-absolute top-50 start-0 translate-middle-y ms-3 text-dimmed opacity-50" size={18} />
                        <input
                          id="employeeEmail"
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="form-control bg-opacity-05 border-secondary border-opacity-10 py-3 ps-5 text-white"
                          placeholder="email@company.com"
                          style={{ borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="text-secondary small fw-700 text-uppercase mb-2 d-block" htmlFor="employeePassword">
                        Login Password <span className="text-danger">*</span>
                      </label>
                      <div className="position-relative">
                        <Shield className="position-absolute top-50 start-0 translate-middle-y ms-3 text-dimmed opacity-50" size={18} />
                        <input
                          id="employeePassword"
                          name="password"
                          type="text"
                          required
                          autoComplete="new-password"
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          className="form-control bg-opacity-05 border-secondary border-opacity-10 py-3 ps-5 text-white"
                          placeholder="Initial entry password"
                          style={{ borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}
                        />
                      </div>
                      <small className="text-dimmed fw-500 mt-2 d-block">Protocols require changing this after initial cycle.</small>
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <h6 className="text-secondary small fw-700 text-uppercase mb-4 d-flex align-items-center">
                      <span className="p-1 rounded bg-indigo bg-opacity-10 me-2"></span> Role & Assignment
                    </h6>

                    <div className="mb-4">
                      <label className="text-secondary small fw-700 text-uppercase mb-2 d-block" htmlFor="reportingManager">
                        Reporting Manager
                      </label>
                      <select
                        id="reportingManager"
                        name="manager_id"
                        value={formData.manager_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, manager_id: e.target.value }))}
                        className="form-select bg-opacity-05 border-secondary border-opacity-10 py-3 text-white"
                        style={{ borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}
                      >
                        <option value="" className="bg-dark">Select Manager (Optional)</option>
                        {useData().employees
                          .filter(e => e.role === 'admin' || e.role === 'manager')
                          .map(mgr => (
                            <option key={mgr.id} value={mgr.id} className="bg-dark">{mgr.name} ({mgr.role})</option>
                          ))
                        }
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="text-secondary small fw-700 text-uppercase mb-2 d-block" htmlFor="employeeRole">
                        Access Role <span className="text-danger">*</span>
                      </label>
                      <select
                        id="employeeRole"
                        name="role"
                        required
                        value={formData.role}
                        onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin'|'manager'|'employee' }))}
                        className="form-select bg-opacity-05 border-secondary border-opacity-10 py-3 text-white"
                        style={{ borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}
                      >
                        <option value="employee" className="bg-dark">Standard Employee</option>
                        <option value="manager" className="bg-dark">Manager</option>
                        <option value="admin" className="bg-dark">Admin</option>
                      </select>
                    </div>

                    {formData.role === 'manager' && (
                      <div className="mb-4 fade-in">
                        <label className="text-secondary small fw-700 text-uppercase mb-3 d-block">
                          Manager Permissions
                        </label>
                        <div className="p-3 rounded-3 border border-secondary border-opacity-10" style={{ background: 'rgba(255,255,255,0.01)' }}>
                          {[
                            { id: 'manage_leaves', label: 'Manage Leaves (Approvals)' },
                            { id: 'manage_attendance', label: 'Manage Attendance logs' },
                            { id: 'manage_employees', label: 'Manage & Edit Employees' },
                            { id: 'manage_holidays', label: 'Manage Holidays & Calendar' }
                          ].map(perm => (
                            <div key={perm.id} className="form-check mb-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={perm.id}
                                checked={formData.permissions.includes(perm.id)}
                                onChange={(e) => {
                                  const newPerms = e.target.checked 
                                    ? [...formData.permissions, perm.id]
                                    : formData.permissions.filter(p => p !== perm.id);
                                  setFormData(prev => ({ ...prev, permissions: newPerms }));
                                }}
                              />
                              <label className="form-check-label text-white small fw-600 cursor-pointer" htmlFor={perm.id}>
                                {perm.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="text-secondary small fw-700 text-uppercase mb-2 d-block" htmlFor="employeeDepartment">
                        Department
                      </label>
                      <select
                        id="employeeDepartment"
                        name="department"
                        value={formData.department}
                        onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                        className="form-select bg-opacity-05 border-secondary border-opacity-10 py-3 text-white"
                        style={{ borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}
                      >
                        <option value="" className="bg-dark">Select Department</option>
                        {departments.map(dept => (<option key={dept} value={dept} className="bg-dark">{dept}</option>))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="text-secondary small fw-700 text-uppercase mb-2 d-block" htmlFor="employeePosition">
                        Job Title
                      </label>
                      <input
                        id="employeePosition"
                        name="position"
                        type="text"
                        value={formData.position}
                        onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                        className="form-control bg-opacity-05 border-secondary border-opacity-10 py-3 text-white"
                        placeholder="e.g., Lead Architect, Operations Manager"
                        style={{ borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="text-secondary small fw-700 text-uppercase mb-2 d-block" htmlFor="employeeJoiningDate">
                        Joining Date <span className="text-danger">*</span>
                      </label>
                      <div className="position-relative">
                        <Calendar className="position-absolute top-50 start-0 translate-middle-y ms-3 text-dimmed opacity-50" size={18} />
                        <input
                          id="employeeJoiningDate"
                          name="joining_date"
                          type="date"
                          required
                          value={formData.joining_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, joining_date: e.target.value }))}
                          className="form-control bg-opacity-05 border-secondary border-opacity-10 py-3 ps-5 text-white"
                          max={new Date().toISOString().split('T')[0]}
                          style={{ borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 p-4 rounded-3 d-flex align-items-start border border-secondary border-opacity-10" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <Shield className="text-cyan me-3 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <h6 className="text-white fw-700 mb-1">Registration Note</h6>
                    <p className="text-secondary small fw-500 mb-0">
                      The new employee will be added to the directory. A welcome email will be sent with their login credentials and next steps.
                    </p>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-3 mt-5">
                  <button type="button" onClick={() => setFormData({
                    name: '',
                    email: '',
                    password: '123456',
                    role: 'employee',
                    permissions: [],
                    department: '',
                    position: '',
                    joining_date: new Date().toISOString().split('T')[0],
                    manager_id: '',
                  })} className="btn btn-premium-secondary px-4 py-2">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="btn btn-premium-add px-5 py-2 shadow-glow-cyan border-0">
                    {loading ? (
                      <><div className="spinner-border spinner-border-sm me-2" role="status" /> Saving...</>
                    ) : (
                      <><UserPlus className="me-2" size={18} /> Add Employee</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="premium-card mt-5 border-0 shadow-lg" style={{ background: 'var(--midnight-card)' }}>
            <div className="premium-card-body p-4">
              <h6 className="text-white fw-800 mb-4 d-flex align-items-center">
                <span className="p-1 rounded bg-indigo bg-opacity-10 me-2"></span> Quick Tips
              </h6>
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="d-flex align-items-start p-3 rounded-3 hover-bg-white-opacity-05 transition-all">
                    <div className="rounded-3 p-3 me-3" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-indigo)' }}>
                      <Mail size={20} />
                    </div>
                    <div>
                      <div className="text-white fw-700 small">Email Verification</div>
                      <p className="text-dimmed small fw-500 mb-0 mt-1">Make sure the email address is correct and active.</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-start p-3 rounded-3 hover-bg-white-opacity-05 transition-all">
                    <div className="rounded-3 p-3 me-3" style={{ background: 'rgba(251, 191, 36, 0.1)', color: 'var(--accent-gold)' }}>
                      <Shield size={20} />
                    </div>
                    <div>
                      <div className="text-white fw-700 small">Role Types</div>
                      <p className="text-dimmed small fw-500 mb-0 mt-1">Standard employees can log attendance, while Admins manage the team.</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-start p-3 rounded-3 hover-bg-white-opacity-05 transition-all">
                    <div className="rounded-3 p-3 me-3" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}>
                      <Calendar size={20} />
                    </div>
                    <div>
                      <div className="text-white fw-700 small">Hiring Date</div>
                      <p className="text-dimmed small fw-500 mb-0 mt-1">The joining date typically aligns with the first day of work.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEmployees;
