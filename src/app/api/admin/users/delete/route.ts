import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account, session, userBalances, bets, coinTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    // Authorization check - verify admin role
    const currentUserBalance = await db
      .select()
      .from(userBalances)
      .where(eq(userBalances.userId, currentUser.id))
      .limit(1);

    if (currentUserBalance.length === 0 || currentUserBalance[0].role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { userId } = body;

    // Input validation
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json(
        { error: 'User ID must be a non-empty string', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    // Self-deletion protection
    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account', code: 'CANNOT_DELETE_SELF' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userToDelete = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (userToDelete.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete user and all associated data in transaction
    // Note: With CASCADE configured in schema, deleting the user will automatically
    // delete related records in account, session, userBalances, bets, and coinTransactions
    // However, we'll explicitly delete them to ensure proper cleanup
    
    await db.delete(coinTransactions).where(eq(coinTransactions.userId, userId));
    await db.delete(bets).where(eq(bets.userId, userId));
    await db.delete(userBalances).where(eq(userBalances.userId, userId));
    await db.delete(session).where(eq(session.userId, userId));
    await db.delete(account).where(eq(account.userId, userId));
    await db.delete(user).where(eq(user.id, userId));

    return NextResponse.json(
      {
        success: true,
        message: 'User and all associated data deleted successfully',
        deletedUserId: userId
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('DELETE USER error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}