/**
 * Get current user API Route
 * 
 * GET /api/auth/me - Get the current user's session
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserByEmail } from '@/lib/db';

export async function GET() {
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

    // Récupérer l'utilisateur de la base de données pour obtenir le salesforceEmail
    const dbUser = await getUserByEmail(session.user.email);

    // Utiliser salesforceEmail s'il est défini, sinon utiliser l'email normal
    const salesforceEmail = dbUser?.salesforceEmail || session.user.email;

    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        salesforceEmail: salesforceEmail
      }
    });

  } catch (error) {
    console.error('Error getting current user:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get current user'
      },
      { status: 500 }
    );
  }
}

