// import { OverviewMetrics, FormInitData, DocumentTemplate, EmployeeDocument } from '@/types/hrLetter';

// import { API_BASE_URL } from './api'; 

// // Helper function to handle request headers & credentials
// const fetchApi = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
//   const defaultHeaders = {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json',
//   };

//   const config: RequestInit = {
//     ...options,
//     headers: {
//       ...defaultHeaders,
//       ...options.headers,
//     },
//     // Equivalent to withCredentials: true in Axios (passes session cookies)
//     credentials: 'include',
//   };

//   const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

//   if (!response.ok) {
//     const errorText = await response.text();
//     throw new Error(errorText || `HTTP Error ${response.status}`);
//   }

//   return response.json();
// };

// export const hrLetterService = {
//   // GET /my-hr-letters-overview
//   getOverview: async (): Promise<OverviewMetrics> => {
//     return fetchApi<OverviewMetrics>('/my-hr-letters-overview-mobile', {
//       method: 'GET',
//     });
//   },

//   // GET /get-hr-letter-form
//   getFormInitData: async (): Promise<FormInitData> => {
//     return fetchApi<FormInitData>('/get-hr-letter-form-mobile', {
//       method: 'GET',
//     });
//   },

//   // GET /hr-letter-preview?templateId=...&userId=...
//   getLetterPreview: async (templateId: string, userId: string): Promise<DocumentTemplate> => {
//     const params = new URLSearchParams({
//       templateId,
//       userId,
//     });

//     return fetchApi<DocumentTemplate>(`/hr-letter-preview?${params.toString()}`, {
//       method: 'GET',
//     });
//   },

//   // POST /save-hr-letters
//   saveHrLetter: async (payload: Partial<EmployeeDocument>): Promise<EmployeeDocument> => {
//     return fetchApi<EmployeeDocument>('/save-hr-letters-mobile', {
//       method: 'POST',
//       body: JSON.stringify(payload),
//     });
//   },
// };


import { OverviewMetrics, FormInitData, DocumentTemplate, EmployeeDocument } from '@/types/hrLetter';
import { API_BASE_URL } from './api';

// Helper function to handle request headers & credentials safely
const fetchApi = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include',
  };

  // Prevent double slashes when building URL
  const baseUrlClean = API_BASE_URL.replace(/\/+$/, '');
  const endpointClean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrlClean}${endpointClean}`;

  const response = await fetch(fullUrl, config);
  const contentType = response.headers.get('content-type') || '';

  // Handle server errors cleanly without printing raw HTML strings
  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status} (${response.statusText})`;

    if (contentType.includes('application/json')) {
      const errorJson = await response.json();
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } else {
      console.warn(`[API Call Failed] Route "${endpointClean}" returned ${response.status}. Check backend endpoint path.`);
    }

    throw new Error(errorMessage);
  }

  // Ensure response is actually JSON before parsing
  if (!contentType.includes('application/json')) {
    console.warn(`[Invalid Response] Route "${endpointClean}" returned non-JSON content (${contentType}). Check API_BASE_URL.`);
    throw new Error(`Server returned non-JSON response from ${endpointClean}`);
  }

  return response.json();
};

export const hrLetterService = {
  // GET /my-hr-letters-overview-mobile
  getOverview: async (): Promise<OverviewMetrics> => {
    return fetchApi<OverviewMetrics>('/my-hr-letters-overview-mobile', {
      method: 'GET',
    });
  },

  // GET /get-hr-letter-form-mobile
  getFormInitData: async (): Promise<FormInitData> => {
    return fetchApi<FormInitData>('/get-hr-letter-form-mobile', {
      method: 'GET',
    });
  },

  // GET /hr-letter-preview?templateId=...&userId=...
  getLetterPreview: async (templateId: string, userId: string): Promise<DocumentTemplate> => {
    const params = new URLSearchParams({
      templateId,
      userId,
    });

    return fetchApi<DocumentTemplate>(`/hr-letter-preview?${params.toString()}`, {
      method: 'GET',
    });
  },

  // POST /save-hr-letters-mobile
saveHrLetter: async (payload: Partial<EmployeeDocument>): Promise<EmployeeDocument> => {
  const response = await fetchApi<{ success: boolean; message: string; data: EmployeeDocument }>(
    '/save-hr-letters-mobile',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  // Extract the actual EmployeeDocument from response.data
  return response.data;
},
};