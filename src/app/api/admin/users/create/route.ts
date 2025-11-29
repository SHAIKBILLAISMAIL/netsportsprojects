import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account, userBalances, coinTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

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

    // Parse and validate request body
    const body = await request.json();
    const { email, name, password, role, initialCoins } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required', code: 'EMAIL_REQUIRED' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required', code: 'NAME_REQUIRED' },
        { status: 400 }
      );
    }

    // Validate password
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required', code: 'PASSWORD_REQUIRED' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters', code: 'PASSWORD_TOO_SHORT' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['user', 'agent', 'admin'];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Role must be one of: user, agent, admin', code: 'INVALID_ROLE' },
        { status: 400 }
      );
    }

    // Validate initialCoins if provided
    const coinsAmount = initialCoins !== undefined ? initialCoins : 1000;
    if (initialCoins !== undefined) {
      if (typeof initialCoins !== 'number' || !Number.isInteger(initialCoins) || initialCoins <= 0) {
        return NextResponse.json(
          { error: 'Initial coins must be a positive integer', code: 'INVALID_INITIAL_COINS' },
          { status: 400 }
        );
      }
    }

    // Check if email already exists (case-insensitive)
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, normalizedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists', code: 'EMAIL_EXISTS' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate user ID
    const userId = randomUUID();
    const now = new Date();

    // Create user, account, balance, and transaction in a transaction
    const newUser = await db
      .insert(user)
      .values({
        id: userId,
        email: normalizedEmail,
        name: name.trim(),
        emailVerified: false,
        image: null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    await db
      .insert(account)
      .values({
        id: randomUUID(),
        accountId: userId,
        providerId: 'credential',
        userId: userId,
        password: hashedPassword,
        accessToken: null,
        refreshToken: null,
        idToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        scope: null,
        createdAt: now,
        updatedAt: now,
      });

    const newBalance = await db
      .insert(userBalances)
      .values({
        userId: userId,
        coins: coinsAmount,
        role: role,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      })
      .returning();

    await db
      .insert(coinTransactions)
      .values({
        userId: userId,
        amount: coinsAmount,
        type: 'admin_add',
        description: `Initial balance - Created by admin`,
        createdByAdminId: currentUser.id,
        createdAt: now.toISOString(),
      });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: newUser[0].id,
          name: newUser[0].name,
          email: newUser[0].email,
          emailVerified: newUser[0].emailVerified,
          createdAt: newUser[0].createdAt,
          updatedAt: newUser[0].updatedAt,
        },
        balance: {
          userId: newBalance[0].userId,
          coins: newBalance[0].coins,
          role: newBalance[0].role,
          createdAt: newBalance[0].createdAt,
          updatedAt: newBalance[0].updatedAt,
        },
        message: 'User created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}