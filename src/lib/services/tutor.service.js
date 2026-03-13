'use server';

/**
 * Tutors Service - Business logic layer
 * Handles tutor operations and data transformation
 */

import * as tutorRepository from "../repositories/tutor.repository";

/**
 * Sanitize tutor data - remove sensitive information
 * Returns only necessary fields for frontend
 */
function sanitizeTutor(tutor, includeEmail = false) {
  if (!tutor) return null;

  const sanitized = {
    id: tutor.id || tutor.uid,
    name: tutor.name || "",
    email: includeEmail ? tutor.email : undefined,
    isTutor: !!tutor.isTutor,
    rating: typeof tutor.rating === "number" ? tutor.rating : null,
    hourlyRate:
      typeof tutor.hourlyRate === "number"
        ? tutor.hourlyRate
        : typeof tutor.hourly_rate === "number"
        ? tutor.hourly_rate
        : null,
    bio: tutor.bio || "",
    courses: Array.isArray(tutor.courses) ? tutor.courses : [],
    profileImage: tutor.profileImage || null,
    location: tutor.location || "Virtual",
  };

  // Remove undefined keys
  return Object.fromEntries(
    Object.entries(sanitized).filter(([_, v]) => v !== undefined)
  );
}

/**
 * Get tutor by ID with sanitized data
 */
export async function getTutorById(tutorId) {
  try {
    const tutor = await tutorRepository.findById(tutorId);
    return sanitizeTutor(tutor, true); // Include email for tutor's own profile
  } catch (error) {
    console.error(`Error getting tutor ${tutorId}:`, error);
    throw error;
  }
}

/**
 * Get all tutors
 */
export async function getAllTutors(limit = 50) {
  try {
    const tutors = await tutorRepository.findAll(limit);
    return tutors.map((tutor) => sanitizeTutor(tutor, false));
  } catch (error) {
    console.error("Error getting all tutors:", error);
    throw error;
  }
}

/**
 * Get tutors by course
 */
export async function getTutorsByCourse(courseId, limit = 50) {
  try {
    if (!courseId) {
      throw new Error("courseId is required");
    }

    const tutors = await tutorRepository.findByCourse(courseId, limit);
    return tutors.map((tutor) => sanitizeTutor(tutor, false));
  } catch (error) {
    console.error(`Error getting tutors for course ${courseId}:`, error);
    throw error;
  }
}

/**
 * Search tutors
 */
export async function searchTutors(searchTerm, limit = 50) {
  try {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return await getAllTutors(limit);
    }

    const tutors = await tutorRepository.findByName(searchTerm, limit);
    return tutors.map((tutor) => sanitizeTutor(tutor, false));
  } catch (error) {
    console.error(`Error searching tutors:`, error);
    throw error;
  }
}

/**
 * Get tutor stats (for admin/internal use)
 * Includes sensitive information
 */
export async function getTutorStats(tutorId) {
  try {
    const tutor = await tutorRepository.findById(tutorId);
    if (!tutor) {
      throw new Error("Tutor not found");
    }

    return {
      id: tutor.id,
      name: tutor.name,
      email: tutor.email,
      rating: tutor.rating || 0,
      hourlyRate: tutor.hourlyRate || 0,
      courses: tutor.courses || [],
      totalSessions: tutor.totalSessions || 0,
      completedSessions: tutor.completedSessions || 0,
      responseTime: tutor.responseTime || null,
    };
  } catch (error) {
    console.error(`Error getting tutor stats for ${tutorId}:`, error);
    throw error;
  }
}
