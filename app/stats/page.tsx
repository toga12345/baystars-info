'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { BatterStats, PitcherStats } from '@/types';

type Tab = 'batter' | 'pitcher';

export default function StatsPage() {
  const [tab, setTab] = useState<Tab>('batter');
  const [batters, setBatters] = useState<BatterStats[]>([]);
  const [pitchers, setPitchers] = useState<PitcherStats[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/stats?type=${tab}`);
        const json = await res.json();
        if (tab === 'batter') setBatters(json.data ?? []);
        else setPitchers(json.data ?? []);
      } catch {
        /* fallback handled by API */
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [tab]);

  return (
    <div className="space-y-5">
      {/* Tab */}
      <div className="flex gap-2">
        {(['batter', 'pitcher'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-5 py-2 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor: tab === t ? 'var(--color-brand-primary)' : 'var(--color-surface-default)',
              color: tab === t ? 'white' : 'var(--color-text-secondary)',
              border: `1px solid ${tab === t ? 'var(--color-brand-primary)' : 'var(--color-border-default)'}`,
            }}
          >
            {t === 'batter' ? '打者成績' : '投手成績'}
          </button>
        ))}
      </div>

      <Card title={tab === 'batter' ? '打者成績' : '投手成績'}>
        {loading ? (
          <LoadingSpinner />
        ) : tab === 'batter' ? (
          <BatterTable batters={batters} />
        ) : (
          <PitcherTable pitchers={pitchers} />
        )}
      </Card>
    </div>
  );
}

function BatterTable({ batters }: { batters: BatterStats[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border-default)' }}>
            {['選手名', '試合', '打率', '本塁打', '打点'].map(h => (
              <th
                key={h}
                className="pb-2 text-right first:text-left px-2"
                style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', fontWeight: 500 }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {batters.map((b, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--color-border-default)' }}>
              <td className="py-2 px-2 font-medium" style={{ color: 'var(--color-text-primary)' }}>{b.name}</td>
              <td className="py-2 px-2 text-right tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>{b.games}</td>
              <td className="py-2 px-2 text-right tabular-nums font-bold" style={{ color: 'var(--color-brand-primary)' }}>{b.avg}</td>
              <td className="py-2 px-2 text-right tabular-nums">{b.hr}</td>
              <td className="py-2 px-2 text-right tabular-nums">{b.rbi}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PitcherTable({ pitchers }: { pitchers: PitcherStats[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border-default)' }}>
            {['選手名', '試合', '防御率', '勝', '敗', 'S'].map(h => (
              <th
                key={h}
                className="pb-2 text-right first:text-left px-2"
                style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', fontWeight: 500 }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pitchers.map((p, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--color-border-default)' }}>
              <td className="py-2 px-2 font-medium" style={{ color: 'var(--color-text-primary)' }}>{p.name}</td>
              <td className="py-2 px-2 text-right tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>{p.games}</td>
              <td className="py-2 px-2 text-right tabular-nums font-bold" style={{ color: 'var(--color-brand-primary)' }}>{p.era}</td>
              <td className="py-2 px-2 text-right tabular-nums">{p.wins}</td>
              <td className="py-2 px-2 text-right tabular-nums">{p.losses}</td>
              <td className="py-2 px-2 text-right tabular-nums">{p.saves}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
