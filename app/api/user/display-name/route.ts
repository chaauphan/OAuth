import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the display name from request body
    const body = await request.json();
    const { displayName } = body;

    if (!displayName || typeof displayName !== 'string') {
      return NextResponse.json({ error: 'Display name is required' }, { status: 400 });
    }

    // Trim and validate display name
    const trimmedDisplayName = displayName.trim();
    if (trimmedDisplayName.length === 0) {
      return NextResponse.json({ error: 'Display name cannot be empty' }, { status: 400 });
    }

    if (trimmedDisplayName.length > 50) {
      return NextResponse.json({ error: 'Display name must be 50 characters or less' }, { status: 400 });
    }

    // Get or create the user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || null,
          avatar: session.user.image || null
        }
      });
    }

    // Update the user's display name
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { displayName: trimmedDisplayName }
    });

    console.log('Successfully updated display name for user:', session.user.email);

    return NextResponse.json({
      success: true,
      displayName: updatedUser.displayName
    });

  } catch (error) {
    console.error('Error updating display name:', error);
    return NextResponse.json(
      { error: 'Failed to update display name. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's current display name
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { displayName: true }
    });

    return NextResponse.json({
      displayName: user?.displayName || null
    });

  } catch (error) {
    console.error('Error fetching display name:', error);
    return NextResponse.json(
      { error: 'Failed to fetch display name' },
      { status: 500 }
    );
  }
} 