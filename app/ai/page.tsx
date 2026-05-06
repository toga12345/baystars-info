'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const QUESTIONS = [
  { id: 1, label: '今日の試合の展望を教えて', icon: '⚾' },
  { id: 2, label: '今シーズンのベイスターズの展望は？', icon: '📊' },
  { id: 3, label: '現在の好調・不調選手は？', icon: '👤' },
  { id: 4, label: '優勝の可能性はどのくらい？', icon: '🏆' },
  { id: 5, label: '最近5試合の振り返りを教えて', icon: '📅' },
  { id: 6, label: '今年のキープレイヤーは誰？', icon: '⭐' },
];

export default function AiPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const askAI = async (question: string) => {
    setSelected(question);
    setAnswer('');
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'エラーが発生しました');
        return;
      }

      // ストリーミング読み取り
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setAnswer(prev => prev + decoder.decode(value, { stream: true }));
      }
    } catch {
      setError('通信エラーが発生しました。しばらくしてからお試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div
        className="rounded-xl p-6"
        style={{
          background: 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))',
          color: 'white',
        }}
      >
        <h1 className="text-xl font-bold mb-1">AI 展望・解説</h1>
        <p className="text-sm opacity-90">
          質問を選ぶと、AIが最新データをもとにベイスターズの情報を解説します
        </p>
        <div
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />
          Powered by Google Gemini 1.5 Flash（無料）
        </div>
      </div>

      {/* Questions Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {QUESTIONS.map((q) => {
          const isActive = selected === q.label;
          return (
            <button
              key={q.id}
              onClick={() => askAI(q.label)}
              disabled={loading}
              className="text-left rounded-xl p-4 transition-all duration-200 disabled:opacity-60"
              style={{
                backgroundColor: isActive ? 'var(--color-brand-primary)' : 'var(--color-surface-default)',
                color: isActive ? 'white' : 'var(--color-text-primary)',
                border: `2px solid ${isActive ? 'var(--color-brand-primary)' : 'var(--color-border-default)'}`,
                boxShadow: isActive ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              <span className="text-2xl block mb-2">{q.icon}</span>
              <span className="text-sm font-medium leading-snug">{q.label}</span>
            </button>
          );
        })}
      </div>

      {/* Answer Area */}
      {(loading || answer || error) && (
        <Card title={selected ?? 'AI回答'}>
          {loading && !answer && <LoadingSpinner />}

          {error && (
            <div
              className="rounded-lg p-4 text-sm"
              style={{
                backgroundColor: 'var(--color-status-loss-bg)',
                color: 'var(--color-status-loss)',
              }}
            >
              <strong>エラー:</strong> {error}
              {error.includes('APIキー') && (
                <p className="mt-2 text-xs">
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Google AI Studio
                  </a>
                  でAPIキーを無料取得し、環境変数 GEMINI_API_KEY に設定してください。
                </p>
              )}
            </div>
          )}

          {answer && (
            <div
              className="text-sm leading-relaxed"
              style={{
                color: 'var(--color-text-primary)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {answer}
              {loading && (
                <span
                  className="inline-block w-0.5 h-4 ml-0.5 animate-pulse"
                  style={{ backgroundColor: 'var(--color-brand-primary)', verticalAlign: 'middle' }}
                />
              )}
            </div>
          )}
        </Card>
      )}

      {/* Info */}
      {!selected && (
        <div
          className="rounded-xl p-4 text-sm"
          style={{
            backgroundColor: 'var(--color-surface-overlay)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border-default)',
          }}
        >
          上の質問ボタンをクリックすると、AIが現在の順位・直近成績をもとに解説します。
          初回は少し時間がかかる場合があります。
        </div>
      )}
    </div>
  );
}
