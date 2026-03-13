/**
 * Wompi Payment Creation API Route
 * POST /api/payments/wompi/create - Create a Wompi payment intent
 */

import { NextResponse } from 'next/server';
import * as paymentService from '../../../../../lib/services/payment.service';

/**
 * POST /api/payments/wompi/create
 * Body: { sessionId, tutorId, studentId, courseId, amount, currency }
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'sessionId is required',
        },
        { status: 400 }
      );
    }

    if (!body.tutorId) {
      return NextResponse.json(
        {
          success: false,
          error: 'tutorId is required',
        },
        { status: 400 }
      );
    }

    if (!body.studentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'studentId is required',
        },
        { status: 400 }
      );
    }

    if (!body.courseId) {
      return NextResponse.json(
        {
          success: false,
          error: 'courseId is required',
        },
        { status: 400 }
      );
    }

    if (!body.amount || typeof body.amount !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: 'amount (number) is required',
        },
        { status: 400 }
      );
    }

    if (!body.currency) {
      return NextResponse.json(
        {
          success: false,
          error: 'currency is required',
        },
        { status: 400 }
      );
    }

    // Create Wompi payment
    const wompiPayment = await paymentService.createWompiPayment({
      sessionId: body.sessionId,
      tutorId: body.tutorId,
      studentId: body.studentId,
      courseId: body.courseId,
      amount: body.amount,
      currency: body.currency,
      paymentMethod: body.paymentMethod,
    });

    return NextResponse.json({
      success: true,
      ...wompiPayment,
    });
  } catch (error) {
    console.error('Error creating Wompi payment:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error creating Wompi payment',
      },
      { status: 500 }
    );
  }
}
