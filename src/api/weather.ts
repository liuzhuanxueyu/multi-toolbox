/**
 * 天气 API 接口
 * 支持和风天气（QWeather）https://dev.qweather.com/
 */

export interface WeatherData {
  city: string;
  cityId: string;
  temperature: number;
  feelsLike: number;
  description: string;
  humidity: number;
  windSpeed: number;
  windDir: string;
  icon: string;
  updateTime: string;
}

export interface WeatherConfig {
  apiKey: string;
  apiBase: string;
}

export interface CityInfo {
  id: string;
  name: string;
  adm1: string; // 省份
  adm2: string; // 城市
}

// 天气图标映射（和风天气图标代码 -> emoji）
const WEATHER_ICONS: Record<string, string> = {
  '100': '☀️', '150': '☀️',  // 晴
  '101': '⛅', '151': '⛅',  // 多云
  '102': '🌤️', '152': '🌤️', // 少云
  '103': '⛅', '153': '⛅',  // 晴间多云
  '104': '☁️', '154': '☁️',  // 阴
  '300': '🌧️', '301': '🌧️', // 阵雨
  '302': '⛈️', '303': '⛈️', // 雷阵雨
  '304': '⛈️',              // 雷阵雨伴有冰雹
  '305': '🌧️', '306': '🌧️', // 小雨、中雨
  '307': '🌧️', '308': '🌧️', // 大雨、极端降雨
  '309': '🌧️', '310': '🌧️', // 毛毛雨、暴雨
  '311': '🌧️', '312': '🌧️', // 大暴雨、特大暴雨
  '313': '🌨️', '314': '🌨️', // 冻雨、小到中雨
  '315': '🌧️', '316': '🌧️', // 中到大雨、大到暴雨
  '317': '🌧️', '318': '🌧️', // 暴雨到大暴雨
  '399': '🌧️',              // 雨
  '400': '🌨️', '401': '🌨️', // 小雪、中雪
  '402': '🌨️', '403': '🌨️', // 大雪、暴雪
  '404': '🌨️', '405': '🌨️', // 雨夹雪、雨雪
  '406': '🌨️', '407': '🌨️', // 阵雨夹雪、阵雪
  '408': '🌨️', '409': '🌨️', // 小到中雪、中到大雪
  '410': '🌨️', '499': '🌨️', // 大到暴雪、雪
  '500': '🌫️', '501': '🌫️', // 薄雾、雾
  '502': '🌫️', '503': '🌫️', // 霾、扬沙
  '504': '🌫️', '507': '🌫️', // 浮尘、沙尘暴
  '508': '🌫️', '509': '🌫️', // 强沙尘暴、浓雾
  '510': '🌫️', '511': '🌫️', // 强浓雾、中度霾
  '512': '🌫️', '513': '🌫️', // 重度霾、严重霾
  '514': '🌫️', '515': '🌫️', // 大雾、特强浓雾
  '900': '🌡️', '901': '❄️', // 热、冷
  '999': '🌈',              // 未知
};

/**
 * 获取天气图标
 */
function getWeatherIcon(code: string): string {
  return WEATHER_ICONS[code] || '🌤️';
}

/**
 * 搜索城市（获取城市 ID）
 */
export async function searchCity(
  query: string,
  config: WeatherConfig
): Promise<CityInfo[]> {
  if (!config.apiKey) {
    // 返回模拟数据
    return getMockCities(query);
  }

  try {
    const url = `https://geoapi.qweather.com/v2/city/lookup?location=${encodeURIComponent(query)}&key=${config.apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.code === '200' && data.location) {
      return data.location.map((loc: { id: string; name: string; adm1: string; adm2: string }) => ({
        id: loc.id,
        name: loc.name,
        adm1: loc.adm1,
        adm2: loc.adm2,
      }));
    }
    return [];
  } catch {
    return getMockCities(query);
  }
}

/**
 * 获取实时天气
 */
export async function fetchWeather(
  cityId: string,
  cityName: string,
  config: WeatherConfig
): Promise<WeatherData> {
  if (!config.apiKey) {
    return mockWeather(cityName);
  }

  try {
    const url = `${config.apiBase}/weather/now?location=${cityId}&key=${config.apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.code === '200' && data.now) {
      const now = data.now;
      return {
        city: cityName,
        cityId,
        temperature: parseInt(now.temp),
        feelsLike: parseInt(now.feelsLike),
        description: now.text,
        humidity: parseInt(now.humidity),
        windSpeed: parseInt(now.windSpeed),
        windDir: now.windDir,
        icon: getWeatherIcon(now.icon),
        updateTime: now.obsTime,
      };
    }
    throw new Error(data.code || '获取天气失败');
  } catch (error) {
    console.error('Weather API error:', error);
    return mockWeather(cityName);
  }
}

