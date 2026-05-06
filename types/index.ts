export interface GameResult {
  date: string;
  opponent: string;
  score: { baystars: number; opponent: number };
  result: 'win' | 'loss' | 'draw';
  isHome: boolean;
  venue: string;
}

export interface StandingsRow {
  rank: number;
  team: string;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  gamesBack: number;
}

export interface BatterStats {
  name: string;
  avg: string;
  hr: number;
  rbi: number;
  games: number;
}

export interface PitcherStats {
  name: string;
  era: string;
  wins: number;
  losses: number;
  saves: number;
  games: number;
}

export interface ScheduleGame {
  date: string;
  time?: string;
  opponent: string;
  isHome: boolean;
  venue: string;
  result?: 'win' | 'loss' | 'draw';
  score?: { baystars: number; opponent: number };
}

export interface TodayGame {
  date: string;
  opponent: string;
  isHome: boolean;
  venue: string;
  startTime?: string;
  result?: 'win' | 'loss' | 'draw';
  score?: { baystars: number; opponent: number };
  isGameDay: boolean;
}
