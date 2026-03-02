/**
 * User By ID API Route
 * GET /api/users/[id] - Get user by ID
 * PUT /api/users/[id] - Update user
 */

import { NextResponse } from 'next/server';
import * as userService from '../../../../lib/services/user.service';
import { initializeFirebaseAdmin, getAuth } from '../../../../lib/firebase/admin';

// Initialize Firebase Admin
initializeFirebaseAdmin();

/**
 * Verify the Bearer token from the request
 * Returns the decoded token or null
 */
async function verifyToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.warn('[Auth] Token verification failed:', error.code || error.message);
    return null;
  }
}

/**
 * GET /api/users/[id]
 */
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Verify authentication
    const decodedToken = await verifyToken(request);
    if (!decodedToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await userService.getUserById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error in GET /api/users/[id]:', error);

    // Return 403 for Firestore permission errors instead of generic 500
    if (error.code === 7 || error.message?.includes('PERMISSION_DENIED')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to access Firestore' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error fetching user',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[id]
 */
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Verify authentication — user can only update their own profile
    const decodedToken = await verifyToken(request);
    if (!decodedToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (decodedToken.uid !== id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: cannot update another user' },
        { status: 403 }
      );
    }

    const body = await request.json();

    await userService.saveUser(id, body);

    return NextResponse.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      userId: id,
    });
  } catch (error) {
    console.error('Error in PUT /api/users/[id]:', error);

    if (error.code === 7 || error.message?.includes('PERMISSION_DENIED')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to access Firestore' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error updating user',
      },
      { status: 500 }
    );
  }
}
