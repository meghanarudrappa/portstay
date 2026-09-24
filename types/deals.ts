export interface Deal {
  id: string;
  title: string;
  companyName: string;
  phone: string;
  followUpDate?: string;
  callsCount: number;
  videoCallsCount: number;
  mailsCount: number;
  statusTag?: string;
  statusType?: 'viewed' | 'updated';
  starred?: boolean;
  
  // Add missing properties
  status?: string;
  stageLabel?: string;
  stageColor?: string;
  leadId?: string;
  crm_Id?: string;
  crmId?: string;
  name?: string;
  company_Name?: string;
  follow_Date?: string;
  
  date?: string;
  callCount?: number;
  mailCount?: number;
  favourite?: boolean;
  [key: string]: any; // Allows flexible indexing for dynamic API payloads
}

export interface KanbanStage {
  id: string;
  label: string;
  count: number;
  color: string;
  bg: string;
  borderColor: string;
  deals: Deal[];
  
}

export interface CreateDealPayload {
  title?: string;
  firstName: string;
  lastName?: string;
  companyName?: string;
  dealDate: string;
  dealValue?: string;
  email?: string;
  phone?: string;
  summary?: string;
  confirmQuotationConversion?: boolean;
}