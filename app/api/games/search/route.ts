import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

const MOBYGAMES_API_KEY = process.env.MOBYGAMES_API_KEY;
const MOBYGAMES_BASE_URL = 'https://api.mobygames.com/v1';

const DEFAULT_CACHE_TTL_SECONDS = Number(process.env.SEARCH_CACHE_TTL_SECONDS || 0); 

interface MobyGamesPlatform {
  platform_name: string;
  first_release_date: string;
}

interface MobyGamesCover {
  image: string;
}

interface MobyGamesGame {
  game_id: number;
  title: string;
  platforms?: MobyGamesPlatform[];
  sample_cover?: MobyGamesCover;
}

type searchResponse ={
  games: Array<{
    game_id: number;
    title: string;
    platform: string;
    release_date: string | null;
    image_url: string | null;
  }>;
  total: number;
}

function cacheKey(query: string, limit: string | null): string {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedLimit = limit || '10';
  return `search:v1:q=${normalizedQuery}|limit=${normalizedLimit}`;
}

async function getCachedData(cacheKey: string): Promise<searchResponse | null> {
  try {
    const cached = await prisma.searchCache.findUnique({
      where: { key: cacheKey },
      select: { data: true, expiresAt: true },
    });
    
    if (cached && cached.expiresAt > new Date()) {
      console.log('[CACHE] Cache hit for key:', cacheKey);
      return cached.data as searchResponse;
    }
    
    if (cached) {
      await prisma.searchCache.delete({ where: { key: cacheKey } });
    }
    return null;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

async function setCachedData(cacheKey: string, data: searchResponse, ttlSeconds: number): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    
    await prisma.searchCache.upsert({
      where: { key: cacheKey },
      create: {
        key: cacheKey,
        data: data as any, 
        expiresAt,
      },
      update: {
        data: data as any,
        expiresAt,
      },
    });

    console.log('Data cached for key:', cacheKey, 'expires at:', expiresAt.toISOString());
  } 
  
  catch (error) {
    console.error('Error writing to cache:', error);
  }
}

async function fetchFromUpstream(query: string, limit: string): Promise<searchResponse> {
  console.log('Fetching from upstream API for query:', query);
  
  const response = await fetch(
    `${MOBYGAMES_BASE_URL}/games?title=${encodeURIComponent(query)}&limit=${limit}&api_key=${MOBYGAMES_API_KEY}`,
    { cache: 'no-store' } 
  );

  if (!response.ok) {
    throw new Error(`MobyGames API error: ${response.status}`);
  }

  const data = await response.json();
  
  const transformedGames = (data.games || []).map((game: MobyGamesGame) => {
    const firstPlatform = game.platforms?.[0];
    const platform = firstPlatform ? firstPlatform.platform_name : 'Unknown Platform';
    const releaseDate = firstPlatform ? firstPlatform.first_release_date : null;
    const imageUrl = game.sample_cover?.image || null;
    
    return {
      game_id: game.game_id,
      title: game.title,
      platform,
      release_date: releaseDate,
      image_url: imageUrl
    };
  });
  
  return {
    games: transformedGames,
    total: transformedGames.length
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const limit = searchParams.get('limit') || '10';
  const forceRefresh = searchParams.get('forceRefresh') === '1';
  const ttlSeconds = Number(searchParams.get('ttl')) || DEFAULT_CACHE_TTL_SECONDS;

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  if (!MOBYGAMES_API_KEY) {
    return NextResponse.json({ error: 'MobyGames API key not configured' }, { status: 500 });
  }

  const key = cacheKey(query, limit);


  try {
    if (!forceRefresh) {
      const cached = await getCachedData(key);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    else {
      console.log('Force refresh requested');
    }

    const freshData = await fetchFromUpstream(query, limit);
    await setCachedData(key, freshData, ttlSeconds);

    return NextResponse.json(freshData);
  }

  catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games from MobyGames' },
      { status: 500 }
    );
  }


    /*
    const response = await fetch(
      `${MOBYGAMES_BASE_URL}/games?title=${encodeURIComponent(query)}&limit=${limit}&api_key=${MOBYGAMES_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`MobyGames API error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('MobyGames API response structure:', JSON.stringify(data.games?.[0], null, 2));
    
    const transformedGames = (data.games || []).map((game: MobyGamesGame) => {
      // Get the first platform and its release date
      const firstPlatform = game.platforms?.[0];
      const platform = firstPlatform ? firstPlatform.platform_name : 'Unknown Platform';
      const releaseDate = firstPlatform ? firstPlatform.first_release_date : null;
      
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
  }*/
} 