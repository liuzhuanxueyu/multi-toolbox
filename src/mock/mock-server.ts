/**
 * Mock Server 配置
 * 
 * 这个文件用于模拟后端 API 响应
 * 在实际开发中，可以使用 msw 或其他工具替代
 */

export interface MockResponse<T> {
  data: T;
  status: number;
  message: string;
}

export function createMockResponse<T>(data: T, status = 200, message = 'success'): MockResponse<T> {
  return { data, status, message };
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// AI 模拟响应生成器
export function generateAIResponse(prompt: string): string {
  const templates = [
    `根据您的问题"${prompt}"，我的建议是...`,
    `这是一个很好的问题！关于"${prompt}"，我认为...`,
    `让我来帮您分析一下"${prompt}"这个话题...`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

