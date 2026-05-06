import { fetchBatterStats, fetchPitcherStats } from '@/lib/scraper';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') ?? 'batter';

  try {
    const data = type === 'pitcher' ? await fetchPitcherStats() : await fetchBatterStats();
    return Response.json(
      { data, type, updatedAt: new Date().toISOString() },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' } }
    );
  } catch {
    return Response.json({ error: 'データ取得に失敗しました' }, { status: 500 });
  }
}
