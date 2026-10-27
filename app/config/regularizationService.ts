import { API_BASE_URL } from './api';

export interface RegularizationItem {
  id: string | number;
  employeeName: string;
  avatarText?: string;
  date: string;
  dayOfWeek: string;
  checkIn: string;
  checkOut: string;
  workHours: string;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected' | 'Cancelled';
}

export interface SummaryMetrics {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  cancelled: number;
}

export interface RegularizationListResponse {
  startDate?: string;
  endDate?: string;
  dateRange?: string;
  dateRangeLabel?: string;
  metrics: SummaryMetrics;
  requests: RegularizationItem[];
}

// Helper to map backend MongoDB documents to UI models
// const mapOffRequestsToItems = (offRequests: any[]): RegularizationItem[] => {
//   if (offRequests && offRequests.length > 0) {
//     console.log('--- [RAW BACKEND ITEM KEYS] ---');
//     console.log(JSON.stringify(offRequests[0], null, 2));
//   }
//   return (offRequests || []).map((doc: any, index: number) => ({
//     id: doc._id || doc.id || index,
//     employeeName: doc.userName || doc.employeeName || 'Employee',
//     avatarText: doc.userName ? doc.userName.substring(0, 2).toUpperCase() : 'EM',
//     date: doc.startDate || doc.createdDate || doc.date || 'N/A',
//     dayOfWeek: doc.dayOfWeek || '',
//     checkIn: doc.checkIn_Time || doc.checkIn || '--:--',
//     checkOut: doc.checkOut_Time || doc.checkOut || '--:--',
//     workHours: doc.totalHours || doc.workHours || '0h 0m',
//     reason: doc.reason || doc.description || 'No reason provided',
//     status: doc.status || 'Pending',
//   }));
// };
const mapOffRequestsToItems = (offRequests: any[]): RegularizationItem[] => {
  return (offRequests || []).map((doc: any, index: number) => {
    // 1. Employee Name
    const rawName = doc.name || doc.userName || doc.employeeName || 'Employee';
    
    // Capitalize Name properly (e.g., "don bosko" -> "Don Bosko")
    const employeeName = rawName
      .split(' ')
      .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    // 2. Avatar Text
    const avatarText = employeeName !== 'Employee'
      ? employeeName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
      : 'EM';

    // 3. Date
    const date = doc.checkin_date || doc.date || doc.startDate || 'N/A';

    // 4. Check-In Time
    const checkIn = doc.checkin_time || doc.checkInTime || doc.checkIn || '--:--';

    // 5. Check-Out Time
    const checkOut = doc.checkout_time || doc.checkOutTime || doc.checkOut || '--:--';

    // 6. Work Hours
    const workHours = doc.reg_hours?.trim() || doc.totalHours || '0h 0m';

    // 7. Reason
    const reason = doc.reason || doc.description || 'No reason provided';

    // 8. Status (Capitalized e.g. "pending" -> "Pending")
    const rawStatus = doc.status || 'Pending';
    const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

    return {
      id: doc.id || doc._id || index,
      employeeName,
      avatarText,
      date,
      dayOfWeek: doc.dayOfWeek || '',
      checkIn,
      checkOut,
      workHours,
      reason,
      status,
    };
  });
};

// Helper to derive metrics from requests array
const calculateMetrics = (requests: RegularizationItem[]): SummaryMetrics => ({
  total: requests.length,
  approved: requests.filter((r) => r.status?.toLowerCase() === 'approved').length,
  pending: requests.filter((r) => r.status?.toLowerCase() === 'pending').length,
  rejected: requests.filter((r) => r.status?.toLowerCase() === 'rejected').length,
  cancelled: requests.filter((r) => r.status?.toLowerCase() === 'cancelled').length,
});

// Helper function to format 12-hour "06:30 PM" to 24-hour "18:30"
const formatTo24Hour = (timeStr: string): string => {
  if (!timeStr) return '';
  const cleaned = timeStr.trim();
  if (!cleaned.includes('AM') && !cleaned.includes('PM')) return cleaned;

  const [time, modifier] = cleaned.split(' ');
  let [hours, minutes] = time.split(':');

  if (hours === '12') hours = '00';
  if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12);

  return `${hours.padStart(2, '0')}:${minutes}`;
};

