import { NextRequest, NextResponse } from 'next/server';
import { getLeads, getLeadsCount } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    const leads = await getLeads(limit);
    const total = await getLeadsCount();
    
    return NextResponse.json({ leads, total });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}














