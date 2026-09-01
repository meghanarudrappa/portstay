// import { KanbanStage, CreateLeadPayload } from '@/types/leads';
// import { API_BASE_URL } from './api';

// // Type definition for valid module types
// export type CRMModuleType = 'Leads' | 'Contacts' | 'Accounts' | 'Deals';

// /**
//  * Fetches Kanban board data dynamically based on the CRM module type.
//  */
// export const fetchKanbanData = async (type: CRMModuleType = 'Leads'): Promise<any[]> => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/mobile-crm-list-${type}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const resData = await response.json();

//     // Check response structure dynamically
//     if (Array.isArray(resData)) {
//       return resData;
//     } else if (Array.isArray(resData.crmList)) {
//       return resData.crmList;
//     } else if (Array.isArray(resData.tagList)) {
//       return resData.tagList;
//     } else if (Array.isArray(resData.data)) {
//       return resData.data;
//     }

//     return [];
//   } catch (error) {
//     console.error(`Error fetching Kanban data for ${type}:`, error);
//     throw error;
//   }
// };

// /**
//  * Submits form data to create a new record/lead in the CRM backend.
//  */
// // Expanded type to support payload generic creation across modules
// export const createCRMItem = async (payload: Record<string, any>): Promise<boolean> => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/crmform`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(payload), // Send payload with 'type': 'Accounts' | 'Contacts' | 'Deals' | 'Leads'
//     });

//     return response.ok;
//   } catch (error) {
//     console.error('Error creating CRM item:', error);
//     return false;
//   }
// };

// // Kept as an alias so existing lead form code doesn't break
// export const createLead = createCRMItem;


import { API_BASE_URL } from './api';

export type CRMModuleType = 'Leads' | 'Contacts' | 'Accounts' | 'Deals';

export type AccountStatus = 'New' | 'Active' | 'Not Active';

export interface AccountItem {
  id: string;
  name: string;
  avatarText: string;
  avatarBg: string;
  subtitle: string;
  phone: string;
  contactName: string;
  followDate: string;
  status: AccountStatus;
}

export interface AccountTemplate {
  id: string;
  initials: string;
  title: string;
  email: string;
  sub: string;
}

export interface CreateAccountPayload {
  company_Name: string;
  title?: string;
  firstName: string;
  lastName?: string;
  owner?: string;
  annualRevenue?: string;
  email: string;
  mobileNo?: string;
  description?: string;
  type: CRMModuleType;
}

/**
 * Helper mapping utilities
 */
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

export function mapStatus(raw: string): AccountStatus {
  if (!raw) return 'New';
  const lower = raw.toLowerCase();
  if (lower.includes('not')) return 'Not Active';
  if (lower.includes('active')) return 'Active';
  return 'New';
}

/**
 * Fetches Kanban board data dynamically based on the CRM module type.
 */
export const fetchKanbanData = async (type: CRMModuleType = 'Leads'): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/mobile-crm-list-${type}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const resData = await response.json();

    if (Array.isArray(resData)) {
      return resData;
    } else if (Array.isArray(resData.crmList)) {
      return resData.crmList;
    } else if (Array.isArray(resData.tagList)) {
      return resData.tagList;
    } else if (Array.isArray(resData.data)) {
      return resData.data;
    }

    return [];
  } catch (error) {
    console.error(`Error fetching Kanban data for ${type}:`, error);
    throw error;
  }
};

/**
 * Fetches Accounts transformed into AccountItem structure.
 */
export const fetchAccounts = async (): Promise<AccountItem[]> => {
  const rawList = await fetchKanbanData('Accounts');
  return rawList.map((item: any, idx: number) => ({
    id: item.crm_Id || String(idx),
    name: item.company_Name || item.name || 'Unnamed Account',
    avatarText: getInitials(item.companyName || item.name || ''),
    avatarBg: getAvatarColor(idx),
    subtitle: item.viewedTime ? `Viewed · ${item.viewedTime}` : `Created · ${item.date || item.follow_Date || item.followUpDate || 'Recently'}`,
    phone: item.mobileNo || item.phone || '--',
    contactName: item.contact_Person || item.attendedByName || '--',
    followDate: item.follow_Date || item.followUpDate || '--',
    status: mapStatus(item.status),
  }));
};

/**
 * Fetches Account templates dynamically from backend.
 */
export const fetchAccountTemplates = async (): Promise<AccountTemplate[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/crm-account-templates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data.templates) ? data.templates : [];
  } catch (error) {
    console.error('Error fetching account templates:', error);
    return [];
  }
};

/**
 * Submits form data to create a new record/lead in the CRM backend.
 */
export const createCRMItem = async (payload: Record<string, any>): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/crmform`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (error) {
    console.error('Error creating CRM item:', error);
    return false;
  }
};

export const createLead = createCRMItem;