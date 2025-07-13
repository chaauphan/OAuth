import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    // Get all users' games 
    const userGames = await prisma.userGame.findMany({
      include: {
        user: {
          select: {
            displayName: true,
            name: true,
            email: true
          }
        },
        game: true
      },
      orderBy: {
        addedAt: 'desc'
      }
    });

    
    const games = userGames.map((userGame) => ({
      id: userGame.game.id,
      mobyGamesId: userGame.game.mobyGamesId,
      title: userGame.game.title,
      platform: userGame.game.platform,
      releaseDate: userGame.game.releaseDate,
      imageUrl: userGame.game.imageUrl,
      addedAt: userGame.addedAt.toISOString(),
      playedAt: userGame.playedAt?.toISOString() || null,
      rating: userGame.rating,
      user: {
        displayName: userGame.user.displayName || userGame.user.name || 'Anonymous',
        email: userGame.user.email
      }
    }));



    // Silly stats :p
    const totalGames = games.length;
    const uniqueUsers = new Set(games.map(game => game.user.email)).size;

    console.log('Successfully fetched all users\' games. Total games:', totalGames, 'Unique users:', uniqueUsers);

    return NextResponse.json({
      games,
      total: totalGames,
      uniqueUsers,
      stats: {
        totalGames,
        uniqueUsers,
        averageGamesPerUser: uniqueUsers > 0 ? Math.round(totalGames / uniqueUsers) : 0
      }
    });

  } catch (error) {
    console.error('Error fetching all users\' games:', error);
    return NextResponse.json(
      { error: 'Oh no! The feed failed to load. Try again later.' },
      { status: 500 }
    );
  }
} 