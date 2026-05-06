import { GoogleGenerativeAI } from '@google/generative-ai';

const AI_QUESTIONS = [
  '莉頑律縺ｮ隧ｦ蜷医・螻墓悍繧呈蕗縺医※',
  '莉翫す繝ｼ繧ｺ繝ｳ縺ｮ繝吶う繧ｹ繧ｿ繝ｼ繧ｺ縺ｮ螻墓悍縺ｯ・・,
  '迴ｾ蝨ｨ縺ｮ螂ｽ隱ｿ繝ｻ荳崎ｪｿ驕ｸ謇九・・・,
  '蜆ｪ蜍昴・蜿ｯ閭ｽ諤ｧ縺ｯ縺ｩ縺ｮ縺上ｉ縺・ｼ・,
  '譛霑・隧ｦ蜷医・謖ｯ繧願ｿ斐ｊ繧呈蕗縺医※',
  '莉雁ｹｴ縺ｮ繧ｭ繝ｼ繝励Ξ繧､繝､繝ｼ縺ｯ隱ｰ・・,
];

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: 'AI讖溯・繧貞茜逕ｨ縺吶ｋ縺ｫ縺ｯGemini API繧ｭ繝ｼ縺ｮ險ｭ螳壹′蠢・ｦ√〒縺吶・env.local縺ｫGEMINI_API_KEY繧定ｨｭ螳壹＠縺ｦ縺上□縺輔＞縲・ },
      { status: 503 }
    );
  }

  let question: string;
  try {
    const body = await request.json();
    question = body.question;
    if (!question || !AI_QUESTIONS.includes(question)) {
      return Response.json({ error: '辟｡蜉ｹ縺ｪ雉ｪ蝠上〒縺・ }, { status: 400 });
    }
  } catch {
    return Response.json({ error: '繝ｪ繧ｯ繧ｨ繧ｹ繝郁ｧ｣譫舌お繝ｩ繝ｼ' }, { status: 400 });
  }

  // 譛譁ｰ繝・・繧ｿ繧貞叙蠕暦ｼ亥・驛ｨAPI蜻ｼ縺ｳ蜃ｺ縺暦ｼ・
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
          `${s.rank}菴・${s.team} ${s.wins}蜍・{s.losses}謨・{s.draws}蛻・蜍晉紫${s.winRate}`
        )
        .join('\n');
    }

    if (resultsRes.status === 'fulfilled' && resultsRes.value?.data) {
      resultsText = resultsRes.value.data
        .slice(0, 5)
        .map((r: { date: string; opponent: string; result: string; score: { baystars: number; opponent: number } }) =>
          `${r.date} vs ${r.opponent} ${r.result === 'win' ? '笳・ : r.result === 'loss' ? '笳・ : '笆ｳ'} ${r.score.baystars}-${r.score.opponent}`
        )
        .join('\n');
    }
  } catch {
    // 繝・・繧ｿ蜿門ｾ怜､ｱ謨励＠縺ｦ繧・I蝗樒ｭ斐・邯夊｡・
  }

  const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });

  const systemPrompt = `縺ゅ↑縺溘・讓ｪ豬廛eNA繝吶う繧ｹ繧ｿ繝ｼ繧ｺ縺ｮ辭ｱ蠢・↑繝輔ぃ繝ｳ縺九▽驥守帥隗｣隱ｬ閠・〒縺吶・
莉･荳九・譛譁ｰ繝・・繧ｿ繧偵ｂ縺ｨ縺ｫ縲√ヵ繧｡繝ｳ縺瑚◇縺阪◆縺・ュ蝣ｱ繧呈律譛ｬ隱槭〒隧ｳ縺励￥縲√°縺､辭ｱ縺ｮ縺薙ｂ縺｣縺溯ｧ｣隱ｬ繧偵＠縺ｦ縺上□縺輔＞縲・
繝・・繧ｿ縺御ｸ榊ｮ悟・縺ｪ蝣ｴ蜷医・縲∽ｸ闊ｬ逧・↑驥守帥遏･隴倥→繝吶う繧ｹ繧ｿ繝ｼ繧ｺ縺ｮ譛霑代・蛯ｾ蜷代ｒ繧ゅ→縺ｫ蝗樒ｭ斐＠縺ｦ縺上□縺輔＞縲・

縲蝉ｻ頑律縺ｮ譌･莉倥・
${today}

縲千樟蝨ｨ縺ｮ鬆・ｽ搾ｼ医そ繝ｻ繝ｪ繝ｼ繧ｰ・峨・
${standingsText || '蜿門ｾ嶺ｸｭ...'}

縲千峩霑代・隧ｦ蜷育ｵ先棡・域ｨｪ豬廛eNA・峨・
${resultsText || '蜿門ｾ嶺ｸｭ...'}

雉ｪ蝠・ ${question}

蝗樒ｭ斐・300縲・00譁・ｭ礼ｨ句ｺｦ縺ｧ縲∝・菴鍋噪縺ｪ繝・・繧ｿ繧・∈謇句錐繧剃ｺ､縺医↑縺後ｉ隗｣隱ｬ縺励※縺上□縺輔＞縲Ａ;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });

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
    const message = err instanceof Error ? err.message : '荳肴・縺ｪ繧ｨ繝ｩ繝ｼ';
    if (message.includes('429') || message.includes('quota') || message.includes('Too Many Requests')) {
      return Response.json(
        { error: 'API縺ｮ蛻ｩ逕ｨ蛻ｶ髯舌↓驕斐＠縺ｾ縺励◆縲ゅ＠縺ｰ繧峨￥蠕・▲縺ｦ縺九ｉ蜀崎ｩｦ陦後＠縺ｦ縺上□縺輔＞・育┌譁呎棧: 15繝ｪ繧ｯ繧ｨ繧ｹ繝・蛻・ｼ峨・ },
        { status: 429 }
      );
    }
    if (message.includes('API_KEY') || message.includes('401') || message.includes('403')) {
      return Response.json(
        { error: 'API繧ｭ繝ｼ縺檎┌蜉ｹ縺ｧ縺吶・oogle AI Studio・・istudio.google.com・峨〒蜿門ｾ励＠縺滓ｭ｣縺励＞繧ｭ繝ｼ繧定ｨｭ螳壹＠縺ｦ縺上□縺輔＞縲・ },
        { status: 401 }
      );
    }
    return Response.json({ error: `AI逕滓・繧ｨ繝ｩ繝ｼ: ${message}` }, { status: 500 });
  }
}
