import { Suspense } from 'react';
import { fetchTodayGame, fetchRecentResults, fetchStandings } from '@/lib/scraper';
import TodayGameCard from '@/components/features/TodayGame';
import RecentResults from '@/components/features/RecentResults';
import StandingsPreview from '@/components/features/StandingsPreview';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

async function TodaySection() {
  const game = await fetchTodayGame();
  return <TodayGameCard game={game} />;
}

async function ResultsSection() {
  const results = await fetchRecentResults();
  return <RecentResults results={results} />;
}

async function StandingsSection() {
  const standings = await fetchStandings();
  return <StandingsPreview standings={standings} />;
}

export default function HomePage() {
  return (
    <div className="space-y-5">
      <Suspense fallback={<LoadingSpinner />}>
        <TodaySection />
      </Suspense>

      <div className="grid md:grid-cols-2 gap-5">
        <Suspense fallback={<LoadingSpinner />}>
          <ResultsSection />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <StandingsSection />
        </Suspense>
      </div>
    </div>
  );
}
