/**
 * 天气 API 模拟接口
 */

export interface WeatherData {
  city: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export async function fetchWeather(city: string = '北京'): Promise<WeatherData> {
  // 模拟 API 延迟
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // 模拟天气数据
  const mockWeather: WeatherData = {
    city,
    temperature: Math.floor(Math.random() * 20) + 10,
    description: ['晴', '多云', '阴', '小雨'][Math.floor(Math.random() * 4)],
    humidity: Math.floor(Math.random() * 40) + 40,
    windSpeed: Math.floor(Math.random() * 20) + 5,
    icon: '☀️',
  };
  
  // 根据天气描述设置图标
  const iconMap: Record<string, string> = {
    '晴': '☀️',
    '多云': '⛅',
    '阴': '☁️',
    '小雨': '🌧️',
  };
  mockWeather.icon = iconMap[mockWeather.description] || '☀️';
  
  return mockWeather;
}

