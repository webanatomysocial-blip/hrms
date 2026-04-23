import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { api } from '../../lib/api';
import { Users, Clock, Calendar, CheckCircle, AlertCircle, Gift, ChevronRight, Activity, LogOut, UserPlus } from 'lucide-react';
import { DailyAttendanceSummary } from '../../types';

const safeDate = (dateStr?: string): Date => {
  if (!dateStr) return new Date();
  // Ensure we compare only year-month-day by setting time to midnight
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
};

interface DashboardProps {
  onPageChange: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onPageChange }) => {
  const { user, isAdmin } = useAuth();
  const { 
    employees, 
    attendance, 
    isClockedIn, 
    leaveRequests, 
    holidays, 
    loading, 
    refreshAttendance, 
    refreshUserEntries 
  } = useData();
  const [todayAttendanceRecord, setTodayAttendanceRecord] = useState<DailyAttendanceSummary | null>(null);
  const [clockLoading, setClockLoading] = useState(false);
  const [clockError, setClockError] = useState<string>('');

  const today = new Date().toLocaleDateString('en-CA', {timeZone: 'Asia/Kolkata'});
  const currentTime = new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });

  const [liveTimer, setLiveTimer] = useState<string>('00:00:00');

  useEffect(() => {
    checkTodayAttendance();
  }, [attendance, user]);

  // ✅ DYNAMIC: Live shift timer effect
  useEffect(() => {
    let interval: any;

    if (isClockedIn && todayAttendanceRecord?.first_clock_in) {
      const firstClockIn = todayAttendanceRecord.first_clock_in;
      const calculateDuration = () => {
        const now = new Date();
        const [h, m, s] = firstClockIn.split(':').map(Number);
        const startTime = new Date();
        startTime.setHours(h, m, s, 0);

        const diffMs = Math.max(0, now.getTime() - startTime.getTime());
        const hours = Math.floor(diffMs / 3600000);
        const minutes = Math.floor((diffMs % 3600000) / 60000);
        const seconds = Math.floor((diffMs % 60000) / 1000);

        setLiveTimer(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      };

      calculateDuration();
      interval = setInterval(calculateDuration, 1000);
    } else {
      setLiveTimer('00:00:00');
    }

    return () => clearInterval(interval);
  }, [isClockedIn, todayAttendanceRecord]);

  const checkTodayAttendance = () => {
    if (!user?.id) return;
    const record = attendance.find(a => Number(a.employee_id) === Number(user.id) && a.date === today);
    setTodayAttendanceRecord(record || null);
  };

  const handleQuickClockIn = async () => {
    if (!user?.id) {
      setClockError('User not authenticated');
      return;
    }
    
    setClockLoading(true);
    setClockError('');
    
    try {
      const response = await api.clockIn(user.id);
      
      if (response.success) {
        // Show success message
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed';
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; box-shadow: var(--shadow-lg);';
        alertDiv.innerHTML = `
          <div class="d-flex align-items-center">
            <div class="me-3 bg-success bg-opacity-20 p-2 rounded-circle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div>
              <strong>Success!</strong><br/>
              Clocked in at ${response.data?.time || currentTime}
            </div>
          </div>
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 5000);
        
        // Refresh and re-check
        await Promise.all([refreshAttendance(), refreshUserEntries()]);
        setTimeout(checkTodayAttendance, 800); 
      } else {
        setClockError(response.message || 'Clock in failed');
      }
    } catch (error: any) {
      setClockError(error.message || 'Failed to clock in. Please try again.');
    } finally {
      setClockLoading(false);
    }
  };

  const handleQuickClockOut = async () => {
    if (!user?.id) {
      setClockError('User not authenticated');
      return;
    }
    
    setClockLoading(true);
    setClockError('');
    
    try {
      const response = await api.clockOut(user.id);
      
      if (response.success) {
        // Show success message
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed';
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; box-shadow: var(--shadow-lg);';
        alertDiv.innerHTML = `
          <div class="d-flex align-items-center">
            <div class="me-3 bg-success bg-opacity-20 p-2 rounded-circle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div>
              <strong>Success!</strong><br/>
              Clocked out at ${response.data?.time || currentTime}
            </div>
          </div>
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 5000);
        
        // Refresh and re-check
        await Promise.all([refreshAttendance(), refreshUserEntries()]);
        setTimeout(checkTodayAttendance, 800);
      } else {
        setClockError(response.message || 'Clock out failed');
      }
    } catch (error: any) {
      setClockError(error.message || 'Failed to clock out. Please try again.');
    } finally {
      setClockLoading(false);
    }
  };

  const totalEmployees = employees.length;
  const todayAttendance = attendance.filter((a: DailyAttendanceSummary) => a.date === today);
  const presentToday = todayAttendance.filter((a: DailyAttendanceSummary) => a.status === 'present' || a.status === 'late' || a.status === 'half_day').length;
  const lateToday = todayAttendance.filter((a: DailyAttendanceSummary) => a.status === 'late').length;
  const pendingLeaves = leaveRequests.filter((l: any) => l.status === 'pending').length;
  
  // Safe comparison for leave dates
  const approvedLeavesToday = leaveRequests.filter((l: any) => {
    if (l.status !== 'approved') return false;
    const start = safeDate(l.start_date).getTime();
    const end = safeDate(l.end_date).getTime();
    const current = safeDate(today).getTime();
    return current >= start && current <= end;
  }).length;

  const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;

  const recentAttendance = attendance.filter((a: DailyAttendanceSummary) => safeDate(a.date).getTime() >= safeDate(today).getTime() - (7 * 24 * 60 * 60 * 1000))
    .sort((a: DailyAttendanceSummary, b: DailyAttendanceSummary) => safeDate(b.date).getTime() - safeDate(a.date).getTime()).slice(0, 5);
  const recentLeaves = leaveRequests.sort((a: any, b: any) => safeDate(b.created_at).getTime() - safeDate(a.created_at).getTime()).slice(0, 5);
  const upcomingHolidays = holidays.filter((h: any) => safeDate(h.date).getTime() > safeDate(today).getTime()).slice(0, 4);

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="premium-spinner mb-3" />
            <h5 className="text-muted">Loading dashboard...</h5>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid fade-in px-0">
      <div className="row mb-5">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-end mb-2">
            <div>
              <h1 className="display-5 fw-800 text-white mb-2">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name}!
              </h1>
              <p className="text-secondary fw-500 mb-0 d-flex align-items-center">
                <Calendar size={16} className="me-2 text-cyan" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                <span className="mx-2 opacity-20">|</span>
                <Clock size={16} className="me-2 text-indigo" />
                {currentTime}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Bar (Employee Only) */}
      {!isAdmin && (
        <div className="premium-card mb-5 border-0 shadow-lg overflow-hidden" 
             style={{ 
               background: isClockedIn ? 'linear-gradient(90deg, #0f172a, #1e293b)' : 'linear-gradient(90deg, var(--midnight-card), var(--midnight-elevated))',
               borderLeft: `5px solid ${isClockedIn ? 'var(--success)' : 'var(--accent-cyan)'}`
             }}>
          <div className="premium-card-body py-4 position-relative">
            {/* Background Clock Icon Removed as requested */}
            
            {clockError && (
              <div className="alert alert-danger border-0 mb-4 fade show d-flex align-items-center" role="alert" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                <AlertCircle size={18} className="me-2" />
                <span className="small fw-600">{clockError}</span>
                <button type="button" className="btn-close btn-close-white ms-auto" onClick={() => setClockError('')} style={{ fontSize: '0.5rem' }}></button>
              </div>
            )}
            
            <div className="row align-items-center">
              <div className="col-md-7">
                <div className="d-flex align-items-center">
                  <div 
                    className={`rounded-circle d-flex align-items-center justify-content-center me-4 shadow-lg ${isClockedIn ? 'pulse-success' : ''}`} 
                    style={{ 
                      width: '72px', 
                      height: '72px', 
                      background: isClockedIn ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, var(--midnight-elevated), var(--midnight-border-bright))', 
                      color: '#ffffff',
                      boxShadow: isClockedIn ? '0 0 25px rgba(16, 185, 129, 0.4)' : 'none'
                    }}
                  >
                    <Clock size={32} className={isClockedIn ? 'fade-in' : ''} />
                  </div>
                  <div>
                    <h4 className="mb-1 fw-800 text-white">{isClockedIn ? 'You are Clocked In' : 'Ready to start?'}</h4>
                    <div className="d-flex align-items-center text-secondary small fw-600">
                      {todayAttendanceRecord ? (
                        <>
                          <span className="d-flex align-items-center me-3"><CheckCircle size={14} className="me-1 text-success" /> Started at {todayAttendanceRecord.first_clock_in || '--:--'}</span>
                          {todayAttendanceRecord.last_clock_out && <span className="d-flex align-items-center me-3"><LogOut size={14} className="me-1 text-danger" /> Ended at {todayAttendanceRecord.last_clock_out}</span>}
                          {isClockedIn ? (
                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 pulse-success">Live: {liveTimer}</span>
                          ) : (
                            todayAttendanceRecord.total_working_hours > 0 && <span className="badge bg-cyan bg-opacity-10 text-cyan rounded-pill px-2">{todayAttendanceRecord.total_working_hours}h tracked</span>
                          )}
                        </>
                      ) : (
                        <span>You haven't clocked in yet today.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-5 text-end">
                  <div className="d-flex justify-content-end gap-3">
                    {!isClockedIn ? (
                      <button onClick={handleQuickClockIn} disabled={clockLoading} className="btn btn-premium-add px-5 py-3 rounded-pill shadow-lg">
                        {clockLoading ? (
                          <div className="spinner-border spinner-border-sm me-2" role="status" />
                        ) : (
                          <Clock className="me-2" size={20} />
                        )}
                        Clock In Now
                      </button>
                    ) : (
                      <button onClick={handleQuickClockOut} disabled={clockLoading} className="btn btn-premium-danger px-5 py-3 rounded-pill shadow-lg">
                        {clockLoading ? (
                          <div className="spinner-border spinner-border-sm me-2" role="status" />
                        ) : (
                          <LogOut className="me-2" size={20} />
                        )}
                        Clock Out
                      </button>
                    )}
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="row mb-5">
        {isAdmin ? (
          <>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="premium-stat-card h-100">
                <div className="premium-stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-indigo)' }}><Users size={24} /></div>
                <div className="premium-stat-number">{totalEmployees}</div>
                <div className="premium-stat-label">Total Employees</div>
                <div className="mt-3 d-flex align-items-center">
                  <span className="badge bg-success bg-opacity-10 text-success rounded-pill small px-2">+5.2%</span>
                  <span className="text-dimmed small ms-2">vs last month</span>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="premium-stat-card h-100">
                <div className="premium-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}><CheckCircle size={24} /></div>
                <div className="premium-stat-number">{presentToday} <span className="text-dimmed h5">/ {totalEmployees}</span></div>
                <div className="premium-stat-label">Present</div>
                <div className="mt-3 w-100">
                  <div className="progress" style={{ height: '4px', background: 'rgba(255,255,255,0.05)' }}>
                    <div className="progress-bar bg-success" style={{ width: `${attendanceRate}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="premium-stat-card h-100">
                <div className="premium-stat-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}><Calendar size={24} /></div>
                <div className="premium-stat-number">{approvedLeavesToday}</div>
                <div className="premium-stat-label">On Leave Today</div>
                <div className="mt-3 small text-dimmed fw-600">{pendingLeaves} pending approvals</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="premium-stat-card h-100">
                <div className="premium-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}><AlertCircle size={24} /></div>
                <div className="premium-stat-number">{lateToday}</div>
                <div className="premium-stat-label">Late</div>
                <div className={`mt-3 small fw-700 ${lateToday > 0 ? 'text-danger' : 'text-success'}`}>
                  {lateToday > 0 ? 'Action required' : 'Excellent punctuality'}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="premium-stat-card h-100">
                <div className="premium-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}><CheckCircle size={24} /></div>
                <div className="premium-stat-number text-capitalize" style={{ fontSize: '1.5rem' }}>{todayAttendanceRecord?.status || 'Not Recorded'}</div>
                <div className="premium-stat-label">Attendance Status</div>
                <div className="mt-3 text-cyan fw-600 small">{isClockedIn ? liveTimer : `${todayAttendanceRecord?.total_working_hours || 0} hours`} logged</div>
              </div>
            </div>
            {(() => {
              const calculateLeaveAllowance = (joiningDate?: string) => {
                if (!joiningDate) return { paid: 12, lop: 6 };
                const join = new Date(joiningDate);
                const now = new Date();
                let months = (now.getFullYear() - join.getFullYear()) * 12 + (now.getMonth() - join.getMonth());
                if (now.getDate() < join.getDate()) months--;
                if (months < 4) return { paid: 0, lop: 0 };
                if (months === 4) return { paid: 1, lop: 0.5 };
                if (months === 5) return { paid: 2, lop: 1 };
                return { paid: 12, lop: 6 };
              };
              const allowance = calculateLeaveAllowance(user?.joining_date);
              const userApprovedLeaves = leaveRequests.filter(l => Number(l.employee_id) === Number(user?.id) && l.status === 'approved');
              const paidTaken = userApprovedLeaves.filter(l => !l.is_unpaid).reduce((sum, l) => sum + l.days, 0);
              const lopTaken = userApprovedLeaves.filter(l => l.is_unpaid).reduce((sum, l) => sum + l.days, 0);
              const remainingPaid = Math.max(0, allowance.paid - paidTaken);
              const remainingLop = Math.max(0, allowance.lop - lopTaken);

              return (
                <>
                  <div className="col-lg-4 col-md-6 mb-4">
                    <div className="premium-stat-card h-100 shadow-glow-indigo">
                      <div className="premium-stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-indigo)' }}><Calendar size={24} /></div>
                      <div className="premium-stat-number">{remainingPaid} / {allowance.paid}</div>
                      <div className="premium-stat-label">Remaining Paid Leaves</div>
                      <div className="mt-3 text-dimmed small fw-600">{paidTaken} days used</div>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-6 mb-4">
                    <div className="premium-stat-card h-100 shadow-glow-cyan">
                      <div className="premium-stat-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}><AlertCircle size={24} /></div>
                      <div className="premium-stat-number">{remainingLop} / {allowance.lop}</div>
                      <div className="premium-stat-label">LOP Balance</div>
                      <div className="mt-3 text-dimmed small fw-600">{lopTaken} days applied</div>
                    </div>
                  </div>
                </>
              );
            })()}
          </>
        )}
      </div>

      <div className="row">
        {/* Main Overview Column */}
        <div className="col-xl-8 col-lg-7">
          <div className="premium-card mb-5">
            <div className="premium-card-header bg-transparent border-bottom border-secondary border-opacity-10 py-4">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-800 text-white d-flex align-items-center">
                  <Activity size={20} className="text-cyan me-3" /> Attendance Overview
                </h5>
                <span className="badge bg-cyan bg-opacity-10 text-cyan px-2 py-1 small rounded-pill">Real-time</span>
              </div>
            </div>
            <div className="premium-card-body p-4">
              <div className="row align-items-center">
                <div className="col-md-6 mb-4 mb-md-0">
                  <div className="position-relative d-inline-block">
                    <svg width="160" height="160" viewBox="0 0 160 160">
                      <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                      <circle cx="80" cy="80" r="70" fill="none" stroke="var(--accent-cyan)" strokeWidth="12" 
                        strokeDasharray="440" strokeDashoffset={440 - (440 * attendanceRate / 100)} 
                        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
                    </svg>
                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                      <div className="h2 fw-800 mb-0 text-white">{attendanceRate}%</div>
                      <div className="small text-secondary fw-600 uppercase" style={{ fontSize: '0.6rem', letterSpacing: '0.1em' }}>Attendance Rate</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h6 className="text-white fw-700 mb-1">Employee Attendance</h6>
                    <p className="text-secondary small fw-500 mb-0">{presentToday} out of {totalEmployees} employees present today.</p>
                  </div>
                </div>
                <div className="col-md-6 border-start border-secondary border-opacity-10 ps-md-5">
                  <h6 className="text-secondary small fw-700 text-uppercase mb-4">Daily Breakdown</h6>
                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-2 small fw-600">
                      <span className="text-dimmed">Presence Rate</span>
                      <span className="text-white">{attendanceRate}%</span>
                    </div>
                    <div className="progress" style={{ height: '6px', background: 'rgba(255,255,255,0.03)' }}>
                      <div className="progress-bar bg-cyan shadow-glow-cyan" style={{ width: `${attendanceRate}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="d-flex justify-content-between mb-2 small fw-600">
                      <span className="text-dimmed">On Leave</span>
                      <span className="text-white">{totalEmployees > 0 ? Math.round((approvedLeavesToday / totalEmployees) * 100) : 0}%</span>
                    </div>
                    <div className="progress" style={{ height: '6px', background: 'rgba(255,255,255,0.03)' }}>
                      <div className="progress-bar bg-indigo shadow-glow-indigo" style={{ width: `${totalEmployees > 0 ? (approvedLeavesToday / totalEmployees) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="premium-card mb-5">
            <div className="premium-card-header bg-transparent border-bottom border-secondary border-opacity-10 py-4">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-800 text-white d-flex align-items-center">
                  <Clock size={20} className="text-indigo me-3" /> Recent Activity
                </h5>
                <button onClick={() => onPageChange('attendance')} className="btn btn-sm btn-premium-secondary py-1 px-3">
                  View Full Logs <ChevronRight size={14} className="ms-1" />
                </button>
              </div>
            </div>
            <div className="premium-card-body p-0">
              <div className="row g-0">
                <div className="col-md-6 border-end border-secondary border-opacity-10">
                  <div className="p-4">
                    <h6 className="text-secondary small fw-700 text-uppercase mb-4 d-flex align-items-center">
                      <span className="p-1 rounded bg-success bg-opacity-10 me-2"></span> Recent Attendance
                    </h6>
                    {recentAttendance.length > 0 ? recentAttendance.map((record, index) => (
                      <div key={index} className="d-flex align-items-center mb-4 last-mb-0">
                        <div className="rounded-circle d-flex align-items-center justify-content-center me-3 fw-800"
                          style={{ width: '42px', height: '42px', background: 'var(--midnight-elevated)', border: '1px solid var(--midnight-border-bright)', color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>
                          {record.employee_name.charAt(0)}
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="text-white fw-700 small text-truncate">{record.employee_name}</span>
                            <span className={`badge px-2 py-1 rounded-pill fw-700`} style={{ 
                              fontSize: '0.6rem', 
                              color: record.status === 'present' ? 'var(--success)' : record.status === 'late' ? 'var(--warning)' : '#ef4444', 
                              background: record.status === 'present' ? 'rgba(16,185,129,0.15)' : record.status === 'late' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                              border: `1px solid ${record.status === 'present' ? 'rgba(16,185,129,0.2)' : record.status === 'late' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`
                            }}>
                              {record.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-dimmed small fw-500">{record.first_clock_in || 'Pending'} <span className="mx-1">•</span> {safeDate(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-5">
                        <Activity size={32} className="text-dimmed opacity-20 mb-3" />
                        <p className="text-dimmed small fw-600">Quiet day so far</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-4">
                    <h6 className="text-secondary small fw-700 text-uppercase mb-4 d-flex align-items-center">
                      <span className="p-1 rounded bg-info bg-opacity-10 me-2"></span> Recent Leave Requests
                    </h6>
                    {recentLeaves.length > 0 ? recentLeaves.map((leave, index) => (
                      <div key={index} className="d-flex align-items-center mb-4 last-mb-0">
                        <div className="rounded-circle d-flex align-items-center justify-content-center me-3 fw-800"
                          style={{ width: '42px', height: '42px', background: 'var(--midnight-elevated)', border: '1px solid var(--midnight-border-bright)', color: 'var(--accent-indigo)', fontSize: '0.9rem' }}>
                          {leave.employee_name.charAt(0)}
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="text-white fw-700 small text-truncate">{leave.employee_name}</span>
                            <span className="text-white small fw-600 px-2 rounded-1" style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.08)' }}>{leave.days}d</span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-dimmed small fw-500 text-capitalize">{leave.type}</span>
                            <span className={`fw-700 small ${leave.status === 'approved' ? 'text-success' : leave.status === 'rejected' ? 'text-danger' : 'text-warning'}`} style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{leave.status}</span>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-5">
                        <Calendar size={32} className="text-dimmed opacity-20 mb-3" />
                        <p className="text-dimmed small fw-600">No recent requests</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="col-xl-4 col-lg-5">
          <div className="premium-card mb-5">
            <div className="premium-card-header bg-transparent border-bottom border-secondary border-opacity-10 py-4">
              <h5 className="mb-0 fw-800 text-white">Quick Actions</h5>
            </div>
            <div className="premium-card-body p-4">
              <div className="d-grid gap-3">
                {isAdmin ? (
                  <>
                    <button onClick={() => onPageChange('employees')} className="btn btn-premium-primary text-start d-flex align-items-center justify-content-between group">
                      <span className="d-flex align-items-center"><Users size={18} className="me-3" /> Manage Employees</span>
                      <ChevronRight size={16} className="opacity-50" />
                    </button>
                    <button onClick={() => onPageChange('leave-approvals')} className="btn btn-premium-secondary text-start d-flex align-items-center justify-content-between">
                      <span className="d-flex align-items-center">
                        <CheckCircle size={18} className="me-3 text-success" /> Leave Approvals
                        {pendingLeaves > 0 && <span className="ms-2 badge bg-danger rounded-pill pulse" style={{ fontSize: '0.6rem' }}>{pendingLeaves}</span>}
                      </span>
                      <ChevronRight size={16} className="opacity-50" />
                    </button>
                    <button onClick={() => onPageChange('add-employees')} className="btn btn-premium-secondary text-start d-flex align-items-center justify-content-between">
                      <span className="d-flex align-items-center"><UserPlus size={18} className="me-3 text-cyan" /> Add New Employee</span>
                      <ChevronRight size={16} className="opacity-50" />
                    </button>
                    <button onClick={() => onPageChange('holidays')} className="btn btn-premium-secondary text-start d-flex align-items-center justify-content-between">
                      <span className="d-flex align-items-center"><Gift size={18} className="me-3 text-indigo" /> Manage Holidays</span>
                      <ChevronRight size={16} className="opacity-50" />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => onPageChange('attendance')} className="btn btn-premium-primary text-start d-flex align-items-center justify-content-between">
                      <span className="d-flex align-items-center"><Clock size={18} className="me-3" /> My Attendance</span>
                      <ChevronRight size={16} className="opacity-50" />
                    </button>
                    <button onClick={() => onPageChange('leave-requests')} className="btn btn-premium-secondary text-start d-flex align-items-center justify-content-between">
                      <span className="d-flex align-items-center"><Calendar size={18} className="me-3 text-indigo" /> Apply for Leave</span>
                      <ChevronRight size={16} className="opacity-50" />
                    </button>
                    <button onClick={() => onPageChange('holidays')} className="btn btn-premium-secondary text-start d-flex align-items-center justify-content-between">
                      <span className="d-flex align-items-center"><Gift size={18} className="me-3 text-gold" /> Holiday Calendar</span>
                      <ChevronRight size={16} className="opacity-50" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="premium-card">
            <div className="premium-card-header bg-transparent border-bottom border-secondary border-opacity-10 py-4">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-800 text-white">Upcoming Holidays</h5>
                <button onClick={() => onPageChange('holidays')} className="btn btn-link pe-0 text-cyan text-decoration-none small fw-600">All Holidays</button>
              </div>
            </div>
            <div className="premium-card-body p-4">
              {upcomingHolidays.length > 0 ? upcomingHolidays.map((holiday, index) => (
                <div key={index} className="d-flex align-items-center mb-4 last-mb-0 p-3 rounded-3 transition-bg hover-bg-white-opacity-05" style={{ border: '1px solid var(--midnight-border)' }}>
                  <div className="rounded-3 d-flex align-items-center justify-content-center me-3 shadow-glow-indigo" 
                    style={{ width: '48px', height: '48px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-indigo)', borderRadius: '12px' }}>
                    <Gift size={22} />
                  </div>
                  <div className="flex-grow-1 overflow-hidden">
                    <h6 className="mb-1 fw-700 text-white small text-truncate">{holiday.name}</h6>
                    <div className="d-flex align-items-center small fw-600 text-dimmed">
                      <span className="text-white bg-white bg-opacity-10 px-2 rounded-1 me-2" style={{ fontSize: '0.6rem' }}>{Math.ceil((safeDate(holiday.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} Days left</span>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="text-white fw-800 small">{safeDate(holiday.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                    <div className="text-dimmed fw-600" style={{ fontSize: '0.65rem' }}>{safeDate(holiday.date).getFullYear()}</div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-5">
                  <Gift size={40} className="text-dimmed opacity-20 mb-3" />
                  <p className="text-dimmed small fw-600">No scheduled holidays</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
