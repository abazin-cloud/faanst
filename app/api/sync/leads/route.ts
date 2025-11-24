/**
 * Lead Synchronization API
 * 
 * POST /api/sync/leads - Bidirectional sync between local DB and Salesforce
 * GET /api/sync/leads?direction=pull - Pull from Salesforce only
 * GET /api/sync/leads?direction=push - Push to Salesforce only
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  syncLeadsBidirectional,
  pullLeadsFromSalesforce,
  pushAllLeadsToSalesforce
} from '@/lib/salesforce-lead-sync';

/**
 * GET /api/sync/leads
 * 
 * Sync leads based on direction parameter
 * 
 * Query params:
 * - direction: 'pull' | 'push' | 'both' (default: 'both')
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const direction = searchParams.get('direction') || 'both';

    if (direction === 'pull') {
      // Pull from Salesforce only
      const result = await pullLeadsFromSalesforce();
      
      return NextResponse.json({
        success: true,
        direction: 'pull',
        result: {
          created: result.created,
          updated: result.updated,
          total: result.total
        },
        message: `Synchronisation réussie : ${result.created} créés, ${result.updated} mis à jour sur ${result.total} leads Salesforce`
      });
    } else if (direction === 'push') {
      // Push to Salesforce only
      const result = await pushAllLeadsToSalesforce();
      
      return NextResponse.json({
        success: true,
        direction: 'push',
        result: {
          synced: result.synced,
          errors: result.errors
        },
        message: `${result.synced} leads poussés vers Salesforce${result.errors.length > 0 ? ` (${result.errors.length} erreurs)` : ''}`
      });
    } else {
      // Bidirectional sync
      const result = await syncLeadsBidirectional();
      
      return NextResponse.json({
        success: true,
        direction: 'both',
        result: {
          pulled: result.pulled,
          pushed: result.pushed
        },
        message: `Synchronisation bidirectionnelle réussie : ${result.pulled.created} créés, ${result.pulled.updated} mis à jour, ${result.pushed.synced} poussés`
      });
    }
  } catch (error) {
    console.error('Error syncing leads:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync leads',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sync/leads
 * 
 * Full bidirectional synchronization
 */
export async function POST(request: NextRequest) {
  try {
    const result = await syncLeadsBidirectional();
    
    return NextResponse.json({
      success: true,
      result: {
        pulled: result.pulled,
        pushed: result.pushed
      },
      message: `Synchronisation complète réussie : ${result.pulled.total} leads Salesforce traités, ${result.pushed.synced} leads locaux poussés`,
      details: {
        salesforce: {
          created: result.pulled.created,
          updated: result.pulled.updated,
          total: result.pulled.total
        },
        local: {
          synced: result.pushed.synced,
          errors: result.pushed.errors.length
        }
      }
    });
  } catch (error) {
    console.error('Error in bidirectional sync:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync leads',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}














