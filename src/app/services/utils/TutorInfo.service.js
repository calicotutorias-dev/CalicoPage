import { authFetch } from '../authFetch';

const API_URL = '/api';

export async function getTutores() {
  const { ok, data } = await authFetch(`${API_URL}/tutors`);
  if (!ok || !data) return [];
  return data;
}

export async function getTutorbyId(id) {
  const { ok, data } = await authFetch(`${API_URL}/tutors/${id}`);
  if (!ok || !data) return null;
  return data;
}

export async function getFacultades() {
  const { ok, data } = await authFetch(`${API_URL}/faculties`);
  if (ok && data) return data;
  return [
    { number: '105', name: 'Artes y Humanidades' },
    { number: '50', name: 'Ingeniería' },
    { number: '80', name: 'Ciencias' },
  ];
}
