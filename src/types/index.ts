export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  department?: string;
  position?: string;
  joining_date?: string;
  created_at?: string;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  department?: string;
  position?: string;
  joining_date?: string;
  created_at?: string;
}

export interface AttendanceEntry {
  id: number;
  employee_id: number;
  employee_name: string;
  date: string;
  time: string;
  entry_type: 'in' | 'out';
  session_id?: string;
  notes?: string;
  ip_address?: string;
  created_at?: string;
}

export interface DailyAttendanceSummary {
  id: number;
  employee_id: number;
  employee_name: string;
  date: string;
  total_working_hours: number;
  total_break_time: number;
  status: 'present' | 'absent' | 'late' | 'half_day';
  first_clock_in?: string;
  last_clock_out?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  employee_name: string;
  type: 'sick' | 'vacation' | 'personal' | 'maternity' | 'paternity';
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  is_unpaid: boolean;
  approved_by?: number;
  approved_by_name?: string;
  approved_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Holiday {
  id: number;
  name: string;
  date: string;
  type: 'public' | 'company' | 'optional';
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
