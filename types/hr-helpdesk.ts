export interface Ticket {
  id: string;
  ticketId: string;
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  category: string;
  assignee: string | null;
  closeDate: string | null;
  status: 'Open' | 'In Progress' | 'Closed' | 'Pending';
  ticketType?: string;
  raisedBy?: string;
  createdAt?: string;
}

export interface TicketReply {
  id: string;
  senderName: string;
  senderRole: string;
  message: string;
  createdAt: string;
}

export interface CategoryOption {
  id: string;
  label: string;
  value: string;
}

export interface CreateTicketPayload {
  category: string;
  ticketType: string;
  subject: string;
  description: string;
  priority: string;
}