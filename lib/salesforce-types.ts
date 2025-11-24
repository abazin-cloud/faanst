/**
 * TypeScript types for Salesforce objects
 */

export interface SalesforceLead {
  Id?: string;
  FirstName?: string;
  LastName: string;
  Company: string;
  Title?: string;
  Email?: string;
  Phone?: string;
  MobilePhone?: string;
  Street?: string;
  City?: string;
  State?: string;
  PostalCode?: string;
  Country?: string;
  Website?: string;
  LeadSource?: string;
  Status?: string;
  Rating?: string;
  Industry?: string;
  NumberOfEmployees?: number;
  AnnualRevenue?: number;
  Description?: string;
  CreatedDate?: string;
  LastModifiedDate?: string;
}

export interface SalesforceAccount {
  Id?: string;
  Name: string;
  Type?: string;
  ParentId?: string;
  BillingStreet?: string;
  BillingCity?: string;
  BillingState?: string;
  BillingPostalCode?: string;
  BillingCountry?: string;
  Phone?: string;
  Fax?: string;
  Website?: string;
  Industry?: string;
  AnnualRevenue?: number;
  NumberOfEmployees?: number;
  Description?: string;
  CreatedDate?: string;
  LastModifiedDate?: string;
}

export interface SalesforceContact {
  Id?: string;
  FirstName?: string;
  LastName: string;
  AccountId?: string;
  Title?: string;
  Email?: string;
  Phone?: string;
  MobilePhone?: string;
  MailingStreet?: string;
  MailingCity?: string;
  MailingState?: string;
  MailingPostalCode?: string;
  MailingCountry?: string;
  Department?: string;
  Birthdate?: string;
  Description?: string;
  CreatedDate?: string;
  LastModifiedDate?: string;
}

export interface SalesforceOpportunity {
  Id?: string;
  Name: string;
  AccountId?: string;
  StageName: string;
  CloseDate: string;
  Amount?: number;
  Probability?: number;
  Type?: string;
  LeadSource?: string;
  Description?: string;
  NextStep?: string;
  IsClosed?: boolean;
  IsWon?: boolean;
  CreatedDate?: string;
  LastModifiedDate?: string;
}

export interface SalesforceTask {
  Id?: string;
  Subject: string;
  WhoId?: string;
  WhatId?: string;
  ActivityDate?: string;
  Status?: string;
  Priority?: string;
  Description?: string;
  CreatedDate?: string;
  LastModifiedDate?: string;
}

export interface SalesforceEvent {
  Id?: string;
  Subject: string;
  WhoId?: string;
  WhatId?: string;
  StartDateTime: string;
  EndDateTime: string;
  Location?: string;
  Description?: string;
  IsAllDayEvent?: boolean;
  CreatedDate?: string;
  LastModifiedDate?: string;
}














