import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { api } from "../../lib/api";
import {
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Users,
  Filter,
} from "lucide-react";
import { Employee, DailyAttendanceSummary } from "../../types";

const Attendance: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const {
    employees,
    attendance: globalAttendance,
    userEntries,
    isClockedIn,
    loading: globalLoading,
    error: globalError,
    refreshAttendance,
    refreshUserEntries,
  } = useData();

  const [pageLoading, setPageLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
  const [localError, setLocalError] = useState<string>("");
  const [workingHours, setWorkingHours] = useState<number>(0);
  const [presenceFilter, setPresenceFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState<number | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(today);

  const safeToFixed = (value: any, decimals: number = 1): string => {
    const num = Number(value) || 0;
    return num.toFixed(decimals);
  };

  const safeNumber = (value: any): number => Number(value) || 0;

  const todayRecord =
    globalAttendance.find(
      (record: DailyAttendanceSummary) => record.employee_id === user?.id && record.date === today,
    ) || null;

  const todayEntries = userEntries.filter(e => e.date === today);

  useEffect(() => {
    if (user?.id) {
      initializeAttendance();
    } else {
      setPageLoading(false);
      setLocalError("User not authenticated");
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
      setLocalError("Failed to load attendance data");
    } finally {
      setPageLoading(false);
    }
  };


  const handleClockIn = async () => {
    if (!user?.id || clockLoading) return;

    setClockLoading(true);
    setLocalError("");

    try {
      const response = await api.clockIn(user.id);

      if (response.success) {
        // Show success alert
        const alertDiv = document.createElement("div");
        alertDiv.className =
          "alert alert-success alert-dismissible fade show position-fixed";
        alertDiv.style.cssText =
          "top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
        alertDiv.innerHTML = `
          <strong>Success!</strong> Clocked in at ${response.data?.time || "now"}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 5000);

        // Refresh data
        await Promise.all([refreshAttendance(), refreshUserEntries()]);
      } else {
        setLocalError(response.message || "Clock in failed");
      }
    } catch (error: any) {
      setLocalError(error.message || "Clock in failed. Please try again.");
    } finally {
      setClockLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!user?.id || clockLoading) return;

    setClockLoading(true);
    setLocalError("");

    try {
      const response = await api.clockOut(user.id);

      if (response.success) {
        setWorkingHours(safeNumber(response.data?.working_hours));

        // Show success alert
        const alertDiv = document.createElement("div");
        alertDiv.className =
          "alert alert-success alert-dismissible fade show position-fixed";
        alertDiv.style.cssText =
          "top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
        alertDiv.innerHTML = `
          <strong>Success!</strong> Clocked out at ${response.data?.time || "now"}. Hours: ${response.data?.working_hours || 0}h
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 5000);

        // Refresh data
        await Promise.all([refreshAttendance(), refreshUserEntries()]);
      } else {
        setLocalError(response.message || "Clock out failed");
      }
    } catch (error: any) {
      setLocalError(error.message || "Clock out failed. Please try again.");
    } finally {
      setClockLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setPageLoading(true);
    try {
      await Promise.all([refreshAttendance(startDate, endDate), refreshUserEntries()]);
      setLocalError("");
    } catch (error) {
      setLocalError("Refresh failed.");
    } finally {
      setPageLoading(false);
    }
  };

  const getDatesInRange = (start: string, end: string) => {
    const dates = [];
    let curr = new Date(start);
    const last = new Date(end);
    // Safety cap to avoid infinite loops or massive arrays
    let iterations = 0;
    while (curr <= last && iterations < 93) { // 3 months max
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
      if (isAdmin) {
        employees.forEach((emp: Employee) => {
          if (employeeFilter && emp.id !== employeeFilter) return;

          const record = globalAttendance.find((r: DailyAttendanceSummary) => r.employee_id === emp.id && r.date === dateStr);
          const matchesStatus = !presenceFilter || (record ? record.status === presenceFilter : (presenceFilter === 'absent'));

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
        // Employee view: only show own records or virtual absent
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

    return result;
  })();

  if (pageLoading || globalLoading) {
    return (
      <div className="container-fluid">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "60vh" }}
        >
          <div className="text-center">
            <div className="premium-spinner mb-3"></div>
            <h5 className="text-muted">Loading attendance data...</h5>
          </div>
        </div>
      </div>
    );
  }

  if (localError || globalError) {
    return (
      <div className="container-fluid">
        <div className="alert alert-warning d-flex align-items-center shadow-sm">
          <AlertCircle className="me-2" />
          {localError || globalError}
          <button
            onClick={handleManualRefresh}
            className="btn btn-sm btn-outline-secondary ms-auto"
          >
            <RefreshCw size={14} className="me-1" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid fade-in px-0">
      <div className="row mb-5">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-end">
            <div>
              <h1 className="display-5 fw-800 text-white mb-2">Attendance</h1>
              <p className="text-secondary fw-500 mb-0">Track daily attendance and working hours</p>
            </div>
            {isAdmin && (
              <button onClick={handleManualRefresh} className="btn btn-premium-secondary d-flex align-items-center px-4 py-2">
                <RefreshCw size={16} className={`me-2 ${globalLoading ? 'spin' : ''}`} />
                Refresh Attendance
              </button>
            )}
          </div>
        </div>
      </div>

      {isAdmin ? (
        <>
          {/* Admin Discovery Layer */}
          <div className="premium-card mb-5 border-0 shadow-lg" style={{ background: 'var(--midnight-card)' }}>
            <div className="premium-card-body py-4">
              <div className="row g-4 align-items-end">
                <div className="col-lg-3">
                  <label className="text-secondary small fw-700 text-uppercase mb-2 d-block">
                    <Calendar size={14} className="me-2 text-cyan" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="form-control bg-opacity-05 border-secondary border-opacity-10 py-2 text-white"
                    style={{ borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="col-lg-3">
                  <label className="text-secondary small fw-700 text-uppercase mb-2 d-block">
                    <Calendar size={14} className="me-2 text-indigo" />
                    End Date
                  </label>
                  <input
                    type="date"
                    className="form-control bg-opacity-05 border-secondary border-opacity-10 py-2 text-white"
                    style={{ borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div className="col-lg-3">
                  <label className="text-secondary small fw-700 text-uppercase mb-2 d-block">
                    <Users size={14} className="me-2 text-cyan" />
                    Employee
                  </label>
                  <select
                    className="form-select bg-opacity-05 border-secondary border-opacity-10 py-2 text-white"
                    style={{ borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}
                    value={employeeFilter || ""}
                    onChange={(e) => setEmployeeFilter(e.target.value ? parseInt(e.target.value) : null)}
                  >
                    <option value="" className="bg-dark">All Employees</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id} className="bg-dark">{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-lg-2">
                  <label className="text-secondary small fw-700 text-uppercase mb-2 d-block">
                    <Filter size={14} className="me-2 text-indigo" />
                    Status
                  </label>
                  <select
                    className="form-select bg-opacity-05 border-secondary border-opacity-10 py-2 text-white"
                    style={{ borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}
                    value={presenceFilter}
                    onChange={(e) => setPresenceFilter(e.target.value)}
                  >
                    <option value="" className="bg-dark">All Statuses</option>
                    <option value="present" className="bg-dark fst-normal">Present</option>
                    <option value="absent" className="bg-dark fst-normal">Absent</option>
                    <option value="late" className="bg-dark fst-normal">Late</option>
                    <option value="half_day" className="bg-dark fst-normal">Half Day</option>
                  </select>
                </div>
                <div className="col-lg-1">
                  <button
                    onClick={() => { setEmployeeFilter(null); setPresenceFilter(""); }}
                    className="btn btn-premium-secondary w-100 py-2 border-secondary border-opacity-10 d-flex justify-content-center"
                    title="Reset"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Attendance Registry */}
          <div className="premium-card border-0 shadow-lg overflow-hidden">
            <div className="premium-card-header bg-transparent py-4 border-bottom border-secondary border-opacity-10">
              <h5 className="mb-0 fw-800 text-white d-flex align-items-center">
                <Users className="me-3 text-cyan" size={22} />
                Attendance Report <span className="ms-2 badge bg-cyan bg-opacity-10 text-cyan rounded-pill small fst-normal" style={{ fontSize: '0.7rem' }}>{filteredEmployees.length} ENTRIES</span>
              </h5>
            </div>
            <div className="premium-card-body p-0">
              <div className="table-responsive">
                <table className="premium-table mb-0">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th className="text-end">Working Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((record) => (
                        <tr key={`${record.employee_id}-${record.date}`}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center me-3 fw-800 shadow-sm"
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  background: 'var(--midnight-elevated)',
                                  border: '1px solid var(--midnight-border-bright)',
                                  color: 'var(--accent-cyan)',
                                  fontSize: "0.85rem",
                                }}
                              >
                                {record.employee_name.charAt(0)}
                              </div>
                              <span className="text-white fw-700">{record.employee_name}</span>
                            </div>
                          </td>
                          <td>
                            <div className="text-secondary small fw-600">
                              {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge rounded-pill px-3 py-1 fw-700 text-uppercase`}
                              style={{
                                fontSize: '0.65rem',
                                background: record.status === 'present' ? 'rgba(16,185,129,0.1)' : 
                                           record.status === 'absent' ? 'rgba(239,68,68,0.1)' :
                                           record.status === 'late' ? 'rgba(251,191,36,0.1)' : 'rgba(6,182,212,0.1)',
                                color: record.status === 'present' ? 'var(--success)' : 
                                       record.status === 'absent' ? '#ef4444' :
                                       record.status === 'late' ? 'var(--accent-gold)' : 'var(--accent-cyan)',
                                border: `1px solid ${record.status === 'present' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'}`
                              }}
                            >
                              {record.status}
                            </span>
                          </td>
                          <td><div className="text-white small fw-700">{record.first_clock_in || "---"}</div></td>
                          <td><div className="text-white small fw-700">{record.last_clock_out || "---"}</div></td>
                          <td className="text-end">
                            <div className="d-flex align-items-center justify-content-end">
                              <div className="text-cyan fw-800 me-2">{safeToFixed(record.total_working_hours)}h</div>
                              <div className="progress" style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.05)' }}>
                                <div 
                                  className="progress-bar bg-cyan" 
                                  style={{ width: `${Math.min((safeNumber(record.total_working_hours)/8)*100, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-5">
                          <Clock size={48} className="text-dimmed opacity-10 mb-3" />
                          <p className="text-secondary fw-500">No attendance records found for the selected criteria.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="row justify-content-center">
          <div className="col-xl-8 col-lg-10">
            {/* Clocking Station */}
            <div className="premium-card mb-5 border-0 shadow-lg overflow-hidden" style={{ background: 'var(--midnight-card)' }}>
              <div className="premium-card-body p-0">
                <div className="row g-0">
                  <div className="col-md-5 p-5 d-flex flex-column justify-content-center align-items-center border-end border-secondary border-opacity-10" style={{ background: 'var(--midnight-elevated)' }}>
                    <div 
                      className={`pulse-container mb-4 ${isClockedIn ? 'active' : ''}`}
                      style={{ 
                        width: '120px', 
                        height: '120px', 
                        borderRadius: '50%', 
                        background: isClockedIn ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
                        border: `2px solid ${isClockedIn ? 'var(--success)' : 'rgba(255,255,255,0.1)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}
                    >
                      {isClockedIn && (
                        <div className="pulse-ring" style={{ border: '2px solid var(--success)' }} />
                      )}
                      <Clock size={48} className={isClockedIn ? 'text-success' : 'text-dimmed'} />
                    </div>
                    <div className="text-center">
                      <h4 className="text-white fw-800 mb-1">{isClockedIn ? 'Clocked In' : 'Clocked Out'}</h4>
                      <p className="text-white opacity-50 small fw-700 text-uppercase mb-0 tracking-wider">Current Status</p>
                    </div>
                  </div>
                  <div className="col-md-7 p-5">
                    {localError && (
                      <div className="alert bg-danger bg-opacity-10 border-danger border-opacity-20 text-danger small fw-600 mb-4 d-flex align-items-center px-3 py-2 rounded-3">
                        <AlertCircle size={16} className="me-2" />
                        {localError}
                      </div>
                    )}
                    
                    <div className="mb-5">
                      <h5 className="text-white fw-700 mb-4">Today's Progress</h5>
                      <div className="row g-3">
                        <div className="col-6">
                          <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="text-dimmed small fw-700 uppercase mb-1" style={{ fontSize: '0.6rem' }}>Working Hours</div>
                            <div className="text-white fw-800 h4 mb-0">{safeToFixed(workingHours)}h</div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="text-dimmed small fw-700 uppercase mb-1" style={{ fontSize: '0.6rem' }}>Daily Progress</div>
                            <div className="text-cyan fw-800 h4 mb-0">{Math.round((safeNumber(workingHours)/8)*100)}%</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="d-grid">
                      {!isClockedIn ? (
                        <button
                          onClick={handleClockIn}
                          disabled={clockLoading}
                          className="btn btn-premium-primary py-3 shadow-glow-cyan"
                        >
                          {clockLoading ? (
                            <><div className="spinner-border spinner-border-sm me-2" /> Clocking in...</>
                          ) : (
                            <><CheckCircle className="me-2" size={20} /> Clock In</>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={handleClockOut}
                          disabled={clockLoading}
                          className="btn btn-premium-danger py-3 shadow-glow-danger"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid #ef4444' }}
                        >
                          {clockLoading ? (
                            <><div className="spinner-border spinner-border-sm me-2" /> Clocking out...</>
                          ) : (
                            <><Clock className="me-2" size={20} /> Clock Out</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Analytics */}
            <div className="premium-card border-0 shadow-lg" style={{ background: 'var(--midnight-card)' }}>
              <div className="premium-card-header bg-transparent py-4 border-bottom border-secondary border-opacity-10">
                <h5 className="mb-0 fw-800 text-white d-flex align-items-center">
                  <Calendar className="me-3 text-indigo" size={22} />
                  Today's Activity <span className="ms-2 badge bg-indigo bg-opacity-10 text-indigo rounded-pill small fst-normal" style={{ fontSize: '0.7rem' }}>SESSIONS</span>
                </h5>
              </div>
              <div className="premium-card-body p-4">
                {todayEntries.length > 0 ? (
                  <div className="row g-4">
                    {todayEntries.map((entry, index) => (
                      <div key={index} className="col-12">
                        <div className="group transition-all hover-bg-white-opacity-02 p-3 rounded-3 d-flex align-items-center justify-content-between border border-secondary border-opacity-05">
                          <div className="d-flex align-items-center">
                            <div 
                              className="rounded-3 p-3 me-3" 
                              style={{ 
                                background: entry.entry_type === 'in' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', 
                                color: entry.entry_type === 'in' ? 'var(--success)' : '#ef4444' 
                              }}
                            >
                              {entry.entry_type === 'in' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                            </div>
                            <div>
                              <div className="text-white fw-700">{entry.entry_type === 'in' ? 'Clocked In' : 'Clocked Out'}</div>
                              <div className="text-dimmed small fw-600 d-flex align-items-center mt-1">
                                <Clock size={12} className="me-1 opacity-50" />
                                Time: {entry.time}
                              </div>
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="badge bg-white bg-opacity-05 text-secondary rounded-pill px-3 py-1 font-monospace" style={{ fontSize: '0.6rem' }}>
                              Session ID: {entry.session_id?.substring(0, 8).toUpperCase() || "MANUAL"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <RefreshCw size={48} className="text-dimmed opacity-10 mb-3" />
                    <h6 className="text-white fw-700">No Activity Today</h6>
                    <p className="text-secondary small fw-500 mb-0">Your clock-in and clock-out activity will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
