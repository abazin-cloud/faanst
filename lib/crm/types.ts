export interface CrmLead {
  id: string;
  firstName?: string;
  lastName: string;
  company: string;
  title?: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  leadSource?: string;
  status?: string;
  rating?: string;
  industry?: string;
  website?: string;
  description?: string;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
  externalUrl?: string;
  raw?: Record<string, any>;
}

export interface CrmLeadFilters {
  limit?: number;
  status?: string | null;
  search?: string | null;
  ownerEmail?: string | null;
}

export interface CrmLeadInput {
  firstName?: string;
  lastName: string;
  company: string;
  title?: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  leadSource?: string;
  status?: string;
  rating?: string;
  industry?: string;
  website?: string;
  description?: string;
}

export interface CrmLeadQueryResult {
  records: CrmLead[];
  totalSize: number;
  done: boolean;
}

export interface CrmLeadAdapter {
  listLeads(filters: CrmLeadFilters): Promise<CrmLeadQueryResult>;
  findLeadByEmail(email: string): Promise<CrmLead | null>;
  findLeadByPhone(phone: string): Promise<CrmLead | null>;
  createLead(input: CrmLeadInput): Promise<CrmLead>;
}
