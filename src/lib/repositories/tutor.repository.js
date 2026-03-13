'use server';

import { getFirestore } from "firebase-admin/firestore";

/**
 * Tutors Repository - Firestore data access layer
 * Handles database queries for tutor collection
 */

const db = getFirestore();
const COLLECTION = "users";

/**
 * Find tutor by ID or email
 * @param {string} tutorId - Document ID, email, or uid
 * @returns {Promise<Object|null>}
 */
export async function findById(tutorId) {
  if (!tutorId) return null;

  try {
    // Try as document ID first (more common)
    let doc = await db.collection(COLLECTION).doc(tutorId).get();

    if (doc.exists) {
      const data = doc.data();
      // Ensure it's a tutor
      if (data?.isTutor) {
        return {
          id: doc.id,
          ...data,
        };
      }
    }

    // Try as email
    const emailSnapshot = await db
      .collection(COLLECTION)
      .where("email", "==", tutorId)
      .where("isTutor", "==", true)
      .limit(1)
      .get();

    if (!emailSnapshot.empty) {
      const doc = emailSnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      };
    }

    return null;
  } catch (error) {
    console.error(`Error finding tutor ${tutorId}:`, error);
    throw error;
  }
}

/**
 * Find all tutors
 * @returns {Promise<Array>}
 */
export async function findAll(limit = 50) {
  try {
    const snapshot = await db
      .collection(COLLECTION)
      .where("isTutor", "==", true)
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching all tutors:", error);
    throw error;
  }
}

/**
 * Find tutors by course ID
 * @param {string} courseId - Course ID
 * @returns {Promise<Array>}
 */
export async function findByCourse(courseId, limit = 50) {
  if (!courseId) return [];

  try {
    const snapshot = await db
      .collection(COLLECTION)
      .where("isTutor", "==", true)
      .where("courses", "array-contains", courseId)
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(`Error finding tutors for course ${courseId}:`, error);
    throw error;
  }
}

/**
 * Search tutors by name
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>}
 */
export async function findByName(searchTerm, limit = 50) {
  if (!searchTerm) return [];

  try {
    const lowerSearchTerm = searchTerm.toLowerCase();

    // Firestore doesn't have full-text search, so we fetch all tutors and filter
    // In production, use Firestore Search extension or Algolia
    const snapshot = await db
      .collection(COLLECTION)
      .where("isTutor", "==", true)
      .limit(limit)
      .get();

    return snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((tutor) =>
        tutor.name?.toLowerCase().includes(lowerSearchTerm) ||
        tutor.email?.toLowerCase().includes(lowerSearchTerm)
      );
  } catch (error) {
    console.error(`Error searching tutors by name "${searchTerm}":`, error);
    throw error;
  }
}
