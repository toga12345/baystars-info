import type { StandingsRow } from '@/types';
import Card from '@/components/ui/Card';

export default function StandingsPreview({ standings }: { standings: StandingsRow[] }) {
  return (
    <Card title="セ・リーグ順位表">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border-default)' }}>
              {['順位', 'チーム', '勝', '敗', '分', '勝率', 'GB'].map(h => (
                <th
                  key={h}
                  className="pb-2 text-right first:text-left px-1"
                  style={{ color: 'var(--color-text-secondary)', fontWeight: 500, fontSize: '0.75rem' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => {
              const isBaystars = row.team.includes('横浜') || row.team.includes('DeNA');
              return (
                <tr
                  key={row.rank}
                  className="py-1"
                  style={{
                    borderBottom: '1px solid var(--color-border-default)',
                    backgroundColor: isBaystars ? 'var(--color-brand-light)' : undefined,
                  }}
                >
                  <td className="py-2 px-1 font-bold" style={{ color: isBaystars ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)' }}>
                    {row.rank}
                  </td>
                  <td className="py-2 px-1 font-medium" style={{ color: isBaystars ? 'var(--color-brand-primary)' : 'var(--color-text-primary)' }}>
                    {isBaystars ? '★ ' : ''}{row.team}
                  </td>
                  <td className="py-2 px-1 text-right tabular-nums">{row.wins}</td>
                  <td className="py-2 px-1 text-right tabular-nums">{row.losses}</td>
                  <td className="py-2 px-1 text-right tabular-nums">{row.draws}</td>
                  <td className="py-2 px-1 text-right tabular-nums">{row.winRate.toFixed(3)}</td>
                  <td className="py-2 px-1 text-right tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>
                    {row.gamesBack === 0 ? '-' : row.gamesBack}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
