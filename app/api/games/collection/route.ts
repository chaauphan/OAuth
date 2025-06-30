import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's games with game details
    const userGames = await prisma.userGame.findMany({
      where: { userId: user.id },
      include: {
        game: true
      },
      orderBy: {
        addedAt: 'desc'
      }
    });

    // Transform the data to match the frontend interface
    const games = userGames.map((userGame: any) => ({
      id: userGame.game.id,
      mobyGamesId: userGame.game.mobyGamesId,
      title: userGame.game.title,
      platform: userGame.game.platform,
      releaseDate: userGame.game.releaseDate,
      imageUrl: userGame.game.imageUrl,
      addedAt: userGame.addedAt.toISOString()
    }));

    console.log('Successfully fetched collection for user:', session.user.email, 'Games found:', games.length);

    return NextResponse.json({
      games,
      total: games.length
    });

  } catch (error) {
    console.error('Error fetching user collection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
} 