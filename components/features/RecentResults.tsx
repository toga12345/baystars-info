import type { GameResult } from '@/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default function RecentResults({ results }: { results: GameResult[] }) {
  return (
    <Card title="直近の試合結果">
      <div className="divide-y" style={{ borderColor: 'var(--color-border-default)' }}>
        {results.slice(0, 5).map((game, i) => (
          <div key={i} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3">
              <Badge variant={game.result === 'win' ? 'win' : game.result === 'loss' ? 'loss' : 'draw'}>
                {game.result === 'win' ? '○' : game.result === 'loss' ? '●' : '△'}
              </Badge>
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {game.isHome ? 'vs' : '@'} {game.opponent}
                </span>
                <span className="text-xs ml-2" style={{ color: 'var(--color-text-secondary)' }}>
                  {game.venue}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--color-text-primary)' }}>
                {game.score.baystars} - {game.score.opponent}
              </span>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{game.date}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
