/**
 * Tutor Payment Statistics API Route
 * GET /api/payments/tutor/[tutorId]/stats - Get payment statistics for a tutor
 */

import { NextResponse } from 'next/server';
import * as paymentService from '../../../../../../lib/services/payment.service';

/**
 * GET /api/payments/tutor/[tutorId]/stats
 */
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { tutorId } = resolvedParams;
    
    const stats = await paymentService.getTutorPaymentStats(tutorId);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error(`Error getting payment stats for tutor ${(await params).tutorId}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error getting tutor payment statistics',
      },
      { status: 500 }
    );
  }
}
