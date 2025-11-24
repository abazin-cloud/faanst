import { SalesforceLeadAdapter } from './adapters/salesforce-leads';
import { CrmLeadAdapter } from './types';

let cachedAdapter: CrmLeadAdapter | null = null;

export function getCrmLeadAdapter(): CrmLeadAdapter {
  if (!cachedAdapter) {
    cachedAdapter = new SalesforceLeadAdapter();
  }

  return cachedAdapter;
}

export * from './types';
