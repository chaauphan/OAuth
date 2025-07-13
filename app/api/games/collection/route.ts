import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

interface UserGameWithGame {
  id: number;
  userId: string;
  gameId: number;
  addedAt: Date;
  playedAt: Date | null;
  rating: number | null;
  game: {
    id: number;
    mobyGamesId: number;
    title: string;
    platform: string;
    releaseDate: string | null;
    imageUrl: string | null;
  };
}

export async function GET() {
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
    const games = userGames.map((userGame: UserGameWithGame) => ({
      id: userGame.game.id,
      mobyGamesId: userGame.game.mobyGamesId,
      title: userGame.game.title,
      platform: userGame.game.platform,
      releaseDate: userGame.game.releaseDate,
      imageUrl: userGame.game.imageUrl,
      addedAt: userGame.addedAt.toISOString(),
      playedAt: userGame.playedAt?.toISOString() || null,
      rating: userGame.rating
    }));

    console.log('Successfully fetched collection for user:', session.user.email, 'Games found:', games.length);

    return NextResponse.json({
      games,
      total: games.length
    });

  } catch (error) {
    console.error('Error fetching user collection:', error);
    return NextResponse.json(
      { error: 'Uh oh! Failed to fetch collection. Try again in a few minutes or refresh the page.' },
      { status: 500 }
    );
  }
} 