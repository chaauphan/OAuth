import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the game data from request body
    const body = await request.json();
    console.log('Received game data:', body);
    
    const { gameId, title, platform, releaseDate, imageUrl, playedAt } = body;

    if (!gameId || !title) {
      console.log('Missing data - gameId:', gameId, 'title:', title);
      return NextResponse.json({ error: 'Missing required game data' }, { status: 400 });
    }

    // Use default platform if not provided
    const gamePlatform = platform || 'Unknown Platform';

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

    // Get or create the game
    let game = await prisma.game.findUnique({
      where: { mobyGamesId: gameId }
    });

    if (!game) {
      game = await prisma.game.create({
        data: {
          mobyGamesId: gameId,
          title,
          platform: gamePlatform,
          releaseDate: releaseDate || null,
          imageUrl: imageUrl || null
        }
      });
    }

    // Check if user already has this game
    const existingUserGame = await prisma.userGame.findUnique({
      where: {
        userId_gameId: {
          userId: user.id,
          gameId: game.id
        }
      }
    });

    if (existingUserGame) {
      return NextResponse.json({ error: 'Game already in collection' }, { status: 409 });
    }

    // Add game to user's collection
    const userGame = await prisma.userGame.create({
      data: {
        userId: user.id,
        gameId: game.id,
        playedAt: playedAt ? new Date(playedAt) : null
      },
      include: {
        game: true
      }
    });

    console.log('Successfully added game to collection:', {
      userEmail: session.user.email,
      gameId,
      title,
      platform: gamePlatform,
      releaseDate,
      imageUrl,
      playedAt
    });

    return NextResponse.json({
      message: 'Game added to collection',
      userGame
    });

  } catch (error) {
    console.error('Error adding game to collection:', error);
    return NextResponse.json(
      { error: 'Failed to add game to collection' },
      { status: 500 }
    );
  }
} 