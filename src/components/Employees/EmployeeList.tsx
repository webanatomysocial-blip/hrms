import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { api } from '../../lib/api';
import { Users, Search, Edit, Trash2, UserPlus, Shield, Building, Mail, Save, Clock } from 'lucide-react';
import { Employee } from '../../types';

interface EmployeeListProps {
  onPageChange: (page: string) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ onPageChange }) => {
  const { isAdmin, hasPermission } = useAuth();
  const { employees, refreshEmployees } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);

  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: 'employee' as 'admin' | 'manager' | 'employee',
    permissions: [] as string[],
    department: '',
    position: '',
    joining_date: '',
    manager_id: '' as string | number,
    password: '',
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

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setEditFormData({
      name: employee.name || '',
      email: employee.email || '',
      role: employee.role || 'employee',
      permissions: employee.permissions || [],
      department: employee.department || '',
      position: employee.position || '',
      joining_date: employee.joining_date || '',
      manager_id: employee.manager_id || '',
      password: '',
    });
    setShowEditModal(true);
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    setLoading(true);
    try {
      const response = await api.updateEmployee(editingEmployee.id, {
        ...editFormData,
        manager_id: editFormData.manager_id ? Number(editFormData.manager_id) : undefined
      });
      if (response.success) {
        setShowEditModal(false);
        setEditingEmployee(null);
        await refreshEmployees();
        
        // Show success message
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed';
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
          <strong>Success!</strong> Employee updated successfully.
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 5000);
      }
    } catch (error) {
      console.error('Update employee failed:', error);
      alert('Failed to update employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete employee "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await api.deleteEmployee(id);
      if (response.success) {
        await refreshEmployees();
        
        // Show success message
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed';
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
          <strong>Success!</strong> Employee deleted successfully.
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 5000);
      }
    } catch (error) {
      console.error('Delete employee failed:', error);
      alert('Failed to delete employee. Please try again.');
    }
  };

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (employee.position && employee.position.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = !filterDepartment || employee.department === filterDepartment;
    const matchesRole = !filterRole || employee.role === filterRole;
    
    return matchesSearch && matchesDepartment && matchesRole;
  });

  // Get unique departments
  const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];


  const allDepartments = [
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
      {/* Header */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-end">
            <div>
              <h1 className="display-5 fw-800 text-white mb-2">Employee Directory</h1>
              <p className="text-secondary fw-500 mb-0">View and manage all employee records</p>
            </div>
            <button 
              onClick={() => onPageChange('add-employees')}
              className="btn btn-premium-add d-flex align-items-center px-4 py-3 shadow-lg"
            >
              <UserPlus className="me-2" size={20} />
              Add Employee
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="row mb-5">
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="premium-stat-card h-100">
            <div className="premium-stat-icon" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent-indigo)' }}>
              <Users size={24} />
            </div>
            <div className="premium-stat-number">{employees.length}</div>
            <div className="premium-stat-label">Total Employees</div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="premium-stat-card h-100">
            <div className="premium-stat-icon" style={{ background: 'rgba(251,191,36,0.1)', color: 'var(--accent-gold)' }}>
              <Shield size={24} />
            </div>
            <div className="premium-stat-number">{employees.filter(e => e.role === 'admin').length}</div>
            <div className="premium-stat-label">Admins</div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="premium-stat-card h-100">
            <div className="premium-stat-icon" style={{ background: 'rgba(6,182,212,0.1)', color: 'var(--accent-cyan)' }}>
              <Users size={24} />
            </div>
            <div className="premium-stat-number">{employees.filter(e => e.role === 'employee').length}</div>
            <div className="premium-stat-label">Employees</div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="premium-stat-card h-100">
            <div className="premium-stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>
              <Building size={24} />
            </div>
            <div className="premium-stat-number">{departments.length}</div>
            <div className="premium-stat-label">Departments</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="premium-card mb-5 border-0 shadow-lg" style={{ background: 'var(--midnight-card)' }}>
        <div className="premium-card-body py-4">
          <div className="row g-4 align-items-end">
            <div className="col-lg-5">
              <label className="text-secondary small fw-700 text-uppercase mb-2 d-block">
                <Search size={14} className="me-2 text-cyan" />
                Search
              </label>
              <div className="position-relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control bg-opacity-05 border-secondary border-opacity-10 py-2 ps-4"
                  placeholder="Search by name or email..."
                  style={{ borderRadius: 'var(--radius-md)' }}
                />
              </div>
            </div>
            <div className="col-lg-3">
              <label className="text-secondary small fw-700 text-uppercase mb-2 d-block">Department</label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="form-select bg-opacity-05 border-secondary border-opacity-10 py-2"
                style={{ borderRadius: 'var(--radius-md)' }}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="col-lg-2">
              <label className="text-secondary small fw-700 text-uppercase mb-2 d-block">Role</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="form-select bg-opacity-05 border-secondary border-opacity-10 py-2"
                style={{ borderRadius: 'var(--radius-md)' }}
              >
                <option value="admin">Admins</option>
                <option value="employee">Employees</option>
              </select>
            </div>
            <div className="col-lg-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterDepartment('');
                  setFilterRole('');
                }}
                className="btn btn-premium-secondary w-100 py-2"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Employee List Table */}
      <div className="premium-card border-0 shadow-lg overflow-hidden">
        <div className="premium-card-header bg-transparent py-4 border-bottom border-secondary border-opacity-10">
          <h5 className="mb-0 fw-800 text-white d-flex align-items-center">
            <Users className="me-3 text-cyan" size={22} />
            Employee List <span className="ms-2 badge bg-cyan bg-opacity-10 text-cyan rounded-pill small fst-normal" style={{ fontSize: '0.7rem' }}>{filteredEmployees.length} EMPLOYEES</span>
          </h5>
        </div>
        <div className="premium-card-body p-0">
          {filteredEmployees.length > 0 ? (
            <div className="table-responsive">
              <table className="premium-table mb-0">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Position</th>
                    <th>Manager</th>
                    <th>Role</th>
                    <th>Joining Date</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <React.Fragment key={employee.id}>
                      <tr className={editingEmployee?.id === employee.id ? 'bg-cyan bg-opacity-05 shadow-inner' : ''}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div 
                              className="rounded-circle d-flex align-items-center justify-content-center me-3 fw-800 shadow-sm"
                              style={{ 
                                width: '44px', 
                                height: '44px', 
                                background: 'var(--midnight-elevated)',
                                border: '1px solid var(--midnight-border-bright)',
                                color: 'var(--accent-cyan)',
                                fontSize: '1rem'
                              }}
                            >
                              {employee.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-white fw-700 mb-0">{employee.name}</div>
                              <div className="text-dimmed small fw-500 d-flex align-items-center">
                                <Mail size={12} className="me-1 opacity-50" />
                                {employee.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center text-secondary small fw-600">
                            <Building size={14} className="me-2 text-indigo opacity-50" />
                            {employee.department || 'Unassigned'}
                          </div>
                        </td>
                        <td>
                          <div className="text-white small fw-700">{employee.position || 'Standard'}</div>
                        </td>
                        <td>
                          <div className="text-dimmed small fw-600">
                            {employee.manager_name || <span className="opacity-25">---</span>}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className={`badge rounded-pill px-3 py-1 fw-700 text-uppercase`} style={{ 
                              fontSize: '0.65rem', 
                              background: employee.role === 'admin' ? 'rgba(251,191,36,0.1)' : employee.role === 'manager' ? 'rgba(99,102,241,0.1)' : 'rgba(6,182,212,0.1)',
                              color: employee.role === 'admin' ? 'var(--accent-gold)' : employee.role === 'manager' ? 'var(--accent-indigo)' : 'var(--accent-cyan)',
                              border: `1px solid ${employee.role === 'admin' ? 'rgba(251,191,36,0.1)' : employee.role === 'manager' ? 'rgba(99,102,241,0.1)' : 'rgba(6,182,212,0.1)'}`
                            }}>
                              {employee.role}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center text-dimmed small fw-600">
                            <Clock size={14} className="me-2 opacity-50" />
                            {employee.joining_date ? new Date(employee.joining_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '---'}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-2 justify-content-end">
                            <button
                              onClick={() => handleEditEmployee(employee)}
                              className={`btn btn-sm p-2 rounded-circle transition-all ${editingEmployee?.id === employee.id ? 'btn-premium-primary' : 'btn-premium-secondary'}`}
                              title="Edit Employee"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(employee.id, employee.name)}
                              className="btn btn-sm btn-outline-danger p-2 rounded-circle border-0 hover-bg-danger bg-opacity-05"
                              title="Delete Employee"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {showEditModal && editingEmployee?.id === employee.id && (
                        <tr className="bg-cyan bg-opacity-02">
                          <td colSpan={6} className="p-0 border-0">
                            <div className="p-4 mx-4 mb-4 rounded-3 border border-cyan border-opacity-10 shadow-lg fade-in" style={{ background: 'rgba(255,255,255,0.01)' }}>
                              <form onSubmit={handleUpdateEmployee}>
                                <div className="row g-4">
                                  <div className="col-md-4">
                                    <label className="text-secondary small fw-700 text-uppercase mb-2 d-block">Full Name</label>
                                    <input id="inlineEditName" type="text" required value={editFormData.name} onChange={(e) => setEditFormData(prev => ({...prev, name: e.target.value}))} className="form-control bg-dark border-secondary border-opacity-20" />
                                  </div>
                                  <div className="col-md-4">
                                    <label className="text-secondary small fw-700 text-uppercase mb-2 d-block">Email Address</label>
                                    <input id="inlineEditEmail" type="email" required value={editFormData.email} onChange={(e) => setEditFormData(prev => ({...prev, email: e.target.value}))} className="form-control bg-dark border-secondary border-opacity-20" />
                                  </div>
                                  <div className="col-md-4">
                                    <label className="text-secondary small fw-700 text-uppercase mb-2 d-block">Role</label>
                                    <select id="inlineEditRole" required value={editFormData.role} onChange={(e) => setEditFormData(prev => ({...prev, role: e.target.value as any}))} className="form-select bg-dark border-secondary border-opacity-20">
                                      <option value="employee">Employee</option>
                                      <option value="manager">Manager</option>
                                      <option value="admin">Admin</option>
                                    </select>
                                  </div>

                                  {editFormData.role === 'manager' && (
                                    <div className="col-12 mt-3 mb-2">
                                      <label className="text-secondary small fw-700 text-uppercase mb-2 d-block">Manager Permissions</label>
                                      <div className="p-3 rounded-2 border border-secondary border-opacity-10 d-flex flex-wrap gap-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        {[
                                          { id: 'manage_leaves', label: 'Leaves' },
                                          { id: 'manage_attendance', label: 'Attendance' },
                                          { id: 'manage_employees', label: 'Employees' },
                                          { id: 'manage_holidays', label: 'Holidays' }
                                        ].map(perm => (
                                          <div key={perm.id} className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              id={`edit-${perm.id}`}
                                              checked={editFormData.permissions.includes(perm.id)}
                                              onChange={(e) => {
                                                const newPerms = e.target.checked 
                                                  ? [...editFormData.permissions, perm.id]
                                                  : editFormData.permissions.filter(p => p !== perm.id);
                                                setEditFormData(prev => ({ ...prev, permissions: newPerms }));
                                              }}
                                            />
                                            <label className="form-check-label text-white small fw-600" htmlFor={`edit-${perm.id}`}>
                                              {perm.label}
                                            </label>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  <div className="col-md-4">
                                    <label className="text-secondary small fw-700 text-uppercase mb-2 d-block">Reporting Manager</label>
                                    <select 
                                      id="inlineEditManager" 
                                      value={editFormData.manager_id} 
                                      onChange={(e) => setEditFormData(prev => ({...prev, manager_id: e.target.value}))} 
                                      className="form-select bg-dark border-secondary border-opacity-20"
                                    >
                                      <option value="">No Manager</option>
                                      {employees
                                        .filter(e => (e.role === 'admin' || e.role === 'manager') && e.id !== editingEmployee.id)
                                        .map(mgr => (
                                          <option key={mgr.id} value={mgr.id}>{mgr.name} ({mgr.role})</option>
                                        ))
                                      }
                                    </select>
                                  </div>

                                  <div className="col-md-4">
                                    <label className="text-secondary small fw-700 text-uppercase mb-2 d-block">Department</label>
                                    <select id="inlineEditDepartment" value={editFormData.department} onChange={(e) => setEditFormData(prev => ({...prev, department: e.target.value}))} className="form-select bg-dark border-secondary border-opacity-20">
                                      <option value="">Select Department</option>
                                      {allDepartments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                    </select>
                                  </div>
                                  <div className="col-md-4">
                                    <label className="text-secondary small fw-700 text-uppercase mb-2 d-block">Position</label>
                                    <input id="inlineEditPosition" type="text" value={editFormData.position} onChange={(e) => setEditFormData(prev => ({...prev, position: e.target.value}))} className="form-control bg-dark border-secondary border-opacity-20" />
                                  </div>
                                  <div className="col-md-4">
                                    <label className="text-secondary small fw-700 text-uppercase mb-2 d-block">Joining Date</label>
                                    <input id="inlineEditJoiningDate" type="date" value={editFormData.joining_date} onChange={(e) => setEditFormData(prev => ({...prev, joining_date: e.target.value}))} className="form-control bg-dark border-secondary border-opacity-20" />
                                  </div>
                                  <div className="col-md-4">
                                    <label className="text-secondary small fw-700 text-uppercase mb-2 d-block">Change Password</label>
                                    <input id="inlineEditPassword" type="text" placeholder="Leave blank to keep same" value={editFormData.password} onChange={(e) => setEditFormData(prev => ({...prev, password: e.target.value}))} className="form-control bg-dark border-secondary border-opacity-20" />
                                  </div>
                                  <div className="col-12 d-flex justify-content-end gap-2 mt-2">
                                    <button type="button" onClick={() => { setShowEditModal(false); setEditingEmployee(null); }} className="btn btn-sm btn-premium-secondary px-3" disabled={loading}>Cancel</button>
                                    <button type="submit" disabled={loading} className="btn btn-sm btn-premium-primary px-4 shadow-glow-cyan">
                                      {loading ? <div className="spinner-border spinner-border-sm me-2" /> : <Save className="me-2" size={14} />} 
                                      Update Employee
                                    </button>
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
          ) : (
            <div className="text-center py-5">
              <Users size={64} className="text-dimmed opacity-10 mb-4" />
              <h4 className="text-white fw-700 mb-2">No Employees Found</h4>
              <p className="text-secondary small fw-500 mb-4">No employees match your search criteria.</p>
              <button className="btn btn-premium-primary px-4 py-2" onClick={() => {setSearchTerm(''); setFilterDepartment(''); setFilterRole('');}}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Department Breakdown */}
      {departments.length > 0 && (
        <div className="mt-5 pt-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0 fw-800 text-white d-flex align-items-center">
              <Building className="me-3 text-indigo" size={22} />
              Operational Units
            </h5>
          </div>
          <div className="row g-4">
            {departments.map(department => {
              const deptEmployees = employees.filter(emp => emp.department === department);
              return (
                <div key={department} className="col-xl-3 col-lg-4 col-sm-6">
                  <div className="premium-card h-100 border-0 transition-transform hover-scale-up" style={{ background: 'var(--midnight-card)' }}>
                    <div className="premium-card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-4">
                        <div 
                          className="rounded-3 d-flex align-items-center justify-content-center shadow-glow-indigo"
                          style={{ 
                            width: '48px', 
                            height: '48px', 
                            background: 'rgba(99, 102, 241, 0.1)',
                            color: 'var(--accent-indigo)',
                            borderRadius: '12px'
                          }}
                        >
                          <Building size={24} />
                        </div>
                        <div className="text-end">
                          <div className="h4 fw-800 text-white mb-0">{deptEmployees.length}</div>
                          <div className="text-dimmed small fw-700 uppercase" style={{ fontSize: '0.6rem' }}>Staff</div>
                        </div>
                      </div>
                      <h6 className="text-white fw-700 mb-3">{department}</h6>
                      <div className="d-flex gap-2">
                        <div className="p-2 flex-grow-1 rounded-2 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div className="text-cyan fw-700 small">{deptEmployees.filter(emp => emp.role === 'admin').length}</div>
                          <div className="text-dimmed fw-600" style={{ fontSize: '0.55rem' }}>Admins</div>
                        </div>
                        <div className="p-2 flex-grow-1 rounded-2 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div className="text-indigo fw-700 small">{deptEmployees.filter(emp => emp.role === 'employee').length}</div>
                          <div className="text-dimmed fw-600" style={{ fontSize: '0.55rem' }}>Members</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
