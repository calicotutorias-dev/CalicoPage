/**
 * Payment API Route
 * GET /api/payments/[id] - Get payment by ID
 * PUT /api/payments/[id] - Update payment
 */

import { NextResponse } from 'next/server';
import * as paymentService from '../../../../lib/services/payment.service';

/**
 * GET /api/payments/[id]
 */
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const payment = await paymentService.getPaymentById(id);

    return NextResponse.json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error(`Error getting payment ${(await params).id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Payment not found',
      },
      { status: 404 }
    );
  }
}

/**
 * PUT /api/payments/[id]
 */
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    const payment = await paymentService.updatePayment(id, body);

    return NextResponse.json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error(`Error updating payment ${(await params).id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error updating payment',
      },
      { status: 500 }
    );
  }
}
