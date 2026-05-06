import type { TodayGame } from '@/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default function TodayGameCard({ game }: { game: TodayGame }) {
  const resultLabel = game.result === 'win' ? '○ 勝利' : game.result === 'loss' ? '● 敗戦' : '△ 引分';
  const resultVariant = game.result === 'win' ? 'win' : game.result === 'loss' ? 'loss' : 'draw';

  if (!game.isGameDay) {
    return (
      <Card title="今日の試合">
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          本日は試合がありません
        </p>
      </Card>
    );
  }

  return (
    <Card title="今日の試合">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Match Info */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {game.isHome ? 'vs' : '@'} {game.opponent}
            </span>
            {game.result && <Badge variant={resultVariant}>{resultLabel}</Badge>}
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {game.venue}
            {game.startTime && ` / ${game.startTime}〜`}
          </p>
        </div>

        {/* Score */}
        {game.score ? (
          <div className="text-center">
            <div
              className="text-3xl font-bold tabular-nums"
              style={{ color: 'var(--color-brand-primary)' }}
            >
              {game.score.baystars}
              <span className="text-lg mx-2" style={{ color: 'var(--color-text-secondary)' }}>-</span>
              {game.score.opponent}
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              横浜 - {game.opponent}
            </p>
          </div>
        ) : (
          <div
            className="px-5 py-2 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: 'var(--color-brand-light)',
              color: 'var(--color-brand-primary)',
            }}
          >
            {game.startTime ?? '時間未定'}〜 試合予定
          </div>
        )}
      </div>
    </Card>
  );
}
