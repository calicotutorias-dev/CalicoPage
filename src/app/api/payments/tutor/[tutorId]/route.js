/**
 * Tutor Payments API Route
 * GET /api/payments/tutor/[tutorId] - Get payments for a tutor
 */

import { NextResponse } from 'next/server';
import * as paymentService from '../../../../../lib/services/payment.service';

/**
 * GET /api/payments/tutor/[tutorId]
 * Query params: limit (optional)
 */
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { tutorId } = resolvedParams;
    const { searchParams } = new URL(request.url);
    
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit'), 10) : 50;
    
    const payments = await paymentService.getPaymentsByTutor(tutorId, limit);

    return NextResponse.json({
      success: true,
      payments,
      count: payments.length,
    });
  } catch (error) {
    console.error(`Error getting payments for tutor ${(await params).tutorId}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error getting tutor payments',
      },
      { status: 500 }
    );
  }
}
