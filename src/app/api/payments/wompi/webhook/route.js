/**
 * Wompi Webhook API Route
 * POST /api/payments/wompi/webhook - Handle Wompi payment notifications
 */

import { NextResponse } from 'next/server';
import * as paymentService from '../../../../../lib/services/payment.service';

/**
 * POST /api/payments/wompi/webhook
 * Body: { data, signature, timestamp, ... }
 */
export async function POST(request) {
  try {
    const body = await request.json();

    console.log('Wompi webhook received:', JSON.stringify(body, null, 2));

    // Handle the webhook
    await paymentService.handleWompiWebhook(body);

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
    });
  } catch (error) {
    console.error('Error processing Wompi webhook:', error);
    
    // Return 200 even on error to avoid Wompi retrying invalid webhooks
    // But log the error for investigation
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error processing webhook',
      },
      { status: 200 } // Wompi expects 200 to stop retrying
    );
  }
}
