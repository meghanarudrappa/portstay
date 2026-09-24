// // import { API_BASE_URL } from '@/app/config/api';

// // export type CRMModuleType = 'Leads' | 'Contacts' | 'Accounts' | 'Deals';
// // export type AccountStatus = 'New' | 'Active' | 'Not Active' | 'Prospect';

// // export interface AccountItem {
// //   id: string;
// //   name: string;
// //   avatarText: string;
// //   avatarBg: string;
// //   subtitle: string;
// //   phone: string;
// //   contactName: string;
// //   follow_Date: string;
// //   status: AccountStatus;
// // }

// // export interface AccountTemplate {
// //   id: string;
// //   initials: string;
// //   title: string;
// //   email: string;
// //   sub: string;
// // }

// // export interface CRMItemPayload {
// //   type: CRMModuleType | string;
// //   company_Name?: string;
// //   title?: string;
// //   firstName?: string;
// //   lastName?: string;
// //   contact_Person?: string;
// //   owner?: string;
// //   annualRevenue?: string;
// //   email?: string;
// //   phone?: string;
// //   summary?: string;
// //   [key: string]: any;
// // }

// // export function getInitials(name: string): string {
// //   if (!name) return 'AC';
// //   const parts = name.trim().split(' ');
// //   if (parts.length >= 2) {
// //     return (parts[0][0] + parts[1][0]).toUpperCase();
// //   }
// //   return name.substring(0, 2).toUpperCase();
// // }

// // export function getAvatarColor(index: number): string {
// //   const colors = ['#e6f7ff', '#e6ffe6', '#fff0f6', '#f9f0ff', '#fffbe6'];
// //   return colors[index % colors.length];
// // }

// // export function mapStatus(raw: string): AccountStatus {
// //   if (!raw) return 'New';
// //   const lower = raw.toLowerCase();
// //   if (lower.includes('not')) return 'Not Active';
// //   if (lower.includes('active')) return 'Active';
// //   if (lower.includes('prospect')) return 'Prospect';
// //   return 'New';
// // }

// // export const fetchKanbanData = async (type: CRMModuleType = 'Leads'): Promise<any[]> => {
// //   try {
// //     const response = await fetch(`${API_BASE_URL}/mobile-crm-list-${type}`, {
// //       method: 'GET',
// //       headers: { 'Content-Type': 'application/json' },
// //     });

// //     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

// //     const resData = await response.json();
// //     if (Array.isArray(resData)) return resData;
// //     if (Array.isArray(resData.crmList)) return resData.crmList;
// //     if (Array.isArray(resData.tagList)) return resData.tagList;
// //     if (Array.isArray(resData.data)) return resData.data;

// //     return [];
// //   } catch (error) {
// //     console.error(`Error fetching Kanban data for ${type}:`, error);
// //     throw error;
// //   }
// // };


// // export const fetchAccounts = async (): Promise<AccountItem[]> => {
// //   const rawList = await fetchKanbanData('Accounts');
// //   console.log("rawList",rawList);
// //   return rawList.map((item: any, idx: number) => ({
// //     id: item.crm_Id || item.id || String(idx),
// //     name: item.company_Name || item.name || 'Unnamed Account',
// //     avatarText: getInitials(item.company_Name || item.name || ''),
// //     avatarBg: getAvatarColor(idx),
// //     subtitle: item.viewedTime
// //       ? `Viewed · ${item.viewedTime}`
// //       : `Created · ${item.date||'Recently'}`,
// //     phone: item.phone || '--',
// //    contactName: item.contact_Person || `${item.firstName || ''} ${item.lastName || ''}`.trim() || '--',
    
// //     follow_Date: item.follow_Date || '--',
// //     status: mapStatus(item.status),
// //   }));
// // };

// // export const fetchAccountTemplates = async (): Promise<AccountTemplate[]> => {
// //   try {
// //     const response = await fetch(`${API_BASE_URL}/crm-account-templates`, {
// //       method: 'GET',
// //       headers: { 'Content-Type': 'application/json' },
// //     });

// //     if (!response.ok) return [];
// //     const data = await response.json();
// //     return Array.isArray(data.templates) ? data.templates : [];
// //   } catch (error) {
// //     console.error('Error fetching account templates:', error);
// //     return [];
// //   }
// // };

// // /**
// //  * Submits account form data to /add-crm-bulk-mobile endpoint
// //  */
// // // export const createCRMItem = async (payload: CRMItemPayload): Promise<boolean> => {
// // //   try {
// // //     const response = await fetch(`${API_BASE_URL}/add-crm-bulk-mobile`, {
// // //       method: 'POST',
// // //       headers: { 'Content-Type': 'application/json' },
// // //       body: JSON.stringify(payload),
// // //     });
// // //     console.log(payload);

