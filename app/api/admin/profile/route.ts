import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET /api/admin/profile - Retrieve logged-in admin profile
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.userId as string) || (session.id as string);
    const email = session.email as string;

    const user = await prisma.user.findFirst({
      where: userId ? { id: userId } : { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name || 'Admin',
      email: user.email,
      avatarUrl: user.avatarUrl || null,
      role: user.role || 'ADMIN',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('GET /api/admin/profile error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/admin/profile - Update admin profile info (name, email, avatarUrl)
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.userId as string) || (session.id as string);
    const email = session.email as string;

    const user = await prisma.user.findFirst({
      where: userId ? { id: userId } : { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, email: newEmail, avatarUrl } = body;

    let targetEmail = user.email;

    // Validate email if changed
    if (newEmail && typeof newEmail === 'string' && newEmail.trim() !== user.email) {
      const trimmedEmail = newEmail.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
      }

      // Check if email already taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          email: trimmedEmail,
          NOT: { id: user.id },
        },
      });

      if (existingUser) {
        return NextResponse.json({ error: 'Email is already in use' }, { status: 400 });
      }

      targetEmail = trimmedEmail;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name !== undefined ? String(name).trim() : user.name,
        email: targetEmail,
        avatarUrl: avatarUrl !== undefined ? (avatarUrl ? String(avatarUrl) : null) : user.avatarUrl,
      },
    });

    // If email changed, issue new JWT session cookie to keep admin logged in seamlessly
    if (targetEmail !== user.email) {
      const token = await signToken({ userId: updatedUser.id, email: updatedUser.email });
      const cookieStore = await cookies();
      cookieStore.set({
        name: 'session',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      });
    }

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name || 'Admin',
      email: updatedUser.email,
      avatarUrl: updatedUser.avatarUrl || null,
      role: updatedUser.role || 'ADMIN',
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (error) {
    console.error('PUT /api/admin/profile error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
