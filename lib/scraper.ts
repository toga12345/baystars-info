import * as cheerio from 'cheerio';
import type { GameResult, StandingsRow, BatterStats, PitcherStats, ScheduleGame, TodayGame } from '@/types';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
};

// --- Mock Data (fallback) ---

const MOCK_STANDINGS: StandingsRow[] = [
  { rank: 1, team: '横浜DeNA', wins: 25, losses: 15, draws: 2, winRate: 0.625, gamesBack: 0 },
  { rank: 2, team: '阪神', wins: 23, losses: 18, draws: 1, winRate: 0.561, gamesBack: 3.5 },
  { rank: 3, team: '広島', wins: 21, losses: 19, draws: 2, winRate: 0.525, gamesBack: 5.0 },
  { rank: 4, team: 'ヤクルト', wins: 19, losses: 22, draws: 1, winRate: 0.463, gamesBack: 7.5 },
  { rank: 5, team: '巨人', wins: 18, losses: 23, draws: 0, winRate: 0.439, gamesBack: 8.5 },
  { rank: 6, team: '中日', wins: 16, losses: 25, draws: 1, winRate: 0.390, gamesBack: 10.5 },
];

const MOCK_RESULTS: GameResult[] = [
  { date: '5/5', opponent: '広島', score: { baystars: 5, opponent: 3 }, result: 'win', isHome: false, venue: 'マツダ' },
  { date: '5/4', opponent: '広島', score: { baystars: 2, opponent: 4 }, result: 'loss', isHome: false, venue: 'マツダ' },
  { date: '5/3', opponent: '広島', score: { baystars: 7, opponent: 1 }, result: 'win', isHome: false, venue: 'マツダ' },
  { date: '5/1', opponent: '巨人', score: { baystars: 3, opponent: 3 }, result: 'draw', isHome: true, venue: '横浜' },
  { date: '4/30', opponent: '巨人', score: { baystars: 4, opponent: 2 }, result: 'win', isHome: true, venue: '横浜' },
];

const MOCK_TODAY: TodayGame = {
  date: new Date().toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
  opponent: '阪神',
  isHome: true,
  venue: '横浜スタジアム',
  startTime: '18:00',
  isGameDay: true,
};

const MOCK_SCHEDULE: ScheduleGame[] = [
  { date: '5/6', time: '18:00', opponent: '阪神', isHome: true, venue: '横浜スタジアム' },
  { date: '5/7', time: '18:00', opponent: '阪神', isHome: true, venue: '横浜スタジアム' },
  { date: '5/8', time: '18:00', opponent: '阪神', isHome: true, venue: '横浜スタジアム' },
  { date: '5/10', time: '14:00', opponent: 'ヤクルト', isHome: false, venue: '神宮' },
  { date: '5/11', time: '14:00', opponent: 'ヤクルト', isHome: false, venue: '神宮' },
  { date: '5/13', time: '18:00', opponent: '中日', isHome: true, venue: '横浜スタジアム' },
];

const MOCK_BATTERS: BatterStats[] = [
  { name: '牧秀悟', avg: '.315', hr: 8, rbi: 28, games: 38 },
  { name: '宮崎敏郎', avg: '.298', hr: 5, rbi: 22, games: 35 },
  { name: '佐野恵太', avg: '.287', hr: 6, rbi: 25, games: 40 },
  { name: '桑原将志', avg: '.275', hr: 3, rbi: 15, games: 38 },
  { name: 'オースティン', avg: '.268', hr: 10, rbi: 30, games: 36 },
];

const MOCK_PITCHERS: PitcherStats[] = [
  { name: '東克樹', era: '2.15', wins: 5, losses: 2, saves: 0, games: 9 },
  { name: '今永昇太', era: '2.48', wins: 4, losses: 3, saves: 0, games: 8 },
  { name: 'バウアー', era: '3.12', wins: 4, losses: 2, saves: 0, games: 8 },
  { name: '山崎康晃', era: '1.80', wins: 1, losses: 0, saves: 12, games: 18 },
  { name: '伊勢大夢', era: '2.35', wins: 2, losses: 1, saves: 5, games: 20 },
];

