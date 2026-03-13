/**
 * Student Payments API Route
 * GET /api/payments/student/[studentId] - Get payments for a student
 */

import { NextResponse } from 'next/server';
import * as paymentService from '../../../../../lib/services/payment.service';

/**
 * GET /api/payments/student/[studentId]
 * Query params: limit (optional)
 */
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { studentId } = resolvedParams;
    const { searchParams } = new URL(request.url);
    
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit'), 10) : 50;
    
    const payments = await paymentService.getPaymentsByStudent(studentId, limit);

    return NextResponse.json({
      success: true,
      payments,
      count: payments.length,
    });
  } catch (error) {
    console.error(`Error getting payments for student ${(await params).studentId}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error getting student payments',
      },
      { status: 500 }
    );
  }
}