export const regularizationService = {
  // Existing default list API
  getRegularizationList: async (): Promise<RegularizationListResponse> => {
    const response = await fetch(`${API_BASE_URL}/get-attendance-regular-list-mobile`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(errorMsg || `Error: ${response.statusText}`);
    }

    const rawData = await response.json();
    const requests = mapOffRequestsToItems(rawData.offRequests);

    return {
      dateRange: rawData.dateRange,
      dateRangeLabel: rawData.dateRangeLabel,
      metrics: calculateMetrics(requests),
      requests,
    };
  },

  // NEW: Date-wise filtered list API
  getRegularizationListByDateRange: async (
    startDate: string,
    endDate: string
  ): Promise<RegularizationListResponse> => {
    const queryParams = new URLSearchParams({ startDate, endDate }).toString();
    const url = `${API_BASE_URL}/get-attendance-regular-list-date-wise-mobile?${queryParams}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Error ${response.status}: Failed to fetch date-wise list`);
    }

    const rawData = await response.json();
    const requests = mapOffRequestsToItems(rawData.offRequests);

    return {
      startDate: rawData.startDate,
      endDate: rawData.endDate,
      dateRange: rawData.dateRange,
      dateRangeLabel: rawData.dateRangeLabel,
      metrics: calculateMetrics(requests),
      requests,
    };
  },

  getFormInitData: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/attend-reqularize-form-mobile`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Form init error: ${response.statusText}`);
    return await response.json();
  },


// addRegularization: async (payload: {
//   checkInDate: string;
//   checkInTime: string;
//   checkOutDate: string;
//   checkOutTime: string;
//   reason: string;
// }): Promise<any> => {

//   const endpoint = `${API_BASE_URL}/add-attendance-regularization-mobile`;

//   // JSON matching TimeCalendar fields
//   const bodyData = {
//     from_Follow_Date: payload.checkInDate,
//     checkIn_time: payload.checkInTime,
//     to_Follow_Date: payload.checkOutDate,
//     checkOut_time: payload.checkOutTime,
//     description: payload.reason,
//   };

//   console.log('[DEBUG] Posting to:', endpoint);
//   console.log('[DEBUG] Request Body:', JSON.stringify(bodyData));

//   const response = await fetch(endpoint, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Accept': 'application/json',
//     },
//     body: JSON.stringify(bodyData),
//   });

//   const responseText = await response.text();

//   console.log('[DEBUG] Raw Server Response:', responseText);

//   if (!response.ok) {
//     throw new Error(
//       responseText || `Server returned ${response.status}`
//     );
//   }

//   // Handle empty response safely
//   if (!responseText) {
//     return null;
//   }

//   try {
//     return JSON.parse(responseText);
//   } catch {
//     return responseText;
//   }
// },
addRegularization: async (payload: {
    checkInDate: string;
    checkInTime: string;
    checkOutDate: string;
    checkOutTime: string;
    reason: string;
    userId?: string;
    orgId?: string;
    teamId?: string;
    name?: string;
    userName?: string;
  }): Promise<any> => {
    const endpoint = `${API_BASE_URL}/add-attendance-regularization-mobile`;

    const checkIn24 = formatTo24Hour(payload.checkInTime);
    const checkOut24 = formatTo24Hour(payload.checkOutTime);

    const userIdVal = payload.userId || '324cd609-926f-42d0-badd-110339db5e4e';
    const orgIdVal = payload.orgId || '0bb2e9c7-1a17-4941-ab93-c938125c8d96';

    const bodyData = {
      userId: userIdVal,
      loginId: userIdVal,
      empId: userIdVal,
      orgId: orgIdVal,
      teamId: payload.teamId || '28a37fd1-1464-472b-b7bf-926f82e8fc8c954',
      name: payload.name || 'Don Bosko',
      userName: payload.userName || 'hr@hdfc.com',
      workingUserName: payload.userName || 'hr@hdfc.com',
      role: 'Employee',
      status: 'pending',

      checkInDate: payload.checkInDate,
      checkOutDate: payload.checkOutDate,
      checkInTime: checkIn24,
      checkOutTime: checkOut24,
      reason: payload.reason,
      description: payload.reason,

      checkin_date: payload.checkInDate,
      checkout_date: payload.checkOutDate,
      checkin_time: checkIn24,
      checkout_time: checkOut24,
      checkIn_time: checkIn24,
      checkOut_time: checkOut24,
      from_Follow_Date: payload.checkInDate,
      to_Follow_Date: payload.checkOutDate,
      fromFollowDate: payload.checkInDate,
      toFollowDate: payload.checkOutDate,
    };

    console.log('---------------- [DEBUG START] ----------------');
    console.log('[1] Target Endpoint:', endpoint);
    console.log('[2] Sent JSON Body:', JSON.stringify(bodyData, null, 2));

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(bodyData),
    });

    console.log('[3] HTTP Status Code:', response.status, response.statusText);

    const rawText = await response.text();
    console.log('[4] Raw Response Body:', rawText);
    console.log('----------------- [DEBUG END] -----------------');

    if (!response.ok) {
      throw new Error(rawText || `[HTTP ${response.status}] Submission failed`);
    }

    try {
      return JSON.parse(rawText);
    } catch {
      return { success: true, text: rawText };
    }
  },
};