// --- Fetch Helpers ---

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: HEADERS,
    next: { revalidate: 1800 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  // Content-Type で Shift-JIS 等の場合も正しく扱う
  const contentType = res.headers.get('content-type') ?? '';
  const isShiftJis = /shift.jis|sjis/i.test(contentType);
  const isEucJp = /euc.jp/i.test(contentType);
  if (isShiftJis || isEucJp) {
    const buf = await res.arrayBuffer();
    return new TextDecoder(isShiftJis ? 'shift-jis' : 'euc-jp').decode(buf);
  }
  return res.text();
}

// --- Public Functions ---

export async function fetchStandings(): Promise<StandingsRow[]> {
  try {
    const html = await fetchHtml('https://baseball.yahoo.co.jp/npb/standings/');
    const $ = cheerio.load(html);
    const rows: StandingsRow[] = [];

    // 順位表カラム: 順位|チーム|試合|勝|負|分|勝率|差
    $('table').first().find('tbody tr').each((i, el) => {
      const cells = $(el).find('td');
      if (cells.length < 8) return;
      const rank = parseInt($(cells[0]).text().trim()) || i + 1;
      const team = $(cells[1]).text().trim();
      // cells[2] = 試合数（スキップ）
      const wins = parseInt($(cells[3]).text().trim()) || 0;
      const losses = parseInt($(cells[4]).text().trim()) || 0;
      const draws = parseInt($(cells[5]).text().trim()) || 0;
      const winRate = parseFloat($(cells[6]).text().trim()) || 0;
      const gbText = $(cells[7]).text().trim();
      const gamesBack = gbText === '-' || gbText === '' ? 0 : parseFloat(gbText) || 0;
      if (team) rows.push({ rank, team, wins, losses, draws, winRate, gamesBack });
    });

    return rows.length >= 6 ? rows : MOCK_STANDINGS;
  } catch {
    return MOCK_STANDINGS;
  }
}

export async function fetchRecentResults(): Promise<GameResult[]> {
  try {
    const html = await fetchHtml('https://baseball.yahoo.co.jp/npb/teams/25/schedule');
    const $ = cheerio.load(html);
    const results: GameResult[] = [];

    $('table tr').each((_, el) => {
      const cells = $(el).find('td');
      if (cells.length < 5) return;
      const dateText = $(cells[0]).text().trim();
      const opponentText = $(cells[1]).text().trim().replace(/^[○●△@]/, '').trim();
      const scoreText = $(cells[2]).text().trim();
      const resultText = $(cells[0]).text().trim();

      if (!dateText || !opponentText) return;

      const scoreMatch = scoreText.match(/(\d+)-(\d+)/);
      if (!scoreMatch) return;

      const isWin = resultText.includes('○') || resultText.includes('勝');
      const isLoss = resultText.includes('●') || resultText.includes('負');
      const result: 'win' | 'loss' | 'draw' = isWin ? 'win' : isLoss ? 'loss' : 'draw';

      results.push({
        date: dateText,
        opponent: opponentText || '未定',
        score: { baystars: parseInt(scoreMatch[1]), opponent: parseInt(scoreMatch[2]) },
        result,
        isHome: !$(cells[1]).text().includes('@'),
        venue: '横浜',
      });
    });

    const finished = results.filter(r => r.score);
    return finished.length > 0 ? finished.slice(0, 10) : MOCK_RESULTS;
  } catch {
    return MOCK_RESULTS;
  }
}

