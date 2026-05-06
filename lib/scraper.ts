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

const now = new Date();
const currentMonth = now.getMonth() + 1;

const MOCK_TODAY: TodayGame = {
  date: `${currentMonth}/${now.getDate()}`,
  opponent: '広島',
  isHome: true,
  venue: '横浜スタジアム',
  startTime: '18:00',
  isGameDay: true,
};

const MOCK_SCHEDULE: ScheduleGame[] = [
  { date: '5/6', day: 6, month: 5, time: '18:00', opponent: '広島', isHome: true, venue: '横浜スタジアム' },
  { date: '5/7', day: 7, month: 5, time: '18:00', opponent: '広島', isHome: true, venue: '横浜スタジアム' },
  { date: '5/8', day: 8, month: 5, time: '18:00', opponent: '広島', isHome: true, venue: '横浜スタジアム' },
  { date: '5/10', day: 10, month: 5, time: '14:00', opponent: 'ヤクルト', isHome: false, venue: '神宮' },
  { date: '5/11', day: 11, month: 5, time: '14:00', opponent: 'ヤクルト', isHome: false, venue: '神宮' },
  { date: '5/13', day: 13, month: 5, time: '18:00', opponent: '中日', isHome: true, venue: '横浜スタジアム' },
];

const MOCK_BATTERS: BatterStats[] = [
  { name: '佐野恵太', avg: '.270', hr: 4, rbi: 19, games: 31 },
  { name: '度会隆輝', avg: '.290', hr: 3, rbi: 10, games: 29 },
  { name: '山本祐大', avg: '.253', hr: 1, rbi: 8, games: 24 },
  { name: '牧秀悟', avg: '.315', hr: 8, rbi: 28, games: 38 },
  { name: '宮崎敏郎', avg: '.298', hr: 5, rbi: 22, games: 35 },
];

const MOCK_PITCHERS: PitcherStats[] = [
  { name: '東克樹', era: '1.89', wins: 3, losses: 2, saves: 0, games: 6 },
  { name: '石田裕太郎', era: '2.45', wins: 2, losses: 3, saves: 0, games: 6 },
  { name: '山崎康晃', era: '1.80', wins: 1, losses: 0, saves: 8, games: 15 },
  { name: '伊勢大夢', era: '2.35', wins: 2, losses: 1, saves: 5, games: 20 },
  { name: 'バウアー', era: '3.12', wins: 4, losses: 2, saves: 0, games: 8 },
];

