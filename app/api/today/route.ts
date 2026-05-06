import { fetchTodayGame } from '@/lib/scraper';

export async function GET() {
  try {
    const data = await fetchTodayGame();
    return Response.json(
      { data, updatedAt: new Date().toISOString() },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    );
  } catch {
    return Response.json({ error: 'データ取得に失敗しました' }, { status: 500 });
  }
}
