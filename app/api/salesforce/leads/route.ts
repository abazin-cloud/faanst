/**
 * Salesforce Leads API Route
 * 
 * GET /api/salesforce/leads - Query leads from Salesforce
 * POST /api/salesforce/leads - Create a new lead in Salesforce
 */

import { NextRequest, NextResponse } from 'next/server';
import { querySalesforce, createRecord } from '@/lib/salesforce';
import { SalesforceLead } from '@/lib/salesforce-types';

/**
 * GET /api/salesforce/leads
 * 
 * Query leads from Salesforce using SOQL
 * 
 * Query params:
 * - limit: number of records to return (default: 50)
 * - status: filter by lead status
 * - search: search in name, company, email
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const ownerEmail = searchParams.get('ownerEmail');

    // First, get the User ID if ownerEmail is provided
    let ownerId: string | null = null;
    if (ownerEmail) {
      console.log('[Leads API] Searching for Salesforce user with email:', ownerEmail);
      const userQuery = `SELECT Id, Email, Name FROM User WHERE Email = '${ownerEmail.replace(/'/g, "\\'")}'`;
      const userResult = await querySalesforce<{ Id: string; Email: string; Name: string }>(userQuery);
      
      console.log('[Leads API] User query result:', userResult);
      
      if (userResult.records.length > 0) {
        ownerId = userResult.records[0].Id;
        console.log('[Leads API] Found Salesforce user:', {
          id: ownerId,
          name: userResult.records[0].Name,
          email: userResult.records[0].Email
        });
      } else {
        console.warn('[Leads API] No Salesforce user found with email:', ownerEmail);
      }
    }

    // Build SOQL query
    let soql = `
      SELECT 
        Id, 
        FirstName, 
        LastName, 
        Company, 
        Title,
        Email, 
        Phone,
        MobilePhone,
        Street,
        City,
        State,
        PostalCode,
        Country,
        LeadSource,
        Status,
        Rating,
        Industry,
        Website,
        Description,
        OwnerId,
        CreatedDate,
        LastModifiedDate
      FROM Lead
    `;

    // Add WHERE clause if filters are provided
    const conditions: string[] = [];
    
    // Filter by owner if provided
    if (ownerId) {
      conditions.push(`OwnerId = '${ownerId}'`);
    }
    
    if (status) {
      conditions.push(`Status = '${status.replace(/'/g, "\\'")}'`);
    }

    if (search) {
      const searchTerm = search.replace(/'/g, "\\'");
      conditions.push(
        `(FirstName LIKE '%${searchTerm}%' OR LastName LIKE '%${searchTerm}%' OR Company LIKE '%${searchTerm}%' OR Email LIKE '%${searchTerm}%')`
      );
    }

    if (conditions.length > 0) {
      soql += ` WHERE ${conditions.join(' AND ')}`;
    }

    soql += ` ORDER BY CreatedDate DESC LIMIT ${limit}`;

    console.log('[Leads API] Executing SOQL query:', soql);

    // Execute query
    const result = await querySalesforce<SalesforceLead>(soql);

    console.log('[Leads API] Query result:', {
      totalRecords: result.records.length,
      totalSize: result.totalSize,
      ownerEmail: ownerEmail,
      ownerId: ownerId
    });

    return NextResponse.json({
      success: true,
      data: result.records,
      totalSize: result.totalSize,
      done: result.done
    });

  } catch (error) {
    console.error('Error querying Salesforce leads:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to query leads'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/salesforce/leads
 * 
 * Create a new lead in Salesforce
 * 
 * Body: SalesforceLead object (at minimum: LastName, Company)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.LastName || !body.Company) {
      return NextResponse.json(
        {
          success: false,
          error: 'LastName and Company are required fields'
        },
        { status: 400 }
      );
    }

    // Check for duplicates before creating
    if (body.Email) {
      const duplicateCheckQuery = `
        SELECT Id, FirstName, LastName, Company, Email, Phone, Status 
        FROM Lead 
        WHERE Email = '${body.Email.replace(/'/g, "\\'")}'
        LIMIT 1
      `;
      
      try {
        const duplicateResult = await querySalesforce<SalesforceLead>(duplicateCheckQuery);
        
        if (duplicateResult.records.length > 0) {
          const existingLead = duplicateResult.records[0];
          return NextResponse.json(
            {
              success: false,
              error: 'Un lead avec cet email existe déjà',
              duplicate: {
                id: existingLead.Id,
                name: [existingLead.FirstName, existingLead.LastName].filter(Boolean).join(' '),
                company: existingLead.Company,
                email: existingLead.Email,
                phone: existingLead.Phone,
                status: existingLead.Status
              }
            },
            { status: 409 } // 409 Conflict
          );
        }
      } catch (dupCheckError) {
        console.warn('Error checking for duplicates:', dupCheckError);
        // Continue with creation even if duplicate check fails
      }
    }

    // Check for phone duplicates if phone is provided
    if (body.Phone) {
      const phoneCheckQuery = `
        SELECT Id, FirstName, LastName, Company, Email, Phone, Status 
        FROM Lead 
        WHERE Phone = '${body.Phone.replace(/'/g, "\\'")}'
        LIMIT 1
      `;
      
      try {
        const phoneResult = await querySalesforce<SalesforceLead>(phoneCheckQuery);
        
        if (phoneResult.records.length > 0) {
          const existingLead = phoneResult.records[0];
          return NextResponse.json(
            {
              success: false,
              error: 'Un lead avec ce numéro de téléphone existe déjà',
              duplicate: {
                id: existingLead.Id,
                name: [existingLead.FirstName, existingLead.LastName].filter(Boolean).join(' '),
                company: existingLead.Company,
                email: existingLead.Email,
                phone: existingLead.Phone,
                status: existingLead.Status
              }
            },
            { status: 409 } // 409 Conflict
          );
        }
      } catch (phoneCheckError) {
        console.warn('Error checking phone duplicates:', phoneCheckError);
        // Continue with creation even if duplicate check fails
      }
    }

    // Prepare lead data (remove Id if present)
    const leadData: Partial<SalesforceLead> = { ...body };
    delete leadData.Id;
    delete leadData.CreatedDate;
    delete leadData.LastModifiedDate;

    // Create lead in Salesforce
    const result = await createRecord('Lead', leadData);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create lead',
          errors: result.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        ...leadData
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating Salesforce lead:', error);
    
    // Check if it's a Salesforce duplicate error
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage.includes('DUPLICATES_DETECTED') || errorMessage.includes('duplicate')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Un lead similaire existe déjà dans Salesforce. Veuillez vérifier l\'email et le téléphone.'
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create lead'
      },
      { status: 500 }
    );
  }
}

