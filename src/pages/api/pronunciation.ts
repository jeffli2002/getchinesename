import type { NextApiRequest, NextApiResponse } from 'next';

// 模拟的API响应类型
type PronunciationResponse = {
  audioUrl: string;
}

// 模拟的错误响应类型
type ErrorResponse = {
  error: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<PronunciationResponse | ErrorResponse>
) {
  // 只接受POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed, only POST requests are supported' });
  }

  try {
    // 解析请求体中的文本
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Missing text parameter' });
    }

    // 在实际应用中，这里应该调用真实的TTS API
    // 例如Google Cloud TTS、Azure TTS或其他服务生成音频

    // 模拟：简单返回一个静态音频URL
    // 实际项目中应该返回一个真实的音频URL
    const audioUrl = `/audio/pronunciation-${encodeURIComponent(text.toLowerCase())}.mp3`;

    // 返回音频URL
    return res.status(200).json({ audioUrl });
  } catch (error) {
    console.error('Error generating pronunciation:', error);
    return res.status(500).json({ error: 'Failed to generate pronunciation' });
  }
} 