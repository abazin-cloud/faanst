/**
 * Salesforce REST API Helper
 * 
 * Server-side only module for interacting with Salesforce REST API
 * Uses OAuth 2.0 Username-Password flow or Refresh Token flow
 */

import 'server-only';

// Salesforce API version
const SF_API_VERSION = 'v61.0';

// Cached access token and instance URL
let cachedAccessToken: string | null = null;
let cachedInstanceUrl: string | null = null;
let tokenExpiresAt: number | null = null;

/**
 * Salesforce OAuth token response
 */
interface SalesforceTokenResponse {
  access_token: string;
  instance_url: string;
  id: string;
  token_type: string;
  issued_at: string;
  signature: string;
}

/**
 * Get environment variables with validation
 */
function getEnvVars() {
  const SF_LOGIN_URL = process.env.SF_LOGIN_URL;
  const SF_CLIENT_ID = process.env.SF_CLIENT_ID;
  const SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
  const SF_USERNAME = process.env.SF_USERNAME;
  const SF_PASSWORD = process.env.SF_PASSWORD;
  const SF_SECURITY_TOKEN = process.env.SF_SECURITY_TOKEN;
  const SF_REFRESH_TOKEN = process.env.SF_REFRESH_TOKEN;

  if (!SF_LOGIN_URL) {
    throw new Error('SF_LOGIN_URL environment variable is required');
  }

  if (!SF_CLIENT_ID || !SF_CLIENT_SECRET) {
    throw new Error('SF_CLIENT_ID and SF_CLIENT_SECRET are required');
  }

  return {
    SF_LOGIN_URL,
    SF_CLIENT_ID,
    SF_CLIENT_SECRET,
    SF_USERNAME,
    SF_PASSWORD,
    SF_SECURITY_TOKEN,
    SF_REFRESH_TOKEN
  };
}

/**
 * Get access token using Username-Password flow
 */
async function getTokenWithPassword(): Promise<SalesforceTokenResponse> {
  const env = getEnvVars();

  if (!env.SF_USERNAME || !env.SF_PASSWORD) {
    throw new Error('SF_USERNAME and SF_PASSWORD are required for password flow');
  }

  const params = new URLSearchParams({
    grant_type: 'password',
    client_id: env.SF_CLIENT_ID,
    client_secret: env.SF_CLIENT_SECRET,
    username: env.SF_USERNAME,
    password: env.SF_PASSWORD + (env.SF_SECURITY_TOKEN || '')
  });

  const response = await fetch(`${env.SF_LOGIN_URL}/services/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Salesforce authentication failed: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Get access token using Refresh Token flow
 */
async function getTokenWithRefreshToken(): Promise<SalesforceTokenResponse> {
  const env = getEnvVars();

  if (!env.SF_REFRESH_TOKEN) {
    throw new Error('SF_REFRESH_TOKEN is required for refresh token flow');
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: env.SF_CLIENT_ID,
    client_secret: env.SF_CLIENT_SECRET,
    refresh_token: env.SF_REFRESH_TOKEN
  });

  const response = await fetch(`${env.SF_LOGIN_URL}/services/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Salesforce token refresh failed: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Get a valid access token (with caching and auto-refresh)
 */
async function getAccessToken(): Promise<{ accessToken: string; instanceUrl: string }> {
  // Check if we have a valid cached token (expires in 2 hours by default, we refresh after 1.5 hours)
  const now = Date.now();
  if (cachedAccessToken && cachedInstanceUrl && tokenExpiresAt && now < tokenExpiresAt) {
    return {
      accessToken: cachedAccessToken,
      instanceUrl: cachedInstanceUrl
    };
  }

  // Try refresh token flow first if available, otherwise use password flow
  const env = getEnvVars();
  let tokenResponse: SalesforceTokenResponse;

  try {
    if (env.SF_REFRESH_TOKEN) {
      tokenResponse = await getTokenWithRefreshToken();
    } else {
      tokenResponse = await getTokenWithPassword();
    }
  } catch (error) {
    // If refresh token fails, try password flow as fallback
    if (env.SF_REFRESH_TOKEN && env.SF_USERNAME && env.SF_PASSWORD) {
      console.warn('Refresh token failed, falling back to password flow');
      tokenResponse = await getTokenWithPassword();
    } else {
      throw error;
    }
  }

  // Cache the token (expires in 1.5 hours = 5400 seconds)
  cachedAccessToken = tokenResponse.access_token;
  cachedInstanceUrl = tokenResponse.instance_url;
  tokenExpiresAt = now + (5400 * 1000);

  return {
    accessToken: cachedAccessToken,
    instanceUrl: cachedInstanceUrl
  };
}

/**
 * Generic Salesforce REST API request
 * 
 * @param path - API path (e.g., '/services/data/v61.0/query')
 * @param options - Fetch options
 * @returns Response data
 */
export async function salesforceRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { accessToken, instanceUrl } = await getAccessToken();

  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${instanceUrl}${normalizedPath}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Salesforce API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Execute a SOQL query
 * 
 * @param soql - SOQL query string
 * @returns Query results
 */
export async function querySalesforce<T = any>(soql: string): Promise<{
  totalSize: number;
  done: boolean;
  records: T[];
}> {
  const encodedQuery = encodeURIComponent(soql);
  return salesforceRequest(`/services/data/${SF_API_VERSION}/query?q=${encodedQuery}`);
}

/**
 * Create a record in Salesforce
 * 
 * @param objectName - Salesforce object name (e.g., 'Lead', 'Account')
 * @param data - Record data
 * @returns Created record info with ID
 */
export async function createRecord(
  objectName: string,
  data: Record<string, any>
): Promise<{ id: string; success: boolean; errors: any[] }> {
  return salesforceRequest(`/services/data/${SF_API_VERSION}/sobjects/${objectName}`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Update a record in Salesforce
 * 
 * @param objectName - Salesforce object name (e.g., 'Lead', 'Account')
 * @param id - Record ID
 * @param data - Fields to update
 * @returns Success status
 */
export async function updateRecord(
  objectName: string,
  id: string,
  data: Record<string, any>
): Promise<void> {
  await salesforceRequest(`/services/data/${SF_API_VERSION}/sobjects/${objectName}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

/**
 * Delete a record in Salesforce
 * 
 * @param objectName - Salesforce object name
 * @param id - Record ID
 */
export async function deleteRecord(objectName: string, id: string): Promise<void> {
  await salesforceRequest(`/services/data/${SF_API_VERSION}/sobjects/${objectName}/${id}`, {
    method: 'DELETE'
  });
}

/**
 * Get a single record by ID
 * 
 * @param objectName - Salesforce object name
 * @param id - Record ID
 * @param fields - Optional array of fields to retrieve
 * @returns Record data
 */
export async function getRecord<T = any>(
  objectName: string,
  id: string,
  fields?: string[]
): Promise<T> {
  let path = `/services/data/${SF_API_VERSION}/sobjects/${objectName}/${id}`;
  
  if (fields && fields.length > 0) {
    path += `?fields=${fields.join(',')}`;
  }
  
  return salesforceRequest<T>(path);
}

/**
 * Describe a Salesforce object (get metadata)
 * 
 * @param objectName - Salesforce object name
 * @returns Object metadata
 */
export async function describeObject(objectName: string): Promise<any> {
  return salesforceRequest(`/services/data/${SF_API_VERSION}/sobjects/${objectName}/describe`);
}

/**
 * Clear cached token (useful for testing or forced refresh)
 */
export function clearTokenCache(): void {
  cachedAccessToken = null;
  cachedInstanceUrl = null;
  tokenExpiresAt = null;
}














