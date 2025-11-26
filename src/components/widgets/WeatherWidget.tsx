import { useEffect, useState, useCallback } from 'react';
import { Card, CardTitle, CardContent } from '../ui/Card';
import { fetchWeather, type WeatherData } from '../../api/weather';

const POPULAR_CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安'];

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState(() => localStorage.getItem('weather-city') || '北京');
  const [searchInput, setSearchInput] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const loadWeather = useCallback((targetCity: string) => {
    setLoading(true);
    fetchWeather(targetCity)
      .then(setWeather)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadWeather(city);
  }, [city, loadWeather]);

  const handleCityChange = (newCity: string) => {
    if (!newCity.trim()) return;
    setCity(newCity.trim());
    localStorage.setItem('weather-city', newCity.trim());
    setShowSearch(false);
    setSearchInput('');
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      handleCityChange(searchInput);
    }
  };

  return (
    <Card variant="bordered">
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{weather?.icon || '🌤️'}</span>
          天气
        </div>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="text-sm px-2 py-1 rounded hover:bg-[var(--border-color)] transition-colors text-[var(--text-secondary)]"
          title="切换城市"
        >
          📍
        </button>
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
                placeholder="输入城市名..."
                className="flex-1 px-2 py-1 text-sm rounded border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
              <button
                onClick={handleSearch}
                className="px-2 py-1 text-sm rounded bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
              >
                搜索
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {POPULAR_CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => handleCityChange(c)}
                  className={`px-2 py-0.5 text-xs rounded transition-colors ${
                    city === c
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {c}
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
        ) : weather ? (
          <div className="space-y-2">
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {weather.temperature}°C
            </p>
            <p className="text-[var(--text-secondary)]">
              {weather.city} · {weather.description}
            </p>
            <div className="flex gap-4 text-sm text-[var(--text-secondary)]">
              <span>💧 {weather.humidity}%</span>
              <span>💨 {weather.windSpeed} km/h</span>
            </div>
          </div>
        ) : (
          <p className="text-[var(--text-secondary)]">加载失败</p>
        )}
      </CardContent>
    </Card>
  );
}
