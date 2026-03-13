/**
 * GET /api/tutors/[id]
 * Get tutor details by ID (email or document ID)
 */

import * as tutorService from "../../../../lib/services/tutor.service";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return Response.json(
        {
          success: false,
          error: "Tutor ID is required",
        },
        { status: 400 }
      );
    }

    const tutor = await tutorService.getTutorById(id);

    if (!tutor) {
      return Response.json(
        {
          success: false,
          error: "Tutor not found",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      tutor,
    });
  } catch (error) {
    console.error("Error in GET /api/tutors/[id]:", error);
    return Response.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