// // //     return response.ok;
// // //   } catch (error) {
// // //     console.error('Error creating CRM item:', error);
// // //     return false;
// // //   }
// // // };

// // export const createCRMItem = async (payload: any) => {
// //   console.log('[DEBUG] Sending Payload:', JSON.stringify(payload, null, 2));

// //   try {
// //     const response = await fetch(`${API_BASE_URL}/add-crm-bulk-mobile`,
// //        {
// //       method: 'POST',
// //       headers: { 'Content-Type': 'application/json' },
// //       body: JSON.stringify(payload),
// //     });
    

// //     const result = await response.json();
// //     console.log('[DEBUG] Server HTTP Status:', response.status);
// //     console.log('[DEBUG] Server Raw Response:', result);

// //     // Verify if backend returned a valid record ID
// //     const hasSavedId = result?.id || result?.crm_Id || result?.data?.id || result?.data?.crmList;

// //     if (!response.ok || !hasSavedId) {
// //       console.error('[DEBUG] Database insert failed! Server response missing ID:', result);
// //       return false; // Tells the UI that backend failed to persist the row
// //     }

// //     return result.data || result;
// //   } catch (error) {
// //     console.error('[DEBUG] Network Request Failed:', error);
// //     return false;
// //   }
// // };

// // export const createLead = createCRMItem;

// import { API_BASE_URL } from '@/app/config/api';

// export type CRMModuleType = 'Leads' | 'Contacts' | 'Accounts' | 'Deals';
// export type AccountStatus = 'New' | 'Active' | 'Not Active' | 'Prospect';

// export interface AccountItem {
//   id: string;
//   name: string;
//   avatarText: string;
//   avatarBg: string;
//   subtitle: string;
//   phone: string;
//   contactName: string;
//   follow_Date: string;
//   status: AccountStatus;
// }

// export interface CRMItemPayload {
//   type: CRMModuleType | string;
//   company_Name?: string;
//   title?: string;
//   firstName?: string;
//   lastName?: string;
//   contact_Person?: string;
//   owner?: string;
//   annualRevenue?: string;
//   email?: string;
//   phone?: string;
//   summary?: string;
//   [key: string]: any;
// }

// export function getInitials(name: string): string {
//   if (!name) return 'AC';
//   const parts = name.trim().split(' ');
//   if (parts.length >= 2) {
//     return (parts[0][0] + parts[1][0]).toUpperCase();
//   }
//   return name.substring(0, 2).toUpperCase();
// }

// export function getAvatarColor(index: number): string {
//   const colors = ['#e6f7ff', '#e6ffe6', '#fff0f6', '#f9f0ff', '#fffbe6'];
//   return colors[index % colors.length];
// }

// export function mapStatus(raw: string): AccountStatus {
//   if (!raw) return 'New';
//   const lower = raw.toLowerCase();
//   if (lower.includes('not')) return 'Not Active';
//   if (lower.includes('active')) return 'Active';
//   if (lower.includes('prospect')) return 'Prospect';
//   return 'New';
// }

// export const fetchKanbanData = async (type: CRMModuleType = 'Leads'): Promise<any[]> => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/mobile-crm-list-${type}`, {
//       method: 'GET',
//       headers: { 'Content-Type': 'application/json' },
//     });

//     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

//     const resData = await response.json();
//     if (Array.isArray(resData)) return resData;
//     if (Array.isArray(resData.crmList)) return resData.crmList;
//     if (Array.isArray(resData.tagList)) return resData.tagList;
//     if (Array.isArray(resData.data)) return resData.data;

//     return [];
//   } catch (error) {
//     console.error(`Error fetching Kanban data for ${type}:`, error);
//     throw error;
//   }
// };

// export const fetchAccounts = async (): Promise<AccountItem[]> => {
//   const rawList = await fetchKanbanData('Accounts');
//   return rawList.map((item: any, idx: number) => {
//     const companyName = item.company_Name || item.name || 'Unnamed Account';
//     const formattedSubtitle = item.date
//       ? `Created · ${item.date}`
//       : item.crmNumber
//       ? `Created · ${item.crmNumber}`
//       : 'Recently';
     

//     return {
//       id: item.id || item.crm_Id || String(idx),
//       name: companyName,
//       avatarText: getInitials(companyName),
//       avatarBg: getAvatarColor(idx),
//       subtitle: formattedSubtitle,
//       phone: item.phone || item.mobileNo || '--',
//       contactName:
//         item.contact_Person ||
//         `${item.firstName || ''} ${item.lastName || ''}`.trim() ||
//         '--',
//       follow_Date: item.follow_Date || item.date || '--',
//       status: mapStatus(item.status),
//     };
//   });
// };

