import { useEffect, useState, useCallback } from 'react';
import { Card, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import {
  fetchWeather,
  searchCity,
  testWeatherConnection,
  type WeatherData,
  type CityInfo,
} from '../../api/weather';
import { useSettingsStore } from '../../store/settingsStore';

const POPULAR_CITIES: CityInfo[] = [
  { id: '101010100', name: '北京', adm1: '北京市', adm2: '北京' },
  { id: '101020100', name: '上海', adm1: '上海市', adm2: '上海' },
  { id: '101280101', name: '广州', adm1: '广东省', adm2: '广州市' },
  { id: '101280601', name: '深圳', adm1: '广东省', adm2: '深圳市' },
  { id: '101210101', name: '杭州', adm1: '浙江省', adm2: '杭州市' },
  { id: '101270101', name: '成都', adm1: '四川省', adm2: '成都市' },
];

interface SavedCity {
  id: string;
  name: string;
}

/**
 * 天气小组件
 * 支持和风天气 API（https://dev.qweather.com/）
 */
export function WeatherWidget() {
  const { weatherConfig, setWeatherConfig } = useSettingsStore();

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 当前选中的城市
  const [currentCity, setCurrentCity] = useState<SavedCity>(() => {
    const saved = localStorage.getItem('weather-city');
    return saved ? JSON.parse(saved) : { id: '101010100', name: '北京' };
  });

  // 搜索状态
  const [showSearch, setShowSearch] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<CityInfo[]>([]);
  const [searching, setSearching] = useState(false);

  // 配置弹窗
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(weatherConfig.apiKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // 加载天气数据
  const loadWeather = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(currentCity.id, currentCity.name, weatherConfig);
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取天气失败');
    } finally {
      setLoading(false);
    }
  }, [currentCity, weatherConfig]);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  // 搜索城市
  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    setSearching(true);
    const results = await searchCity(searchInput.trim(), weatherConfig);
    setSearchResults(results);
    setSearching(false);
  };

  // 选择城市
  const handleSelectCity = (city: CityInfo) => {
    const savedCity: SavedCity = { id: city.id, name: city.name };
    setCurrentCity(savedCity);
    localStorage.setItem('weather-city', JSON.stringify(savedCity));
    setShowSearch(false);
    setSearchInput('');
    setSearchResults([]);
  };

  // 测试 API 连接
  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testWeatherConnection({
      apiKey: tempApiKey,
      apiBase: weatherConfig.apiBase,
    });
    setTestResult(result);
    setTesting(false);
  };

  // 保存配置
  const handleSaveConfig = () => {
    setWeatherConfig({ apiKey: tempApiKey });
    setConfigModalOpen(false);
    loadWeather(); // 重新加载天气
  };

  const isConfigured = !!weatherConfig.apiKey;

  return (
    <>
      <Card variant="bordered">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{weather?.icon || '🌤️'}</span>
            <span>天气</span>
            {!isConfigured && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-500">
                模拟
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="text-sm px-2 py-1 rounded hover:bg-[var(--border-color)] transition-colors text-[var(--text-secondary)]"
              title="切换城市"
            >
              📍
            </button>
            <button
              onClick={() => {
                setTempApiKey(weatherConfig.apiKey);
                setTestResult(null);
                setConfigModalOpen(true);
              }}
              className="text-sm px-2 py-1 rounded hover:bg-[var(--border-color)] transition-colors text-[var(--text-secondary)]"
              title="API 配置"
            >
              ⚙️
            </button>
          </div>
        </CardTitle>
        <CardContent>
          {/* 城市搜索区域 */}
          {showSearch && (
            <div className="mb-3 space-y-2">
              <div className="flex gap-1">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="搜索城市..."
                  className="flex-1 px-2 py-1 text-sm rounded border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className="px-2 py-1 text-sm rounded bg-[var(--accent)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {searching ? '...' : '搜索'}
                </button>
              </div>

              {/* 搜索结果 */}
              {searchResults.length > 0 && (
                <div className="space-y-1 max-h-32 overflow-auto">
                  {searchResults.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleSelectCity(city)}
                      className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-[var(--border-color)] transition-colors"
                    >
                      <span className="text-[var(--text-primary)]">{city.name}</span>
                      <span className="text-xs text-[var(--text-secondary)] ml-2">
                        {city.adm1}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* 热门城市 */}
              <div className="flex flex-wrap gap-1">
                {POPULAR_CITIES.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleSelectCity(city)}
                    className={`px-2 py-0.5 text-xs rounded transition-colors ${
                      currentCity.id === city.id
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 天气信息 */}
          {loading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-8 bg-[var(--border-color)] rounded w-20" />
              <div className="h-4 bg-[var(--border-color)] rounded w-32" />
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-red-500 text-sm mb-2">❌ {error}</p>
              <Button size="sm" variant="secondary" onClick={loadWeather}>
                重试
              </Button>
            </div>
          ) : weather ? (
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[var(--text-primary)]">
                  {weather.temperature}°C
                </span>
                <span className="text-sm text-[var(--text-secondary)]">
                  体感 {weather.feelsLike}°C
                </span>
              </div>
              <p className="text-[var(--text-secondary)]">
                {weather.city} · {weather.description}
              </p>
              <div className="flex gap-4 text-sm text-[var(--text-secondary)]">
                <span>💧 {weather.humidity}%</span>
                <span>💨 {weather.windDir} {weather.windSpeed}km/h</span>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* API 配置弹窗 */}
      <Modal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        title="天气 API 配置"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm">
            <p className="font-medium text-blue-500 mb-1">💡 配置步骤</p>
            <ol className="text-[var(--text-secondary)] list-decimal list-inside space-y-1">
              <li>
                访问{' '}
                <a
                  href="https://dev.qweather.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] underline"
                >
                  和风天气开发平台
                </a>{' '}
                注册账号
              </li>
              <li>创建项目，选择「Web API」免费订阅</li>
              <li>应用限制选择「网站」并<strong>留空</strong>保存</li>
              <li>复制 API Key 粘贴到下方</li>
            </ol>
          </div>
          
          <div className="p-2 rounded bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-600">
            ⚠️ 应用限制请选择「网站」并<strong>留空</strong>保存，即可允许所有网站访问
          </div>

          <Input
            label="API Key"
            type="password"
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
            placeholder="输入和风天气 API Key..."
          />

          {testResult && (
            <div
              className={`p-3 rounded-lg text-sm ${
                testResult.success
                  ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                  : 'bg-red-500/10 border border-red-500/30 text-red-500'
              }`}
            >
              {testResult.success ? '✓' : '✗'} {testResult.message}
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button
              variant="secondary"
              onClick={handleTestConnection}
              disabled={testing || !tempApiKey}
            >
              {testing ? '测试中...' : '测试连接'}
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setConfigModalOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSaveConfig}>保存</Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
