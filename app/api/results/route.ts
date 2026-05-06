import { fetchRecentResults } from '@/lib/scraper';

export async function GET() {
  try {
    const data = await fetchRecentResults();
    return Response.json(
      { data, updatedAt: new Date().toISOString() },
      { headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' } }
    );
  } catch {
    return Response.json({ error: 'データ取得に失敗しました' }, { status: 500 });
  }
}
