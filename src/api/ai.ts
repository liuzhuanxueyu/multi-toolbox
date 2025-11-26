/**
 * AI API 模拟接口
 */

export interface AIResponse {
  id: string;
  content: string;
  model: string;
  createdAt: string;
}

export interface AIRequest {
  prompt: string;
  model?: 'claude' | 'gpt' | 'sora';
}

const MOCK_DELAY = 1000;

export async function sendAIPrompt(request: AIRequest): Promise<AIResponse> {
  // 模拟 API 延迟
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
  
  const mockResponses: Record<string, string> = {
    claude: `这是来自 Claude 的模拟回复。\n\n您的问题是："${request.prompt}"\n\n我会尽力帮助您解决这个问题。`,
    gpt: `GPT 模拟回复：\n\n收到您的消息："${request.prompt}"\n\n这是一个模拟的响应内容。`,
    sora: `[视频生成模拟]\n\n提示词："${request.prompt}"\n\n状态：生成中...`,
  };
  
  const model = request.model || 'claude';
  
  return {
    id: crypto.randomUUID(),
    content: mockResponses[model],
    model,
    createdAt: new Date().toISOString(),
  };
}

