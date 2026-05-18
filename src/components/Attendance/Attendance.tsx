import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { api } from "../../lib/api";
import {
  Clock,
  CheckCircle,
  RefreshCw,
  Users,
  TrendingUp,
  Activity,
  History,
  Edit3
} from "lucide-react";
import { Employee, DailyAttendanceSummary } from "../../types";

const Attendance: React.FC = () => {
  const { user, isAdmin, isManager } = useAuth();
  const {
    employees,
    attendance: globalAttendance,
    userEntries,
    isClockedIn,
    loading: globalLoading,
    refreshAttendance,
    refreshUserEntries,
  } = useData();

  const [pageLoading, setPageLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
  const [workingHours, setWorkingHours] = useState<number>(0);
  const [presenceFilter, setPresenceFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState<number | null>(null);

  const today = new Date().toLocaleDateString('en-CA', {timeZone: 'Asia/Kolkata'});
  
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [editData, setEditData] = useState({status: '', first_clock_in: '', last_clock_out: '', total_working_hours: 0});

  const safeToFixed = (value: any, decimals: number = 1): string => {
    const num = Number(value) || 0;
    return num.toFixed(decimals);
  };

  const safeNumber = (value: any): number => Number(value) || 0;

  const todayRecord =
    globalAttendance.find(
      (record: DailyAttendanceSummary) => Number(record.employee_id) === Number(user?.id) && record.date === today,
    ) || null;

  const todayEntries = userEntries.filter(e => e.date === today);

  useEffect(() => {
    if (user?.id) {
      initializeAttendance();
    } else {
      setPageLoading(false);
    }
  }, [user, startDate, endDate]);

  useEffect(() => {
    if (todayRecord) {
      setWorkingHours(safeNumber(todayRecord.total_working_hours));
    } else {
      setWorkingHours(0);
    }
  }, [todayRecord]);

  const initializeAttendance = async () => {
    setPageLoading(true);
    try {
      await Promise.all([refreshAttendance(startDate, endDate), refreshUserEntries()]);
    } catch (error) {
      console.error("Failed to load attendance data", error);
    } finally {
      setPageLoading(false);
    }
  };


  const handleClockIn = async () => {
    if (!user?.id || clockLoading) return;

    setClockLoading(true);

    try {
      const response = await api.clockIn(user.id);

      if (response.success) {
        // Refresh data
        await Promise.all([refreshAttendance(), refreshUserEntries()]);
      } else {
        alert(response.message || "Clock in failed");
      }
    } catch (error: any) {
      alert(error.message || "Clock in failed. Please try again.");
    } finally {
      setClockLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!user?.id || clockLoading) return;

    setClockLoading(true);

    try {
      const response = await api.clockOut(user.id);

      if (response.success) {
        setWorkingHours(safeNumber(response.data?.working_hours));
        // Refresh data
        await Promise.all([refreshAttendance(), refreshUserEntries()]);
      } else {
        alert(response.message || "Clock out failed");
      }
    } catch (error: any) {
      alert(error.message || "Clock out failed. Please try again.");
    } finally {
      setClockLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setPageLoading(true);
    try {
      await Promise.all([refreshAttendance(startDate, endDate), refreshUserEntries()]);
    } catch (error) {
      console.error("Refresh failed.", error);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (editData.first_clock_in && editData.last_clock_out) {
      const [h1, m1] = editData.first_clock_in.split(':').map(Number);
      const [h2, m2] = editData.last_clock_out.split(':').map(Number);
      
      let diffMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
      if (diffMinutes < 0) diffMinutes = 0;
      
      const hours = diffMinutes / 60;
      let status = 'present';
      
      // Dynamic Status Rules
      if (hours < 4) {
        status = 'half_day';
      } else if (h1 > 9 || (h1 === 9 && m1 > 15)) {
        status = 'late';
      } else {
        status = 'present';
      }

      setEditData(prev => ({ 
        ...prev, 
        total_working_hours: parseFloat(hours.toFixed(2)),
        status: status
      }));
    } else if (!editData.first_clock_in && !editData.last_clock_out) {
      setEditData(prev => ({ ...prev, status: 'absent', total_working_hours: 0 }));
    }
  }, [editData.first_clock_in, editData.last_clock_out]);

  const handleUpdateAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    try {
      const payload: any = { ...editData };
      if (editingRecord.id > 0) {
        payload.id = editingRecord.id;
      } else {
        payload.employee_id = editingRecord.employee_id;
        payload.date = editingRecord.date;
      }

      const response = await api.updateAttendance(payload);

      if (response.success) {
        setEditingRecord(null);
        await refreshAttendance(startDate, endDate);
      } else {
        alert(response.message || 'Failed to update attendance');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to update attendance');
    }
  };

  const openEditRow = (record: any) => {
    if (editingRecord?.employee_id === record.employee_id && editingRecord?.date === record.date) {
      setEditingRecord(null);
      return;
    }
    setEditingRecord(record);
    setEditData({
      status: record.status || 'present',
      first_clock_in: record.first_clock_in || '',
      last_clock_out: record.last_clock_out || '',
      total_working_hours: Number(record.total_working_hours) || 0
    });
  };

  const getDatesInRange = (start: string, end: string) => {
    const dates = [];
    let curr = new Date(start);
    const last = new Date(end);
    let iterations = 0;
    while (curr <= last && iterations < 93) {
      dates.push(curr.toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
      iterations++;
    }
    return dates.reverse();
  };

  const filteredEmployees = (() => {
    const dates = getDatesInRange(startDate, endDate);
    let result: any[] = [];

    dates.forEach(dateStr => {
      if (isAdmin || isManager) {
        employees.filter(e => e.role !== 'admin').forEach((emp: Employee) => {
          if (employeeFilter && emp.id !== employeeFilter) return;

          const record = globalAttendance.find((r: DailyAttendanceSummary) => Number(r.employee_id) === Number(emp.id) && r.date === dateStr);
          const matchesStatus = !presenceFilter || 
            (presenceFilter === 'present' 
              ? (record && (record.status === 'present' || record.status === 'late' || record.status === 'half_day'))
              : (record ? record.status === presenceFilter : (presenceFilter === 'absent')));

          if (matchesStatus) {
            if (record) {
              result.push(record);
            } else {
              result.push({
                id: 0,
                employee_id: emp.id,
                employee_name: emp.name,
                date: dateStr,
                status: 'absent',
                total_working_hours: 0,
                total_break_time: 0,
                first_clock_in: undefined,
                last_clock_out: undefined
              });
            }
          }
        });
      } else {
        const empId = user?.id;
        const record = globalAttendance.find((r: DailyAttendanceSummary) => r.employee_id === empId && r.date === dateStr);
        if (record) {
          result.push(record);
        } else {
          result.push({
            id: 0,
            employee_id: empId,
            employee_name: user?.name || "Me",
            date: dateStr,
            status: 'absent',
            total_working_hours: 0,
            total_break_time: 0,
            first_clock_in: undefined,
            last_clock_out: undefined
          });
        }
      }
    });

    return result.sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      if (!a.first_clock_in) return 1;
      if (!b.first_clock_in) return -1;
      return a.first_clock_in.localeCompare(b.first_clock_in);
    });
  })();

  if (pageLoading || globalLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="premium-spinner"></div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present': return <span className="badge-premium badge-premium-success">Present</span>;
      case 'late': return <span className="badge-premium badge-premium-warning">Late</span>;
      case 'half_day': return <span className="badge-premium badge-premium-indigo">Half Day</span>;
      default: return <span className="badge-premium badge-premium-danger">Absent</span>;
    }
  };

  return (
    <div className="container-fluid fade-in px-0">
      {/* Header */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-end">
            <div>
              <h1 className="display-5 fw-800 text-white mb-2">Attendance Console</h1>
              <p className="text-secondary fw-500 mb-0">Monitor workforce presence and daily operational hours</p>
            </div>
            <button onClick={handleManualRefresh} className="btn btn-premium-secondary d-flex align-items-center px-4 py-2">
              <RefreshCw size={16} className={`me-2 ${globalLoading ? 'spin' : ''}`} />
              Sync Data
            </button>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Stats Section for Employee / Manager */}
        {!isAdmin && (
          <div className="col-12 mb-2">
            <div className="row g-4">
              <div className="col-xl-4">
                <div className="premium-card overflow-hidden h-100" style={{ background: 'var(--midnight-card)' }}>
                  <div className="premium-card-body p-0">
                    <div className="d-flex flex-column align-items-center justify-content-center p-5 text-center" style={{ background: 'var(--midnight-elevated)' }}>
                      <div className={`pulse-container mb-4 ${isClockedIn ? 'active' : ''}`} style={{ width: 100, height: 100, borderRadius: '50%', background: isClockedIn ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.02)', border: `2px solid ${isClockedIn ? 'var(--success)' : 'var(--midnight-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Clock size={42} className={isClockedIn ? 'text-success' : 'text-dimmed'} />
                      </div>
                      <h4 className="text-white fw-800 mb-1">{isClockedIn ? 'STATION ACTIVE' : 'STATION INACTIVE'}</h4>
                      <p className="text-dimmed x-small fw-800 uppercase letter-spacing-1">Current Session Status</p>
                      
                      <div className="mt-4 w-100 d-grid">
                         {!isClockedIn ? (
                            <button onClick={handleClockIn} disabled={clockLoading} className="btn btn-premium-primary py-3 shadow-glow-cyan">
                               {clockLoading ? <div className="spinner-border spinner-border-sm" /> : <><CheckCircle size={18} className="me-2" /> Start Shift</>}
                            </button>
                         ) : (
                            <button onClick={handleClockOut} disabled={clockLoading} className="btn btn-premium-danger py-3 shadow-glow-danger">
                               {clockLoading ? <div className="spinner-border spinner-border-sm" /> : <><Clock size={18} className="me-2" /> End Shift</>}
                            </button>
                         )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-8">
                <div className="row g-4 h-100">
                  <div className="col-md-6">
                    <div className="premium-stat-card h-100">
                       <div className="premium-stat-icon"><TrendingUp size={24} /></div>
                       <div className="premium-stat-number">{safeToFixed(workingHours)}h</div>
                       <div className="premium-stat-label">Total Hours Today</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="premium-stat-card h-100" style={{ borderColor: 'var(--accent-cyan)' }}>
                       <div className="premium-stat-icon" style={{ color: 'var(--accent-cyan)', background: 'var(--accent-cyan-glow)' }}><Activity size={24} /></div>
                       <div className="premium-stat-number">{Math.round((safeNumber(workingHours)/8)*100)}%</div>
                       <div className="premium-stat-label">Shift Completion</div>
                    </div>
                  </div>
                  <div className="col-12">
                     <div className="premium-card p-4 h-100">
                        <h6 className="text-white fw-800 mb-3 d-flex align-items-center gap-2">
                           <History size={16} className="text-indigo" />
                           Recent Activity Log
                        </h6>
                        <div className="d-flex flex-wrap gap-3">
                           {todayEntries.length > 0 ? todayEntries.map((e, i) => (
                             <div key={i} className="d-flex align-items-center gap-2 p-2 px-3 rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--midnight-border)' }}>
                                <div className={`status-dot ${e.entry_type === 'in' ? 'bg-success' : 'bg-danger'}`} style={{ width: 8, height: 8, borderRadius: '50%' }}></div>
                                <span className="text-white small fw-700">{e.entry_type === 'in' ? 'IN' : 'OUT'}</span>
                                <span className="text-dimmed small font-monospace">{e.time}</span>
                             </div>
                           )) : (
                             <div className="text-dimmed small italic">No activity logged for today yet.</div>
                           )}
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="col-12">
          <div className="premium-card p-4" style={{ background: 'var(--midnight-surface)' }}>
            <div className="row g-4 align-items-end">
               <div className="col-lg-3 col-md-6">
                  <label className="text-dimmed x-small fw-800 uppercase letter-spacing-1 mb-2 d-block">Start Date</label>
                  <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} />
               </div>
               <div className="col-lg-3 col-md-6">
                  <label className="text-dimmed x-small fw-800 uppercase letter-spacing-1 mb-2 d-block">End Date</label>
                  <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} />
               </div>
               {(isAdmin || isManager) && (
                 <>
                   <div className="col-lg-3 col-md-6">
                      <label className="text-dimmed x-small fw-800 uppercase letter-spacing-1 mb-2 d-block">Employee</label>
                      <select className="form-select" value={employeeFilter || ''} onChange={e => setEmployeeFilter(e.target.value ? parseInt(e.target.value) : null)}>
                         <option value="">All Employees</option>
                         {employees.filter(e => e.role !== 'admin').map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                      </select>
                   </div>
                   <div className="col-lg-3 col-md-6">
                      <label className="text-dimmed x-small fw-800 uppercase letter-spacing-1 mb-2 d-block">Filter Status</label>
                      <select className="form-select" value={presenceFilter} onChange={e => setPresenceFilter(e.target.value)}>
                         <option value="">All Attendance</option>
                         <option value="present">Present Only</option>
                         <option value="absent">Absent Only</option>
                         <option value="late">Late Arrival</option>
                      </select>
                   </div>
                 </>
               )}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="col-12">
           <div className="premium-card overflow-hidden">
              <div className="premium-card-header bg-transparent py-4 border-bottom border-secondary border-opacity-10 d-flex justify-content-between align-items-center">
                 <h5 className="text-white fw-800 mb-0 d-flex align-items-center gap-2">
                    <Users size={20} className="text-cyan" />
                    Attendance Register
                 </h5>
                 <span className="badge-premium badge-premium-indigo">{filteredEmployees.length} RECORDS FOUND</span>
              </div>
              <div className="table-responsive">
                 <table className="table table-dark table-hover align-middle mb-0">
                    <thead>
                       <tr className="border-bottom border-secondary border-opacity-10">
                          <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1">Staff Member</th>
                          <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1">Period</th>
                          <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1 text-center">Status</th>
                          <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1">Clock Details</th>
                          <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1 text-end">Work Duration</th>
                          {(isAdmin || isManager) && <th className="px-4 py-4 text-dimmed small fw-700 uppercase letter-spacing-1 text-end">Action</th>}
                       </tr>
                    </thead>
                    <tbody>
                       {filteredEmployees.length > 0 ? filteredEmployees.map(record => (
                         <React.Fragment key={`${record.employee_id}-${record.date}`}>
                           <tr className={`border-bottom border-secondary border-opacity-05 ${editingRecord?.employee_id === record.employee_id && editingRecord?.date === record.date ? 'bg-cyan bg-opacity-05' : ''}`}>
                              <td className="px-4 py-4">
                                 <div className="d-flex align-items-center gap-3">
                                    <div className="user-avatar-sm" style={{ width: 40, height: 40, background: 'var(--midnight-elevated)' }}>{record.employee_name?.charAt(0)}</div>
                                    <div>
                                       <div className="text-white fw-700 small">{record.employee_name}</div>
                                       <div className="text-dimmed x-small">ID: #{record.employee_id}</div>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-4 py-4">
                                 <div className="text-white small fw-600">{new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                              </td>
                              <td className="px-4 py-4 text-center">
                                 {getStatusBadge(record.status)}
                              </td>
                              <td className="px-4 py-4">
                                 <div className="d-flex gap-3">
                                    <div>
                                       <div className="text-dimmed x-small fw-800 uppercase">In</div>
                                       <div className="text-white small fw-700">{record.first_clock_in || '--:--'}</div>
                                    </div>
                                    <div>
                                       <div className="text-dimmed x-small fw-800 uppercase">Out</div>
                                       <div className="text-white small fw-700">{record.last_clock_out || '--:--'}</div>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-4 py-4 text-end">
                                 <div className="text-cyan fw-800 h6 mb-0 font-monospace">{safeToFixed(record.total_working_hours)}h</div>
                                 <div className="progress ms-auto mt-1" style={{ width: '60px', height: '3px', background: 'rgba(255,255,255,0.05)' }}>
                                    <div className="progress-bar bg-cyan" style={{ width: `${Math.min((safeNumber(record.total_working_hours)/8)*100, 100)}%` }} />
                                  </div>
                              </td>
                              {(isAdmin || isManager) && (
                                <td className="px-4 py-4 text-end">
                                   <button onClick={() => openEditRow(record)} className={`btn btn-sm px-3 d-flex align-items-center gap-2 ms-auto ${editingRecord?.employee_id === record.employee_id && editingRecord?.date === record.date ? 'btn-premium-cyan shadow-glow-cyan' : 'btn-premium-secondary'}`}>
                                     <Edit3 size={14} />
                                     {record.id > 0 ? 'Edit' : 'Manual Override'}
                                   </button>
                                </td>
                              )}
                           </tr>
                           {editingRecord?.employee_id === record.employee_id && editingRecord?.date === record.date && (
                             <tr className="bg-cyan bg-opacity-02">
                               <td colSpan={6} className="p-0 border-0">
                                 <div className="p-4 mx-4 mb-4 rounded-3 border border-cyan border-opacity-10 shadow-lg fade-in" style={{ background: 'rgba(255,255,255,0.01)' }}>
                                   <form onSubmit={handleUpdateAttendance}>
                                     <div className="row g-4 align-items-end">
                                       <div className="col-md-3">
                                         <label className="text-dimmed x-small fw-800 uppercase mb-2 d-block">Verification Status</label>
                                         <select className="form-select bg-dark border-secondary border-opacity-20" value={editData.status} onChange={e => setEditData({...editData, status: e.target.value})}>
                                           <option value="present">Present</option>
                                           <option value="absent">Absent</option>
                                           <option value="late">Late Arrival</option>
                                           <option value="half_day">Half Day</option>
                                         </select>
                                       </div>
                                       <div className="col-md-2">
                                         <label className="text-dimmed x-small fw-800 uppercase mb-2 d-block">First Clock In</label>
                                         <input type="time" className="form-control bg-dark border-secondary border-opacity-20" value={editData.first_clock_in || ''} onChange={e => setEditData({...editData, first_clock_in: e.target.value})} />
                                       </div>
                                       <div className="col-md-2">
                                         <label className="text-dimmed x-small fw-800 uppercase mb-2 d-block">Last Clock Out</label>
                                         <input type="time" className="form-control bg-dark border-secondary border-opacity-20" value={editData.last_clock_out || ''} onChange={e => setEditData({...editData, last_clock_out: e.target.value})} />
                                       </div>
                                       <div className="col-md-2">
                                         <label className="text-dimmed x-small fw-800 uppercase mb-2 d-block">Effective Hours</label>
                                         <input type="number" step="0.1" className="form-control bg-dark border-secondary border-opacity-20" value={editData.total_working_hours} onChange={e => setEditData({...editData, total_working_hours: parseFloat(e.target.value) || 0})} />
                                       </div>
                                       <div className="col-md-3 d-flex gap-2">
                                         <button type="button" onClick={() => setEditingRecord(null)} className="btn btn-premium-secondary flex-grow-1">Cancel</button>
                                         <button type="submit" className="btn btn-premium-cyan flex-grow-1 shadow-glow-cyan">Save</button>
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
                            <td colSpan={6} className="text-center py-5 text-dimmed small">No attendance records match your criteria.</td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
