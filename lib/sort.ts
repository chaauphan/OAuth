interface Game {
  id: number;
  mobyGamesId: number;
  title: string;
  platform: string;
  releaseDate?: string;
  imageUrl?: string;
  addedAt: string;
  playedAt?: string;
}

// ascending order
export function sortGamesByTitle(games: Game[]): Game[] {
  return [...games].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
  );
}

// recent > oldest
export function sortGamesByDatePlayed(games: Game[]): Game[] {
  return [...games].sort((a, b) => {
    // both null
    if (!a.playedAt && !b.playedAt) return 0;
    // a null
    if (!a.playedAt) return 1;
    // b null
    if (!b.playedAt) return -1;

    const dateA = new Date(a.playedAt);
    const dateB = new Date(b.playedAt);
    return dateB.getTime() - dateA.getTime();
  });
}
