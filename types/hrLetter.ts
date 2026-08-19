export interface NormalUser {
  id: string;
  name: string;
  designation?: string;
  doj?: string;
  aboutTeam?: string;
  annualCtc?: string;
}

export interface EmployeeDocument {
  id: string;
  orgId: string;
  userId: string;
  employeeName?: string;
  designation?: string;
  letterType: string;
  subject: string;
  status: 'Approved' | 'Pending Approval' | 'Draft' | 'Rejected';
  createdAt: string | number;
  updatedAt?: string | number;
  templateContent?: string;
  company_name?:string;
   department?:string;
   location?:string;
   joiningDate?:Date;
   ctc?:number;
}

export interface DocumentTemplate {
  id?: string;
  orgId?: string;
  templateName?: string;
  letterType?: string;
  category?: string;
  subject?: string;
  templateContent: string;
  status?: string;
  company_name?:string;
 

}

export interface OverviewMetrics {
  totalLetters: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  draftCount: number;
  hrLetters: EmployeeDocument[];
}

export interface FormInitData {
  users: NormalUser[];
  loggedUser: NormalUser;
  templates?: DocumentTemplate[]; // Add this property
  statuses?: string[];            // Add this if statuses are also returned dynamically
}