'use client';

import type { ScheduleGame } from '@/types';

interface Props {
  games: ScheduleGame[];
  month: number;
  year: number;
}

const DAYS = ['月', '火', '水', '木', '金', '土', '日'];

const RESULT_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  win:  { bg: 'var(--color-status-win-bg)',  text: 'var(--color-status-win)',  label: '○' },
  loss: { bg: 'var(--color-status-loss-bg)', text: 'var(--color-status-loss)', label: '●' },
  draw: { bg: 'var(--color-status-draw-bg)', text: 'var(--color-status-draw)', label: '△' },
};

export default function CalendarView({ games, month, year }: Props) {
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  const gameMap = new Map<number, ScheduleGame>();
  for (const g of games) {
    if (g.day) gameMap.set(g.day, g);
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  // 1 = Sun → convert to Mon-based (0=Mon … 6=Sun)
  const firstDow = new Date(year, month - 1, 1).getDay();
  const startOffset = (firstDow + 6) % 7; // shift so Monday = 0

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      {/* Month header */}
      <p className="text-sm font-bold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
        {year}年{month}月
      </p>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d, i) => (
          <div
            key={d}
            className="text-center text-xs font-medium py-1"
            style={{
              color: i === 5 ? '#0057a8' : i === 6 ? '#c8102e' : 'var(--color-text-secondary)',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px" style={{ background: 'var(--color-border-default)' }}>
        {cells.map((day, idx) => {
          if (!day) {
            return (
              <div key={`empty-${idx}`} className="h-20" style={{ background: 'var(--color-surface-elevated)' }} />
            );
          }

          const game = gameMap.get(day);
          const isToday = year === todayYear && month === todayMonth && day === todayDay;
          const dow = (idx) % 7; // 0=Mon … 6=Sun
          const isSat = dow === 5;
          const isSun = dow === 6;

          const resultStyle = game?.result ? RESULT_STYLE[game.result] : null;

          return (
            <div
              key={day}
              className="h-20 p-1 flex flex-col"
              style={{
                background: isToday ? 'var(--color-brand-light)' : 'var(--color-surface-default)',
              }}
            >
              {/* Day number */}
              <span
                className="text-xs font-bold leading-none mb-1 w-5 h-5 flex items-center justify-center rounded-full shrink-0"
                style={{
                  color: isToday
                    ? 'var(--color-text-inverse)'
                    : isSat
                    ? '#0057a8'
                    : isSun
                    ? '#c8102e'
                    : 'var(--color-text-primary)',
                  background: isToday ? 'var(--color-brand-primary)' : 'transparent',
                }}
              >
                {day}
              </span>

              {/* Game cell */}
              {game && (
                <div
                  className="flex-1 rounded text-xs px-1 py-0.5 overflow-hidden"
                  style={{
                    background: resultStyle?.bg ?? 'var(--color-surface-elevated)',
                    border: `1px solid ${resultStyle ? resultStyle.text : 'var(--color-border-default)'}`,
                  }}
                >
                  <div className="flex items-center gap-0.5 flex-wrap">
                    {resultStyle && (
                      <span className="font-bold" style={{ color: resultStyle.text }}>
                        {resultStyle.label}
                      </span>
                    )}
                    <span
                      className="font-medium truncate"
                      style={{ color: 'var(--color-text-primary)', fontSize: '0.65rem' }}
                    >
                      {game.isHome ? 'vs' : '@'}{game.opponent}
                    </span>
                  </div>
                  {game.score ? (
                    <p className="tabular-nums font-bold" style={{ color: 'var(--color-text-primary)', fontSize: '0.65rem' }}>
                      {game.score.baystars}-{game.score.opponent}
                    </p>
                  ) : game.time ? (
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.65rem' }}>{game.time}</p>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