// export const createCRMItem = async (payload: any) => {
//   console.log('[DEBUG] Sending Payload:', JSON.stringify(payload, null, 2));

//   try {
//     const response = await fetch(`${API_BASE_URL}/add-crm-bulk-mobile`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload),
//     });

//     const result = await response.json();
//     console.log('[DEBUG] Server Raw Response:', result);

//     if (!response.ok) {
//       console.error('[DEBUG] HTTP Error Status:', response.status);
//       return false;
//     }

//     return result?.id ? result : result?.data || result;
//   } catch (error) {
//     console.error('[DEBUG] Network Request Failed:', error);
//     return false;
//   }
// };
import { API_BASE_URL } from '@/app/config/api';

export type CRMModuleType = 'Leads' | 'Contacts' | 'Accounts' | 'Deals';
export type AccountStatus = 'New' | 'Active' | 'Not Active' | 'Prospect';

export interface AccountItem {
  id: string;
  name: string;
  avatarText: string;
  avatarBg: string;
  subtitle: string;
  phone: string;
  contactName: string;
  follow_Date: string;
  status: AccountStatus;
  company_Name?: string;
}

export interface CRMItemPayload {
  type: CRMModuleType | string;
  company_Name?: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  contact_Person?: string;
  owner?: string;
  annualRevenue?: number | string;
  email?: string;
  phone?: string;
  summary?: string;
  [key: string]: any;
}

export function getInitials(name: string): string {
  if (!name) return 'AC';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function getAvatarColor(index: number): string {
  const colors = ['#e6f7ff', '#e6ffe6', '#fff0f6', '#f9f0ff', '#fffbe6'];
  return colors[index % colors.length];
}

export function mapStatus(raw?: string): AccountStatus {
  if (!raw) return 'New';
  const lower = raw.toLowerCase();
  if (lower.includes('not')) return 'Not Active';
  if (lower.includes('active')) return 'Active';
  if (lower.includes('prospect')) return 'Prospect';
  return 'New';
}

export const fetchKanbanData = async (type: CRMModuleType = 'Leads'): Promise<any[]> => {
  try {
    // Try both lower-case and standard endpoint paths depending on backend router rules
    const response = await fetch(`${API_BASE_URL}/mobile-crm-list-${type}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.warn(`[WARN] Endpoint /mobile-crm-list-${type} failed with status ${response.status}`);
      return [];
    }

    const resData = await response.json();
    console.log(`[DEBUG] Raw response for ${type}:`, resData);

    if (Array.isArray(resData)) return resData;
    if (Array.isArray(resData.crmList)) return resData.crmList;
    if (Array.isArray(resData.tagList)) return resData.tagList;
    if (Array.isArray(resData.data)) return resData.data;

    return [];
  } catch (error) {
    console.error(`[ERROR] Fetching Kanban data for ${type}:`, error);
    return [];
  }
};

export const fetchAccounts = async (): Promise<AccountItem[]> => {
  const rawList = await fetchKanbanData('Accounts');
  
  if (!Array.isArray(rawList)) {
    console.error('[ERROR] Raw account list is not an array:', rawList);
    return [];
  }

  return rawList.map((item: any, idx: number) => {
    const companyName = item.company_Name || item.name || item.companyName || 'Unnamed Account';
    const formattedSubtitle = item.date
      ? `Created · ${item.date}`
      : item.crmNumber
      ? `Created · ${item.crmNumber}`
      : 'Recently';

    return {
      id: String(item.id || item.crm_Id || item._id || idx),
      name: companyName,
      avatarText: getInitials(companyName),
      avatarBg: getAvatarColor(idx),
      subtitle: item.follow_Date || '--',
      phone: item.phone || item.mobileNo || '--',
      contactName:
        item.contact_Person ||
        `${item.firstName || ''} ${item.lastName || ''}`.trim() ||
        '--',
      follow_Date: item.follow_Date || '--',
      status: mapStatus(item.status),
    };
  });
};

export const createCRMItem = async (payload: CRMItemPayload) => {
  console.log('[DEBUG] Outgoing Request Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(`${API_BASE_URL}/add-crm-bulk-mobile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log('[DEBUG] Server HTTP Response Code:', response.status);
    console.log('[DEBUG] Server Decoded Body:', result);

    if (!response.ok) {
      console.error('[ERROR] Server responded with error status:', response.status);
      return false;
    }

    // Extract created item based on common API wrapper shapes
    return result?.data || result?.crmList?.[0] || result?.item || result;
  } catch (error) {
    console.error('[CRITICAL] Network Request Failed:', error);
    return false;
  }
};

export const createLead = createCRMItem;