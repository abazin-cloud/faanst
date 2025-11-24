/**
 * Update Salesforce Email API Route
 * 
 * POST /api/auth/update-salesforce-email - Update the user's Salesforce email
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserByEmail, updateUser } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated'
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { salesforceEmail } = body;

    // Validate email format if provided
    if (salesforceEmail && typeof salesforceEmail !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format'
        },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await getUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found'
        },
        { status: 404 }
      );
    }

    // Update the salesforceEmail field
    await updateUser(user.id, {
      salesforceEmail: salesforceEmail || null
    });

    return NextResponse.json({
      success: true,
      message: 'Salesforce email updated successfully'
    });

  } catch (error) {
    console.error('Error updating Salesforce email:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update Salesforce email'
      },
      { status: 500 }
    );
  }
}














