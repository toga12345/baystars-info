import { fetchSchedule } from '@/lib/scraper';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default async function SchedulePage() {
  const schedule = await fetchSchedule();

  const today = new Date().toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
    .replace('年', '/').replace('月', '/').replace('日', '');

  return (
    <div className="space-y-5">
      <Card title="試合スケジュール">
        <div className="divide-y" style={{ borderColor: 'var(--color-border-default)' }}>
          {schedule.map((game, i) => {
            const isToday = game.date === today;
            const hasResult = game.result !== undefined;

            return (
              <div
                key={i}
                className="py-3 flex items-center justify-between gap-3 flex-wrap first:pt-0 last:pb-0"
                style={{
                  backgroundColor: isToday ? 'var(--color-brand-light)' : undefined,
                  margin: isToday ? '0 -1.25rem' : undefined,
                  padding: isToday ? '0.75rem 1.25rem' : undefined,
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Date */}
                  <div className="w-14 shrink-0">
                    <span
                      className="text-sm font-bold"
                      style={{ color: isToday ? 'var(--color-brand-primary)' : 'var(--color-text-primary)' }}
                    >
                      {game.date}
                    </span>
                    {isToday && (
                      <span className="block text-xs font-medium" style={{ color: 'var(--color-brand-accent)' }}>TODAY</span>
                    )}
                  </div>

                  {/* Game Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {game.isHome ? 'vs' : '@'} {game.opponent}
                      </span>
                      {hasResult && (
                        <Badge variant={game.result === 'win' ? 'win' : game.result === 'loss' ? 'loss' : 'draw'}>
                          {game.result === 'win' ? '○勝' : game.result === 'loss' ? '●負' : '△引'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {game.venue}{game.time ? ` / ${game.time}〜` : ''}
                    </p>
                  </div>
                </div>

                {/* Score or Time */}
                <div className="text-right">
                  {game.score ? (
                    <span className="text-base font-bold tabular-nums" style={{ color: 'var(--color-text-primary)' }}>
                      {game.score.baystars} - {game.score.opponent}
                    </span>
                  ) : game.time ? (
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{game.time}</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
