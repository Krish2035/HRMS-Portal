const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export class ApiClient {
  private static token: string | null = null;

  static setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('hrms_access_token', token);
      else localStorage.removeItem('hrms_access_token');
    }
  }

  static getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('hrms_access_token');
    }
    return this.token;
  }

  static async request<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error?.message || 'Request failed');
    }

    return data.data;
  }

  // Work Sessions
  static getCurrentSession() {
    return this.request<{
      hasActiveSession: boolean;
      session: {
        id: string;
        status: 'running' | 'paused' | 'completed';
        startTime: string;
        totalBreakDurationSeconds: number;
      } | null;
      elapsedSeconds: number;
    }>('/work-sessions/current');
  }

  static startSession(notes?: string) {
    return this.request('/work-sessions/start', {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  static pauseSession(sessionId: string, breakType = 'general', reason?: string) {
    return this.request(`/work-sessions/${sessionId}/pause`, {
      method: 'POST',
      body: JSON.stringify({ breakType, reason }),
    });
  }

  static resumeSession(sessionId: string) {
    return this.request(`/work-sessions/${sessionId}/resume`, {
      method: 'POST',
    });
  }

  static endSession(sessionId: string, notes?: string) {
    return this.request(`/work-sessions/${sessionId}/end`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  static getSummary() {
    return this.request<{
      today: {
        trackedSeconds: number;
        breakSeconds: number;
        formattedTracked: string;
      };
    }>('/work-sessions/summary');
  }

  // Leaves
  static getLeaveBalances() {
    return this.request<
      Array<{
        id: string;
        year: string;
        allocatedDays: string;
        usedDays: string;
        pendingDays: string;
        leaveTypeName: string;
        leaveTypeCode: string;
        isPaid: string;
      }>
    >('/leaves/balances');
  }

  // Attendance
  static getMyAttendance() {
    return this.request('/attendance/my');
  }
}
