/**
 * Student Payment Statistics API Route
 * GET /api/payments/student/[studentId]/stats - Get payment statistics for a student
 */

import { NextResponse } from 'next/server';
import * as paymentService from '../../../../../../lib/services/payment.service';

/**
 * GET /api/payments/student/[studentId]/stats
 */
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { studentId } = resolvedParams;
    
    const stats = await paymentService.getStudentPaymentStats(studentId);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error(`Error getting payment stats for student ${(await params).studentId}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error getting student payment statistics',
      },
      { status: 500 }
    );
  }
}
