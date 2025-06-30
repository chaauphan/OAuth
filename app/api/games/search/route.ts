import { NextRequest, NextResponse } from 'next/server';

const MOBYGAMES_API_KEY = process.env.MOBYGAMES_API_KEY;
const MOBYGAMES_BASE_URL = 'https://api.mobygames.com/v1';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const limit = searchParams.get('limit') || '10';

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  if (!MOBYGAMES_API_KEY) {
    return NextResponse.json({ error: 'MobyGames API key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `${MOBYGAMES_BASE_URL}/games?title=${encodeURIComponent(query)}&limit=${limit}&api_key=${MOBYGAMES_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`MobyGames API error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('MobyGames API response structure:', JSON.stringify(data.games?.[0], null, 2));
    
    // Transform the games data to include platform and image info
    const transformedGames = (data.games || []).map((game: any) => {
      // Get the first platform and its release date
      const firstPlatform = game.platforms?.[0];
      const platform = firstPlatform ? firstPlatform.platform_name : 'Unknown Platform';
      const releaseDate = firstPlatform ? firstPlatform.first_release_date : null;
      
      // Get the cover image
      const imageUrl = game.sample_cover?.image || null;
      
      return {
        game_id: game.game_id,
        title: game.title,
        platform,
        release_date: releaseDate,
        image_url: imageUrl
      };
    });
    
    return NextResponse.json({
      games: transformedGames,
      total: transformedGames.length
    });

  } catch (error) {
    console.error('MobyGames API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games from MobyGames' },
      { status: 500 }
    );
  }
} 