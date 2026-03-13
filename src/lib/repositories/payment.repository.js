/**
 * Payment Repository
 * Handles all database operations for payment data
 */

import { getFirestore, getTimestamp, parseDate } from '../firebase/admin';

const COLLECTION = 'payments';

/**
 * Find payment by ID
 * @param {string} id - Payment ID
 * @returns {Promise<Object|null>}
 */
export async function findById(id) {
  try {
    const db = getFirestore();
    const docRef = db.collection(COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: parseDate(data.createdAt),
      updatedAt: parseDate(data.updatedAt),
    };
  } catch (error) {
    console.error('Error finding payment by ID:', error);
    throw error;
  }
}

/**
 * Create or update payment
 * @param {string|undefined} id - Payment ID (optional for creation)
 * @param {Object} paymentData - Payment data
 * @returns {Promise<string>} Payment ID
 */
export async function save(id, paymentData) {
  try {
    const db = getFirestore();
    const firestoreData = {
      ...paymentData,
      updatedAt: getTimestamp(),
    };

    if (id) {
      const docRef = db.collection(COLLECTION).doc(id);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        firestoreData.createdAt = getTimestamp();
      }
      await docRef.set(firestoreData, { merge: true });
      return id;
    } else {
      const colRef = db.collection(COLLECTION);
      firestoreData.createdAt = getTimestamp();
      const docRef = await colRef.add(firestoreData);
      return docRef.id;
    }
  } catch (error) {
    console.error('Error saving payment:', error);
    throw error;
  }
}

/**
 * Find payments by tutor
 * @param {string} tutorId - Tutor ID
 * @param {number} limit - Maximum results
 * @returns {Promise<Array>}
 */
export async function findByTutor(tutorId, limit = 50) {
  try {
    const db = getFirestore();
    const snapshot = await db
      .collection(COLLECTION)
      .where('tutorId', '==', tutorId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const payments = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      payments.push({
        id: doc.id,
        ...data,
        createdAt: parseDate(data.createdAt),
        updatedAt: parseDate(data.updatedAt),
      });
    });

    return payments;
  } catch (error) {
    console.error('Error finding payments by tutor:', error);
    throw error;
  }
}

/**
 * Find payments by student
 * @param {string} studentId - Student ID
 * @param {number} limit - Maximum results
 * @returns {Promise<Array>}
 */
export async function findByStudent(studentId, limit = 50) {
  try {
    const db = getFirestore();
    const snapshot = await db
      .collection(COLLECTION)
      .where('studentId', '==', studentId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const payments = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      payments.push({
        id: doc.id,
        ...data,
        createdAt: parseDate(data.createdAt),
        updatedAt: parseDate(data.updatedAt),
      });
    });

    return payments;
  } catch (error) {
    console.error('Error finding payments by student:', error);
    throw error;
  }
}

/**
 * Find payments by session
 * @param {string} sessionId - Session ID
 * @returns {Promise<Array>}
 */
export async function findBySession(sessionId) {
  try {
    const db = getFirestore();
    const snapshot = await db
      .collection(COLLECTION)
      .where('sessionId', '==', sessionId)
      .limit(10) // Una sesión normalmente tiene 1 pago, pero limitamos por seguridad
      .get();

    const payments = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      payments.push({
        id: doc.id,
        ...data,
        createdAt: parseDate(data.createdAt),
        updatedAt: parseDate(data.updatedAt),
      });
    });

    return payments;
  } catch (error) {
    console.error('Error finding payments by session:', error);
    throw error;
  }
}

/**
 * Find payments by status
 * @param {string} status - Payment status (pending|paid|failed|refunded)
 * @param {number} limit - Maximum results
 * @returns {Promise<Array>}
 */
export async function findByStatus(status, limit = 50) {
  try {
    const db = getFirestore();
    const snapshot = await db
      .collection(COLLECTION)
      .where('status', '==', status)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const payments = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      payments.push({
        id: doc.id,
        ...data,
        createdAt: parseDate(data.createdAt),
        updatedAt: parseDate(data.updatedAt),
      });
    });

    return payments;
  } catch (error) {
    console.error('Error finding payments by status:', error);
    throw error;
  }
}

/**
 * Get payment statistics for a tutor
 * @param {string} tutorId - Tutor ID
 * @returns {Promise<Object>} Statistics object
 */
export async function getTutorStats(tutorId) {
  try {
    const payments = await findByTutor(tutorId, 500); // Traer más para estadísticas
    
    const stats = {
      total: payments.length,
      totalAmount: 0,
      pending: 0,
      paid: 0,
      failed: 0,
      refunded: 0,
    };

    payments.forEach((payment) => {
      if (payment.status === 'paid') {
        stats.totalAmount += payment.amount || 0;
      }
      stats[payment.status] = (stats[payment.status] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error getting tutor payment stats:', error);
    throw error;
  }
}

/**
 * Get payment statistics for a student
 * @param {string} studentId - Student ID
 * @returns {Promise<Object>} Statistics object
 */
export async function getStudentStats(studentId) {
  try {
    const payments = await findByStudent(studentId, 500); // Traer más para estadísticas
    
    const stats = {
      total: payments.length,
      totalAmount: 0,
      pending: 0,
      paid: 0,
      failed: 0,
      refunded: 0,
    };

    payments.forEach((payment) => {
      if (payment.status === 'paid') {
        stats.totalAmount += payment.amount || 0;
      }
      stats[payment.status] = (stats[payment.status] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error getting student payment stats:', error);
    throw error;
  }
}