// --- Fetch Helpers ---

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: HEADERS,
    next: { revalidate: 600 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
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

    // カラム: 順位|チーム|試合|勝|負|分|勝率|差|...
    $('table').first().find('tbody tr').each((i, el) => {
      const cells = $(el).find('td');
      if (cells.length < 8) return;
      const rank = parseInt($(cells[0]).text().trim()) || i + 1;
      const team = $(cells[1]).text().trim();
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
    // スケジュールから結果が確定している試合のみ取得
    const schedule = await fetchSchedule();
    const finished = schedule.filter(g => g.result !== undefined && g.score !== undefined);
    if (finished.length >= 3) {
      return finished.slice(-10).reverse().map(g => ({
        date: g.date,
        opponent: g.opponent,
        score: g.score!,
        result: g.result!,
        isHome: g.isHome,
        venue: g.venue,
      }));
    }
    return MOCK_RESULTS;
  } catch {
    return MOCK_RESULTS;
  }
}

export async function fetchTodayGame(): Promise<TodayGame> {
  try {
    // baystars.co.jp の og:title から今日の試合情報を取得
    const html = await fetchHtml('https://www.baystars.co.jp/game/result');
    const $ = cheerio.load(html);
    const ogTitle = $('meta[property="og:title"]').attr('content') ?? '';

    // 例: "2026年5月6日(水) vs. 広島  セ・リーグ 公式戦  横浜"
    const dateMatch = ogTitle.match(/(\d+)年(\d+)月(\d+)日/);
    const vsMatch = ogTitle.match(/vs\.\s*(.+?)\s{2}/);

    if (dateMatch && vsMatch) {
      const pageYear = parseInt(dateMatch[1]);
      const pageMonth = parseInt(dateMatch[2]);
      const pageDay = parseInt(dateMatch[3]);
      const opponent = vsMatch[1].trim();

      // 末尾のスペース区切り最後の要素が球場
      const parts = ogTitle.split(/\s{2,}/);
      const venue = parts[parts.length - 1]?.trim() ?? '';
      const isHome = venue.includes('横浜') || venue.includes('ハマスタ');

      const today = new Date();
      const isToday =
        pageYear === today.getFullYear() &&
        pageMonth === today.getMonth() + 1 &&
        pageDay === today.getDate();

      return {
        date: `${pageMonth}/${pageDay}`,
        opponent,
        isHome,
        venue: venue || (isHome ? '横浜スタジアム' : ''),
        startTime: undefined,
        isGameDay: isToday,
      };
    }

    return { ...MOCK_TODAY, isGameDay: false };
  } catch {
    return MOCK_TODAY;
  }
}

export async function fetchSchedule(): Promise<ScheduleGame[]> {
  try {
    // Yahoo Sports Navi の DeNA スケジュールページ（カレンダー形式）
    const html = await fetchHtml('https://baseball.yahoo.co.jp/npb/teams/3/schedule');
    const $ = cheerio.load(html);
    const games: ScheduleGame[] = [];

    const pageNow = new Date();
    const month = pageNow.getMonth() + 1;
    const year = pageNow.getFullYear();

    $('.bb-calendarTable__data').each((_, el) => {
      const pkg = $(el).find('.bb-calendarTable__package');
      if (!pkg.length) return;

      const dayNum = parseInt(pkg.find('.bb-calendarTable__date').text().trim());
      if (!dayNum) return;

      // 試合なし
      if (pkg.find('.bb-calendarTable__noGame').length > 0) return;

      const opponent = pkg.find('.bb-calendarTable__teamName').text().replace(/\s+/g, '').trim();
      if (!opponent) return;

      // ホーム判定: .bb-calendarTable__data--home クラスがあればホームゲーム
      // （リンクの有無は全試合で一定のため使用不可）
      const isHome = $(el).hasClass('bb-calendarTable__data--home');

      // 時刻・会場
      const fullText = pkg.text();
      const timeMatch = fullText.match(/(\d{1,2}:\d{2})/);
      const time = timeMatch?.[1];

      // 会場: 「試合終了|試合前|試合中」の直後の単語
      const venueMatch = fullText.match(/試合(?:終了|前|中)\s+(\S+)/);
      const venue = venueMatch?.[1]?.trim() ?? (isHome ? '横浜' : opponent);

      // スコアと結果（スコア表記は常に「ホームスコア - アウェースコア」）
      const scoreMatch = fullText.match(/(\d+)\s*[\-－]\s*(\d+)/);
      let result: 'win' | 'loss' | 'draw' | undefined;
      let score: { baystars: number; opponent: number } | undefined;

      if (scoreMatch) {
        const homeScore = parseInt(scoreMatch[1]);
        const awayScore = parseInt(scoreMatch[2]);
        const deNAScore = isHome ? homeScore : awayScore;
        const oppScore  = isHome ? awayScore  : homeScore;
        score = { baystars: deNAScore, opponent: oppScore };
        result = deNAScore > oppScore ? 'win' : deNAScore < oppScore ? 'loss' : 'draw';
      }

      // 「試合前」「試合中」が含まれる場合はスコアなし
      if (fullText.includes('試合前') || fullText.includes('試合中')) {
        score = undefined;
        result = undefined;
      }

      games.push({
        date: `${month}/${dayNum}`,
        day: dayNum,
        month,
        year,
        opponent,
        isHome,
        venue,
        time,
        result,
        score,
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

    // カラム: 背番号|選手名|打率|試合|打席数|打数|安打|本塁打|打点|盗塁|...
    $('table tbody tr').each((_, el) => {
      const cells = $(el).find('td');
      if (cells.length < 9) return;
      const name = $(cells[1]).text().trim().replace(/\s+/g, '');
      if (!name) return;
      stats.push({
        name,
        avg: $(cells[2]).text().trim() || '.000',   // 打率
        games: parseInt($(cells[3]).text()) || 0,   // 試合
        hr: parseInt($(cells[7]).text()) || 0,      // 本塁打
        rbi: parseInt($(cells[8]).text()) || 0,     // 打点
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

    // [0]背番号 [1]選手名 [2]防御率 [3]試合 [4]勝利 [5]敗北 [6]セーブ [7]ホールド ...
    const toInt = (s: string): number => { const n = parseInt(s.trim(), 10); return isNaN(n) ? 0 : n; };
    $('table tbody tr').each((_, el) => {
      const cells = $(el).find('td');
      if (cells.length < 8) return;
      const jerseyNo = $(cells[0]).text().trim();
      if (!/^\d+$/.test(jerseyNo)) return; // ヘッダー混入行をスキップ
      const name = $(cells[1]).text().trim().replace(/\s+/g, '');
      if (!name) return;
      stats.push({
        name,
        era: $(cells[2]).text().trim() || '0.00',  // [2] 防御率
        games: toInt($(cells[3]).text()),           // [3] 試合
        wins: toInt($(cells[4]).text()),            // [4] 勝利
        losses: toInt($(cells[5]).text()),          // [5] 敗北
        saves: toInt($(cells[6]).text()),           // [6] セーブ
      });
    });

    return stats.length > 0 ? stats.slice(0, 20) : MOCK_PITCHERS;
  } catch {
    return MOCK_PITCHERS;
  }
}
