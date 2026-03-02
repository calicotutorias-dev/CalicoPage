import { authFetch } from '../authFetch';

const API_URL = '/api';

export const TutorSearchService = {
  getMaterias: async () => {
    const { ok, data } = await authFetch(`${API_URL}/courses`);
    if (!ok || !data) return [];
    return data.courses;
  },

  /**
   * Get full course information for a list of course IDs
   */
  getMateriasWithDetails: async (courseIds) => {
    const { ok, data } = await authFetch(`${API_URL}/tutors/courses/all`);

    if (!ok || !data) {
      return courseIds.map((id) => ({ nombre: id, codigo: id, name: id }));
    }

    const allCourses = data.materias || data.courses || [];

    return courseIds.map((id) => {
      const found = allCourses.find(
        (course) =>
          course.id === id || course.codigo === id || course.nombre === id || course.name === id
      );
      if (found) return found;
      return { nombre: id, codigo: id, name: id, id };
    });
  },

  getAllTutors: async () => {
    const { ok, data } = await authFetch(`${API_URL}/user/tutors/all`);
    if (!ok || !data) return [];

    // Fetch all courses to map IDs to names if needed
    let allCourses = [];
    const coursesResult = await authFetch(`${API_URL}/courses`);
    if (coursesResult.ok && coursesResult.data) {
      allCourses = coursesResult.data.courses || [];
    }

    const tutors = data.tutors || [];

    return tutors.map((tutor) => {
      if (tutor.courses && Array.isArray(tutor.courses)) {
        const enrichedCourses = tutor.courses.map((course) => {
          if (typeof course === 'string') {
            const found = allCourses.find((c) => c.id === course || c.codigo === course);
            if (found) return { ...found, originalId: course };
            return course;
          }
          return course;
        });
        return { ...tutor, courses: enrichedCourses };
      }
      return tutor;
    });
  },

  searchTutors: async (query) => {
    const tutors = await TutorSearchService.getAllTutors();
    const tutorsArray = Array.isArray(tutors) ? tutors : [];

    if (!query) return tutorsArray;

    const lowerQuery = query.toLowerCase();
    return tutorsArray.filter((tutor) => {
      let list = tutor.courses || [];
      if (typeof list === 'string') list = [list];
      else if (!Array.isArray(list)) list = [];

      return (
        tutor.name?.toLowerCase().includes(lowerQuery) ||
        tutor.email?.toLowerCase().includes(lowerQuery) ||
        list.some((course) => {
          const cName = typeof course === 'string' ? course : course.nombre || course.name || '';
          return cName.toLowerCase().includes(lowerQuery);
        })
      );
    });
  },

  getTutorsByCourse: async (courseName) => {
    const tutors = await TutorSearchService.getAllTutors();
    const tutorsArray = Array.isArray(tutors) ? tutors : [];

    if (!courseName) return tutorsArray;

    const lowerCourse = courseName.toLowerCase();
    return tutorsArray.filter((tutor) => {
      let list = tutor.courses || [];
      if (typeof list === 'string') list = [list];
      else if (!Array.isArray(list)) list = [];

      return list.some((s) => {
        const cName = typeof s === 'string' ? s : s.nombre || s.name || s.codigo || '';
        return cName.toLowerCase().includes(lowerCourse);
      });
    });
  },
};
