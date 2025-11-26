/**
 * AI API 接口
 * 支持 AiHubMix (https://aihubmix.com/) 及其他 OpenAI 兼容接口
 */

export interface AIResponse {
  id: string;
  content: string;
  model: string;
  createdAt: string;
}

export interface AIRequest {
  prompt: string;
  model?: string;
}

export interface AIConfig {
  apiKey: string;
  apiBase: string;
  model: string;
}

/**
 * 调用 AI API（支持 OpenAI 兼容格式）
 */
export async function sendAIPrompt(
  request: AIRequest,
  config: AIConfig
): Promise<AIResponse> {
  const { prompt, model } = request;
  const { apiKey, apiBase } = config;
  const selectedModel = model || config.model || 'gpt-4o-mini';

  // 如果没有配置 API Key，使用模拟响应
  if (!apiKey) {
    return mockAIResponse(prompt, selectedModel);
  }

  try {
    const response = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      id: data.id || crypto.randomUUID(),
      content: data.choices?.[0]?.message?.content || '无响应内容',
      model: selectedModel,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('AI 请求失败，请检查网络连接');
  }
}

/**
 * 模拟 AI 响应（无 API Key 时使用）
 */
async function mockAIResponse(prompt: string, model: string): Promise<AIResponse> {
  // 模拟 API 延迟
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const mockResponses = [
    `这是来自 **${model}** 的模拟回复。\n\n您的问题是："${prompt}"\n\n要获取真实 AI 响应，请在设置页面配置 API Key。\n\n推荐使用 [AiHubMix](https://aihubmix.com/) 获取 API Key。`,
    `## 模拟响应\n\n您输入了：\n> ${prompt}\n\n---\n\n**提示**：当前为模拟模式，请配置 API Key 以使用真实 AI 服务。`,
  ];

  return {
    id: crypto.randomUUID(),
    content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
    model,
    createdAt: new Date().toISOString(),
  };
}

/**
 * 测试 API 连接
 * 使用实际的聊天请求来验证 API Key 是否有效
 */
export async function testAIConnection(config: AIConfig): Promise<{ success: boolean; message: string }> {
  if (!config.apiKey) {
    return { success: false, message: '请输入 API Key' };
  }

  if (!config.apiKey.startsWith('sk-')) {
    return { success: false, message: 'API Key 格式错误，应以 sk- 开头' };
  }

  try {
    // 使用实际的聊天请求来测试，而不是 /models 端点
    const response = await fetch(`${config.apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model || 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5, // 最小 token 数，减少消耗
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      return { success: true, message: '连接成功！API Key 有效' };
    } else if (response.status === 401) {
      return { success: false, message: 'API Key 无效或已过期' };
    } else if (response.status === 403) {
      return { success: false, message: '无权限访问，请检查 API Key 权限' };
    } else if (response.status === 429) {
      return { success: false, message: '请求过于频繁，请稍后再试' };
    } else if (response.status === 402) {
      return { success: false, message: '账户余额不足' };
    } else {
      return { 
        success: false, 
        message: data.error?.message || `请求失败: ${response.status}` 
      };
    }
  } catch (error) {
    console.error('AI API test error:', error);
    if (error instanceof TypeError) {
      return { success: false, message: '网络错误，请检查 API 地址是否正确' };
    }
    return { success: false, message: '连接失败，请检查网络' };
  }
}
