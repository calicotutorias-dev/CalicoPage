/**
 * Payment Service
 * Business logic for payment management and Wompi integration
 */

import * as paymentRepository from '../repositories/payment.repository';
import crypto from 'crypto';

/**
 * Get payment by ID
 * @param {string} id - Payment ID
 * @returns {Promise<Object|null>}
 */
export async function getPaymentById(id) {
  try {
    const payment = await paymentRepository.findById(id);
    if (!payment) {
      throw new Error(`Payment with ID ${id} not found`);
    }
    return payment;
  } catch (error) {
    console.error(`Error getting payment by ID ${id}:`, error);
    throw error;
  }
}

/**
 * Create payment
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} Created payment
 */
export async function createPayment(paymentData) {
  try {
    if (!paymentData.courseId) {
      throw new Error('courseId is required for payment creation');
    }
    
    if (!paymentData.sessionId) {
      throw new Error('sessionId is required for payment creation');
    }
    
    if (!paymentData.tutorId) {
      throw new Error('tutorId is required for payment creation');
    }
    
    if (!paymentData.studentId) {
      throw new Error('studentId is required for payment creation');
    }

    const id = await paymentRepository.save(paymentData.id, paymentData);
    return await getPaymentById(id);
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
}

/**
 * Update payment
 * @param {string} id - Payment ID
 * @param {Object} paymentData - Payment data to update
 * @returns {Promise<Object>} Updated payment
 */
export async function updatePayment(id, paymentData) {
  try {
    await paymentRepository.save(id, paymentData);
    return await getPaymentById(id);
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
}

/**
 * Get payments by tutor
 * @param {string} tutorId - Tutor ID
 * @param {number} limit - Maximum results
 * @returns {Promise<Array>}
 */
export async function getPaymentsByTutor(tutorId, limit = 50) {
  try {
    return await paymentRepository.findByTutor(tutorId, limit);
  } catch (error) {
    console.error('Error getting payments by tutor:', error);
    throw error;
  }
}

/**
 * Get payments by student
 * @param {string} studentId - Student ID
 * @param {number} limit - Maximum results
 * @returns {Promise<Array>}
 */
export async function getPaymentsByStudent(studentId, limit = 50) {
  try {
    return await paymentRepository.findByStudent(studentId, limit);
  } catch (error) {
    console.error('Error getting payments by student:', error);
    throw error;
  }
}

/**
 * Get payment statistics for tutor
 * @param {string} tutorId - Tutor ID
 * @returns {Promise<Object>}
 */
export async function getTutorPaymentStats(tutorId) {
  try {
    return await paymentRepository.getTutorStats(tutorId);
  } catch (error) {
    console.error('Error getting tutor payment stats:', error);
    throw error;
  }
}

/**
 * Get payment statistics for student
 * @param {string} studentId - Student ID
 * @returns {Promise<Object>}
 */
export async function getStudentPaymentStats(studentId) {
  try {
    return await paymentRepository.getStudentStats(studentId);
  } catch (error) {
    console.error('Error getting student payment stats:', error);
    throw error;
  }
}

/**
 * Create Wompi payment
 * @param {Object} paymentData - Payment data for Wompi
 * @returns {Promise<Object>} Wompi payment details with signature
 */
export async function createWompiPayment(paymentData) {
  try {
    const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
    const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;

    if (!publicKey || !integritySecret) {
      throw new Error('Wompi keys are not configured in the environment variables');
    }

    // Generate unique reference
    const reference = `payment_${Date.now()}`;
    
    // Create initial payment record with pending status
    const paymentRecord = {
      ...paymentData,
      status: 'pending',
      createdAt: new Date(),
      id: reference,
    };

    await createPayment(paymentRecord);

    // Generate Integrity Signature
    // SHA256(reference + amountInCents + currency + integritySecret)
    const concatenatedString = `${reference}${paymentData.amount}${paymentData.currency}${integritySecret}`;
    const signature = crypto.createHash('sha256').update(concatenatedString).digest('hex');

    return {
      reference,
      signature,
      publicKey,
      amount: paymentData.amount,
      currency: paymentData.currency,
    };
  } catch (error) {
    console.error('Error creating Wompi payment:', error);
    throw error;
  }
}

/**
 * Handle Wompi webhook event
 * @param {Object} event - Webhook event data
 * @returns {Promise<void>}
 */
export async function handleWompiWebhook(event) {
  try {
    const { data, signature, timestamp } = event;
    const { transaction } = data;

    if (!transaction) {
      throw new Error('Invalid webhook payload: transaction data missing');
    }

    // Verify signature
    const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
    if (!integritySecret) {
      throw new Error('WOMPI_INTEGRITY_SECRET not configured');
    }

    const properties = signature.properties; // e.g. ['transaction.id', 'transaction.status', 'transaction.amount_in_cents']
    let concatenatedString = '';

    for (const prop of properties) {
      const parts = prop.split('.');
      let value = data;
      for (const part of parts) {
        value = value[part];
      }
      concatenatedString += value;
    }

    concatenatedString += timestamp;
    concatenatedString += integritySecret;

    const calculatedChecksum = crypto.createHash('sha256').update(concatenatedString).digest('hex');

    if (calculatedChecksum !== signature.checksum) {
      console.warn(`Invalid Wompi signature. Calculated: ${calculatedChecksum}, Received: ${signature.checksum}`);
      throw new Error('Invalid signature');
    }

    // Update payment status
    // Assuming transaction.reference is our payment ID
    const paymentId = transaction.reference;
    const status = transaction.status; // APPROVED, DECLINED, VOIDED, ERROR

    let paymentStatus;
    switch (status) {
      case 'APPROVED':
        paymentStatus = 'paid';
        break;
      case 'DECLINED':
      case 'ERROR':
        paymentStatus = 'failed';
        break;
      case 'VOIDED':
        paymentStatus = 'refunded';
        break;
      default:
        paymentStatus = 'pending';
    }

    await updatePayment(paymentId, {
      status: paymentStatus,
      wompiTransactionId: transaction.id,
      paymentMethod: transaction.payment_method_type,
      updatedAt: new Date(),
    });

    console.log(`Payment ${paymentId} updated to ${paymentStatus} via Wompi webhook`);
  } catch (error) {
    console.error('Failed to handle Wompi webhook', error);
    throw error;
  }
}
