import { User, Employee, AttendanceEntry, DailyAttendanceSummary, LeaveRequest, Holiday, LoginCredentials, ApiResponse } from '../types';

// LIVE API BASE URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  private token: string | null = null;
  private readonly DEFAULT_TIMEOUT = 15000;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private async requestWithTimeout<T>(
    endpoint: string, 
    options: RequestInit = {},
    timeout: number = this.DEFAULT_TIMEOUT
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      defaultHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      headers: { ...defaultHeaders, ...options.headers },
      ...options,
    };

    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout)
    );

    const fetchPromise = fetch(url, config).then(async response => {
      const text = await response.text();
      let json: any = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        throw new Error(`Invalid JSON response: ${text?.slice(0, 200)}`);
      }
      if (!response.ok) {
        const msg = (json && json.message) ? json.message : response.statusText;
        throw new Error(`HTTP ${response.status}: ${msg}`);
      }
      return json;
    });

    try {
      return await Promise.race([fetchPromise, timeoutPromise]);
    } catch (error) {
      throw error;
    }
  }

  // AUTH
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    const res = await this.requestWithTimeout<{ user: User; token: string }>('/auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (res.success && res.data) {
      this.token = res.data.token;
      localStorage.setItem('token', res.data.token);
    }
    return res;
  }

  async verifyToken(): Promise<ApiResponse<{ user: User }>> {
    return this.requestWithTimeout<{ user: User }>('/auth.php?action=verify', { method: 'POST' });
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('token');
  }

  // EMPLOYEES
  async getEmployees(): Promise<ApiResponse<Employee[]>> {
    return await this.requestWithTimeout<Employee[]>('/employees.php');
  }

  async getEmployee(id: number): Promise<ApiResponse<Employee>> {
    return await this.requestWithTimeout<Employee>(`/employees.php?id=${id}`);
  }

  async createEmployee(employeeData: Partial<Employee> & { password: string }): Promise<ApiResponse<{ id: number }>> {
    return await this.requestWithTimeout<{ id: number }>('/employees.php', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  }

  async updateEmployee(id: number, employeeData: Partial<Employee>): Promise<ApiResponse<void>> {
    return await this.requestWithTimeout<void>(`/employees.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    });
  }

  async deleteEmployee(id: number): Promise<ApiResponse<void>> {
    return await this.requestWithTimeout<void>(`/employees.php?id=${id}`, {
      method: 'DELETE',
    });
  }

  // ATTENDANCE
  async getAttendanceSummary(startDate?: string, endDate?: string): Promise<ApiResponse<DailyAttendanceSummary[]>> {
    let url = '/attendance.php?summary=true';
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    return await this.requestWithTimeout<DailyAttendanceSummary[]>(url);
  }

  async getEmployeeAttendanceEntries(employeeId: number): Promise<ApiResponse<AttendanceEntry[]>> {
    return await this.requestWithTimeout<AttendanceEntry[]>(`/attendance.php?employee_id=${employeeId}`);
  }

  async clockIn(employeeId: number): Promise<ApiResponse<{ time: string; session_id: string }>> {
    return await this.requestWithTimeout<{ time: string; session_id: string }>('/attendance.php?action=clock-in', {
      method: 'POST',
      body: JSON.stringify({ employee_id: employeeId }),
    }, 20000);
  }

  async clockOut(employeeId: number): Promise<ApiResponse<{ time: string; working_hours: number }>> {
    return await this.requestWithTimeout<{ time: string; working_hours: number }>('/attendance.php?action=clock-out', {
      method: 'POST',
      body: JSON.stringify({ employee_id: employeeId }),
    }, 20000);
  }

  // LEAVES
  async getLeaveRequests(): Promise<ApiResponse<LeaveRequest[]>> {
    return await this.requestWithTimeout<LeaveRequest[]>('/leaves.php');
  }
  async getEmployeeLeaveRequests(employeeId: number): Promise<ApiResponse<LeaveRequest[]>> {
    return await this.requestWithTimeout<LeaveRequest[]>(`/leaves.php?employee_id=${employeeId}`);
  }
  async createLeaveRequest(leaveData: {
    employee_id: number;
    type: string;
    start_date: string;
    end_date: string;
    days: number;
    reason: string;
    is_unpaid: boolean;
  }): Promise<ApiResponse<{ id: number }>> {
    return await this.requestWithTimeout<{ id: number }>('/leaves.php', {
      method: 'POST',
      body: JSON.stringify(leaveData),
    });
  }
  async approveLeaveRequest(id: number, status: 'approved' | 'rejected', approvedBy: number): Promise<ApiResponse<void>> {
    return await this.requestWithTimeout<void>(`/leaves.php?id=${id}&action=approve`, {
      method: 'PUT',
      body: JSON.stringify({ status, approved_by: approvedBy }),
    });
  }
  async updateLeaveRequest(id: number, leaveData: Partial<LeaveRequest>): Promise<ApiResponse<void>> {
    return await this.requestWithTimeout<void>(`/leaves.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(leaveData),
    });
  }
  async deleteLeaveRequest(id: number): Promise<ApiResponse<void>> {
    return await this.requestWithTimeout<void>(`/leaves.php?id=${id}`, {
      method: 'DELETE',
    });
  }

  // HOLIDAYS
  async getHolidays(): Promise<ApiResponse<Holiday[]>> {
    return await this.requestWithTimeout<Holiday[]>('/holidays.php');
  }
  async createHoliday(data: { name: string; date: string; type: 'public' | 'company' | 'optional'; description?: string; }): Promise<ApiResponse<{ id: number }>> {
    return await this.requestWithTimeout<{ id: number }>('/holidays.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async updateHoliday(id: number, data: Partial<Holiday>): Promise<ApiResponse<void>> {
    return await this.requestWithTimeout<void>(`/holidays.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  async deleteHoliday(id: number): Promise<ApiResponse<void>> {
    return await this.requestWithTimeout<void>(`/holidays.php?id=${id}`, {
      method: 'DELETE',
    });
  }

  // NOTIFICATIONS
  async getNotifications(): Promise<ApiResponse<{ notifications: any[]; unread_count: number }>> {
    return await this.requestWithTimeout<{ notifications: any[]; unread_count: number }>('/notifications.php');
  }
  async markNotificationAsRead(id: number): Promise<ApiResponse<void>> {
    return await this.requestWithTimeout<void>(`/notifications.php?id=${id}`, { method: 'PUT' });
  }
  async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    return await this.requestWithTimeout<void>('/notifications.php?action=mark-all-read', { method: 'PUT' });
  }
  async deleteNotification(id: number): Promise<ApiResponse<void>> {
    return await this.requestWithTimeout<void>(`/notifications.php?id=${id}`, { method: 'DELETE' });
  }
}

export const api = new ApiService();
