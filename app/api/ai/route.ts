import { GoogleGenerativeAI } from '@google/generative-ai';

const AI_QUESTIONS = [
  '今日の試合の展望を教えて',
  '今シーズンのベイスターズの展望は？',
  '現在の好調・不調選手は？',
  '優勝の可能性はどのくらい？',
  '最近5試合の振り返りを教えて',
  '今年のキープレイヤーは誰？',
];

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: 'AI機能を利用するにはGemini APIキーの設定が必要です。.env.localにGEMINI_API_KEYを設定してください。' },
      { status: 503 }
    );
  }

  let question: string;
  try {
    const body = await request.json();
    question = body.question;
    if (!question || !AI_QUESTIONS.includes(question)) {
      return Response.json({ error: '無効な質問です' }, { status: 400 });
    }
  } catch {
    return Response.json({ error: 'リクエスト解析エラー' }, { status: 400 });
  }

  // 最新データを取得（内部API呼び出し）
  let standingsText = '';
  let resultsText = '';
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    const [standingsRes, resultsRes] = await Promise.allSettled([
      fetch(`${baseUrl}/api/standings`).then(r => r.json()),
      fetch(`${baseUrl}/api/results`).then(r => r.json()),
    ]);

    if (standingsRes.status === 'fulfilled' && standingsRes.value?.data) {
      standingsText = standingsRes.value.data
        .map((s: { rank: number; team: string; wins: number; losses: number; draws: number; winRate: number }) =>
          `${s.rank}位 ${s.team} ${s.wins}勝${s.losses}敗${s.draws}分 勝率${s.winRate}`
        )
        .join('\n');
    }

    if (resultsRes.status === 'fulfilled' && resultsRes.value?.data) {
      resultsText = resultsRes.value.data
        .slice(0, 5)
        .map((r: { date: string; opponent: string; result: string; score: { baystars: number; opponent: number } }) =>
          `${r.date} vs ${r.opponent} ${r.result === 'win' ? '○' : r.result === 'loss' ? '●' : '△'} ${r.score.baystars}-${r.score.opponent}`
        )
        .join('\n');
    }
  } catch {
    // データ取得失敗してもAI回答は続行
  }

  const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });

  const systemPrompt = `あなたは横浜DeNAベイスターズの熱心なファンかつ野球解説者です。
以下の最新データをもとに、ファンが聞きたい情報を日本語で詳しく、かつ熱のこもった解説をしてください。
データが不完全な場合は、一般的な野球知識とベイスターズの最近の傾向をもとに回答してください。

【今日の日付】
${today}

【現在の順位（セ・リーグ）】
${standingsText || '取得中...'}

【直近の試合結果（横浜DeNA）】
${resultsText || '取得中...'}

質問: ${question}

回答は300〜500文字程度で、具体的なデータや選手名を交えながら解説してください。`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContentStream(systemPrompt);

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '不明なエラー';
    return Response.json({ error: `AI生成エラー: ${message}` }, { status: 500 });
  }
}