/**
 * 测试天气 API 连接
 * 
 * 注意：和风天气 Web API 需要在控制台配置域名白名单
 * 开发环境需添加: localhost 或 127.0.0.1
 * 生产环境需添加: 你的域名
 */
export async function testWeatherConnection(
  config: WeatherConfig
): Promise<{ success: boolean; message: string }> {
  if (!config.apiKey) {
    return { success: false, message: '请输入 API Key' };
  }

  try {
    // 使用北京测试
    const url = `${config.apiBase}/weather/now?location=101010100&key=${config.apiKey}`;
    const response = await fetch(url);
    
    // 检查响应状态
    if (!response.ok) {
      if (response.status === 0) {
        return { 
          success: false, 
          message: 'CORS 跨域错误，请在和风天气控制台添加域名白名单（localhost）' 
        };
      }
      if (response.status === 403) {
        return { 
          success: false, 
          message: '403 无权限！请在和风天气控制台 → 项目管理 → 应用限制 → 选择「网站」并留空，然后保存' 
        };
      }
      if (response.status === 401) {
        return { success: false, message: 'API Key 无效，请检查是否正确' };
      }
      return { success: false, message: `HTTP 错误: ${response.status}` };
    }

    const data = await response.json();

    if (data.code === '200') {
      return { success: true, message: '连接成功！' };
    } else if (data.code === '401') {
      return { success: false, message: 'API Key 无效或未配置域名白名单' };
    } else if (data.code === '402') {
      return { success: false, message: '超过访问次数限制' };
    } else if (data.code === '403') {
      return { success: false, message: '无访问权限，请检查 API Key 权限' };
    } else {
      return { success: false, message: `错误代码: ${data.code}` };
    }
  } catch (error) {
    console.error('Weather API test error:', error);
    // CORS 错误通常会抛出 TypeError
    if (error instanceof TypeError) {
      return { 
        success: false, 
        message: 'CORS 跨域错误，请在和风天气控制台 → 项目管理 → 应用限制 → 选择「网站」并留空保存' 
      };
    }
    return { success: false, message: '网络错误，请检查网络连接' };
  }
}

/**
 * 模拟城市搜索结果
 */
function getMockCities(query: string): CityInfo[] {
  const mockCities: Record<string, CityInfo> = {
    '北京': { id: '101010100', name: '北京', adm1: '北京市', adm2: '北京' },
    '上海': { id: '101020100', name: '上海', adm1: '上海市', adm2: '上海' },
    '广州': { id: '101280101', name: '广州', adm1: '广东省', adm2: '广州市' },
    '深圳': { id: '101280601', name: '深圳', adm1: '广东省', adm2: '深圳市' },
    '杭州': { id: '101210101', name: '杭州', adm1: '浙江省', adm2: '杭州市' },
    '成都': { id: '101270101', name: '成都', adm1: '四川省', adm2: '成都市' },
    '武汉': { id: '101200101', name: '武汉', adm1: '湖北省', adm2: '武汉市' },
    '西安': { id: '101110101', name: '西安', adm1: '陕西省', adm2: '西安市' },
    '南京': { id: '101190101', name: '南京', adm1: '江苏省', adm2: '南京市' },
    '重庆': { id: '101040100', name: '重庆', adm1: '重庆市', adm2: '重庆' },
  };

  const result: CityInfo[] = [];
  for (const [name, city] of Object.entries(mockCities)) {
    if (name.includes(query) || query.includes(name)) {
      result.push(city);
    }
  }
  return result.length > 0 ? result : [mockCities['北京']];
}

/**
 * 模拟天气数据
 */
function mockWeather(cityName: string): WeatherData {
  const descriptions = ['晴', '多云', '阴', '小雨', '阵雨'];
  const desc = descriptions[Math.floor(Math.random() * descriptions.length)];
  const iconMap: Record<string, string> = {
    '晴': '☀️', '多云': '⛅', '阴': '☁️', '小雨': '🌧️', '阵雨': '🌧️'
  };

  return {
    city: cityName,
    cityId: '',
    temperature: Math.floor(Math.random() * 20) + 10,
    feelsLike: Math.floor(Math.random() * 20) + 8,
    description: desc,
    humidity: Math.floor(Math.random() * 40) + 40,
    windSpeed: Math.floor(Math.random() * 20) + 5,
    windDir: ['东风', '西风', '南风', '北风'][Math.floor(Math.random() * 4)],
    icon: iconMap[desc] || '🌤️',
    updateTime: new Date().toISOString(),
  };
}