export async function fetchTodayGame(): Promise<TodayGame> {
  try {
    const today = new Date();
    const dateStr = `${today.getMonth() + 1}/${today.getDate()}`;

    const schedule = await fetchSchedule();
    const todayGame = schedule.find(g => g.date === dateStr);

    if (todayGame) {
      return {
        date: todayGame.date,
        opponent: todayGame.opponent,
        isHome: todayGame.isHome,
        venue: todayGame.venue,
        startTime: todayGame.time,
        result: todayGame.result,
        score: todayGame.score,
        isGameDay: true,
      };
    }

    return { ...MOCK_TODAY, isGameDay: false, date: dateStr };
  } catch {
    return MOCK_TODAY;
  }
}

export async function fetchSchedule(): Promise<ScheduleGame[]> {
  try {
    const html = await fetchHtml('https://baseball.yahoo.co.jp/npb/teams/25/schedule');
    const $ = cheerio.load(html);
    const games: ScheduleGame[] = [];

    $('table tr').each((_, el) => {
      const cells = $(el).find('td');
      if (cells.length < 3) return;

      const dateText = $(cells[0]).text().trim().split('(')[0];
      const gameInfo = $(cells[1]).text().trim();
      if (!dateText || !gameInfo) return;

      const isHome = !gameInfo.startsWith('@');
      const opponent = gameInfo.replace(/^[@○●△\s]+/, '').trim().split(/\s/)[0];
      const scoreMatch = $(cells[2]).text().match(/(\d+)-(\d+)/);
      const resultChar = $(cells[0]).text();

      games.push({
        date: dateText,
        time: $(cells[3])?.text().trim() || undefined,
        opponent: opponent || '未定',
        isHome,
        venue: isHome ? '横浜スタジアム' : `${opponent}主催`,
        result: resultChar.includes('○') ? 'win' : resultChar.includes('●') ? 'loss' : resultChar.includes('△') ? 'draw' : undefined,
        score: scoreMatch ? { baystars: parseInt(scoreMatch[1]), opponent: parseInt(scoreMatch[2]) } : undefined,
      });
    });

    return games.length > 0 ? games : MOCK_SCHEDULE;
  } catch {
    return MOCK_SCHEDULE;
  }
}

export async function fetchBatterStats(): Promise<BatterStats[]> {
  try {
    const html = await fetchHtml('https://baseball-data.com/stats/hitter-yb/');
    const $ = cheerio.load(html);
    const stats: BatterStats[] = [];

    $('table tbody tr').each((_, el) => {
      const cells = $(el).find('td');
      if (cells.length < 8) return;
      const name = $(cells[1]).text().trim();
      if (!name) return;
      stats.push({
        name,
        games: parseInt($(cells[2]).text()) || 0,
        avg: $(cells[3]).text().trim() || '.000',
        hr: parseInt($(cells[5]).text()) || 0,
        rbi: parseInt($(cells[6]).text()) || 0,
      });
    });

    return stats.length > 0 ? stats.slice(0, 20) : MOCK_BATTERS;
  } catch {
    return MOCK_BATTERS;
  }
}

export async function fetchPitcherStats(): Promise<PitcherStats[]> {
  try {
    const html = await fetchHtml('https://baseball-data.com/stats/pitcher-yb/');
    const $ = cheerio.load(html);
    const stats: PitcherStats[] = [];

    $('table tbody tr').each((_, el) => {
      const cells = $(el).find('td');
      if (cells.length < 8) return;
      const name = $(cells[1]).text().trim();
      if (!name) return;
      stats.push({
        name,
        games: parseInt($(cells[2]).text()) || 0,
        era: $(cells[3]).text().trim() || '0.00',
        wins: parseInt($(cells[4]).text()) || 0,
        losses: parseInt($(cells[5]).text()) || 0,
        saves: parseInt($(cells[6]).text()) || 0,
      });
    });

    return stats.length > 0 ? stats.slice(0, 20) : MOCK_PITCHERS;
  } catch {
    return MOCK_PITCHERS;
  }
}
