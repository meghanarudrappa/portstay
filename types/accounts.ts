export type AccountStatus = 'New' | 'Active' | 'Not Active';

export interface AccountItem {
  id: string;
  name: string;
  company_Name: string;
  phone: string;
  contactName: string;
  followDate: string;
  status: AccountStatus;
  avatarText?: string;
  avatarBg?: string;
  subtitle?: string;
  email?: string;
  owner?: string;
  annualRevenue?: string;
  description?: string;
  starred?: boolean;

  // Flexible API fallbacks for dynamic responses
  accountId?: string;
  crm_Id?: string;
  crmId?: string;
  companyName?: string;
  accountName?: string;
  account_name?: string;
  mobileNo?: string;
  mobile_no?: string;
  contactPerson?: string;
  contact_person?: string;
  attendedByName?: string;
  followUpDate?: string;
  follow_up_date?: string;
  follow_Date?: string;
  viewedTime?: string;
  createDate?: string;
  created_at?: string;
  [key: string]: any; // Flexible indexing for dynamic backend structures
}

export interface AccountTemplate {
  id: string;
  initials: string;
  title: string;
  email: string;
  sub: string;
}

export interface KanbanAccountStage {
  id: string;
  label: string;
  count: number;
  color: string;
  bg: string;
  borderColor: string;
  accounts: AccountItem[];
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
  summary?: string;
  type: 'Accounts';
  [key: string]: any;
}