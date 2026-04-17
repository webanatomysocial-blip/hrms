import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Employee, DailyAttendanceSummary, LeaveRequest, Holiday, AttendanceEntry } from '../types';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

interface DataContextType {
  employees: Employee[];
  attendance: DailyAttendanceSummary[];
  userEntries: AttendanceEntry[];
  isClockedIn: boolean;
  leaveRequests: LeaveRequest[];
  holidays: Holiday[];
  loading: boolean;
  error: string;
  refreshEmployees: () => Promise<void>;
  refreshAttendance: (startDate?: string, endDate?: string) => Promise<void>;
  refreshUserEntries: () => Promise<void>;
  refreshLeaveRequests: () => Promise<void>;
  refreshHolidays: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<DailyAttendanceSummary[]>([]);
  const [userEntries, setUserEntries] = useState<AttendanceEntry[]>([]);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
    
    // ✅ DYNAMIC: Auto-refresh data every 30 seconds to keep dashboards "live"
    const pollInterval = setInterval(() => {
      refreshAttendance();
      refreshUserEntries();
      refreshLeaveRequests();
      refreshHolidays();
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [user]);

  const loadInitialData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Data loading timeout')), 15000)
      );

      await Promise.race([
        Promise.all([
          refreshEmployees(),
          refreshAttendance(),
          refreshUserEntries(),
          refreshLeaveRequests(),
          refreshHolidays(),
        ]),
        timeoutPromise
      ]);

      setError('');
    } catch (error: any) {
      setError('Failed to load system data. Some features may be limited.');
      setEmployees([]);
      setAttendance([]);
      setLeaveRequests([]);
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshEmployees = async () => {
    try {
      const response = await api.getEmployees();
      if (response.success && response.data) {
        setEmployees(response.data);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      setEmployees([]);
    }
  };

  const refreshAttendance = async (startDate?: string, endDate?: string) => {
    try {
      const response = await api.getAttendanceSummary(startDate, endDate);
      if (response.success && response.data) {
        setAttendance(response.data);
      } else {
        setAttendance([]);
      }
    } catch (error) {
      setAttendance([]);
    }
  };

  const refreshUserEntries = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await api.getEmployeeAttendanceEntries(user.id);
      if (response.success && response.data) {
        const entries = response.data;
        setUserEntries(entries);
        
        // Derive clocked in status from THE absolute latest entry
        if (entries.length > 0) {
          setIsClockedIn(entries[0].entry_type === 'in');
        } else {
          setIsClockedIn(false);
        }
      }
    } catch (error) {
      console.error('Failed to refresh user entries:', error);
    }
  }, [user?.id]);

  const refreshLeaveRequests = async () => {
    try {
      const response = await api.getLeaveRequests();
      if (response.success && response.data) {
        setLeaveRequests(response.data);
      } else {
        setLeaveRequests([]);
      }
    } catch (error) {
      setLeaveRequests([]);
    }
  };

  const refreshHolidays = async () => {
    try {
      const response = await api.getHolidays();
      if (response.success && response.data) {
        setHolidays(response.data);
      } else {
        setHolidays([]);
      }
    } catch (error) {
      setHolidays([]);
    }
  };

  const refreshAll = async () => {
    await loadInitialData();
  };

  const value: DataContextType = {
    employees,
    attendance,
    userEntries,
    isClockedIn,
    leaveRequests,
    holidays,
    loading,
    error,
    refreshEmployees,
    refreshAttendance,
    refreshUserEntries,
    refreshLeaveRequests,
    refreshHolidays,
    refreshAll,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
