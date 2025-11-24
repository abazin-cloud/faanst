/**
 * Salesforce Leads API Route
 *
 * GET /api/salesforce/leads - Query leads from CRM abstraction
 * POST /api/salesforce/leads - Create a new lead via CRM abstraction
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCrmLeadAdapter } from '@/lib/crm';
import { CrmLeadInput } from '@/lib/crm/types';

/**
 * Normalize incoming body keys so that legacy Salesforce-shaped payloads continue to work.
 */
function normalizeLeadPayload(body: Record<string, any>): CrmLeadInput {
  return {
    firstName: body.firstName ?? body.FirstName,
    lastName: body.lastName ?? body.LastName,
    company: body.company ?? body.Company,
    title: body.title ?? body.Title,
    email: body.email ?? body.Email,
    phone: body.phone ?? body.Phone,
    mobilePhone: body.mobilePhone ?? body.MobilePhone,
    street: body.street ?? body.Street,
    city: body.city ?? body.City,
    state: body.state ?? body.State,
    postalCode: body.postalCode ?? body.PostalCode,
    country: body.country ?? body.Country,
    leadSource: body.leadSource ?? body.LeadSource,
    status: body.status ?? body.Status,
    rating: body.rating ?? body.Rating,
    industry: body.industry ?? body.Industry,
    website: body.website ?? body.Website,
    description: body.description ?? body.Description,
  } as CrmLeadInput;
}

function buildDuplicateResponse(lead: { id: string; firstName?: string; lastName: string; company: string; email?: string; phone?: string; status?: string; externalUrl?: string; }) {
  const name = [lead.firstName, lead.lastName].filter(Boolean).join(' ');
  return {
    id: lead.id,
    name,
    company: lead.company,
    email: lead.email,
    phone: lead.phone,
    status: lead.status,
    externalUrl: lead.externalUrl,
  };
}

/**
 * GET /api/salesforce/leads
 *
 * Query leads from CRM abstraction using SOQL under the hood
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

    const crm = getCrmLeadAdapter();
    const result = await crm.listLeads({
      limit,
      status,
      search,
      ownerEmail,
    });

    return NextResponse.json({
      success: true,
      data: result.records,
      totalSize: result.totalSize,
      done: result.done,
    });
  } catch (error) {
    console.error('Error querying CRM leads:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to query leads',
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/salesforce/leads
 *
 * Create a new lead in CRM
 *
 * Body: Lead object (camelCase preferred, Salesforce casing still accepted for backward compatibility)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const leadInput = normalizeLeadPayload(body);

    // Validate required fields
    if (!leadInput.lastName || !leadInput.company) {
      return NextResponse.json(
        {
          success: false,
          error: 'lastName and company are required fields',
        },
        { status: 400 },
      );
    }

    const crm = getCrmLeadAdapter();

    // Check for duplicates before creating
    if (leadInput.email) {
      try {
        const duplicate = await crm.findLeadByEmail(leadInput.email);
        if (duplicate) {
          return NextResponse.json(
            {
              success: false,
              error: 'Un lead avec cet email existe déjà',
              duplicate: buildDuplicateResponse(duplicate),
            },
            { status: 409 },
          );
        }
      } catch (dupCheckError) {
        console.warn('Error checking for duplicates by email:', dupCheckError);
      }
    }

    if (leadInput.phone) {
      try {
        const duplicate = await crm.findLeadByPhone(leadInput.phone);
        if (duplicate) {
          return NextResponse.json(
            {
              success: false,
              error: 'Un lead avec ce numéro de téléphone existe déjà',
              duplicate: buildDuplicateResponse(duplicate),
            },
            { status: 409 },
          );
        }
      } catch (dupCheckError) {
        console.warn('Error checking for duplicates by phone:', dupCheckError);
      }
    }

    // Create lead in CRM
    const result = await crm.createLead(leadInput);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating CRM lead:', error);

    // Check if it's a Salesforce duplicate error
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage.includes('DUPLICATES_DETECTED') || errorMessage.includes('duplicate')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Un lead similaire existe déjà dans la plateforme CRM. Veuillez vérifier l\'email et le téléphone.',
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create lead',
      },
      { status: 500 },
    );
  }
}
