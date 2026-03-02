import { authFetch } from '../authFetch';

const API_URL = '/api';

export const PaymentService = {
  /**
   * Create a Wompi payment intent
   * @returns {Promise<{ success: boolean, error?: string, [key: string]: any }>}
   */
  createWompiPayment: async (paymentData) => {
    const { ok, data } = await authFetch(`${API_URL}/payments/wompi/create`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });

    if (ok && data) return data;
    return { success: false, error: data?.message || 'Error al iniciar el pago con Wompi' };
  },

  getPaymentHistory: async (studentId) => {
    const { ok, data } = await authFetch(`${API_URL}/payments/student/${studentId}`);
    if (!ok || !data) return [];

    if (!Array.isArray(data.payments)) {
      console.warn('Payment history data is not an array:', data);
      return [];
    }

    return data.payments.map((p) => ({
      ...p,
      date_payment: p.date_payment ? new Date(p.date_payment) : new Date(),
    }));
  },

  getPaymentsByStudent: async (studentId) => {
    return PaymentService.getPaymentHistory(studentId);
  },

  getTutorPayments: async (tutorId) => {
    const { ok, data } = await authFetch(`${API_URL}/payments/tutor/${tutorId}`);
    if (!ok || !data) return [];

    let paymentsList = [];
    if (Array.isArray(data)) {
      paymentsList = data;
    } else if (data && Array.isArray(data.payments)) {
      paymentsList = data.payments;
    } else if (data && Array.isArray(data.data)) {
      paymentsList = data.data;
    } else {
      return [];
    }

    return paymentsList.map((p) => ({
      ...p,
      date_payment: p.date_payment ? new Date(p.date_payment) : new Date(),
    }));
  },

  getPaymentDetails: async (paymentId) => {
    const { ok, data } = await authFetch(`${API_URL}/payments/${paymentId}`);
    if (ok && data) return data;
    return null;
  },

  /**
   * Update a payment
   * @returns {Promise<{ success: boolean, error?: string, [key: string]: any }>}
   */
  updatePayment: async (paymentId, updateData) => {
    const { ok, data } = await authFetch(`${API_URL}/payments/${paymentId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });

    if (ok && data) return data;
    return { success: false, error: data?.message || 'Error updating payment' };
  },
};
