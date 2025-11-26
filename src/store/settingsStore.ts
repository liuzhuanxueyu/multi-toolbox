import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';
type FontSize = 'small' | 'medium' | 'large';

interface AIConfig {
  apiKey: string;
  apiBase: string;
  model: string;
}

interface WeatherConfig {
  apiKey: string;
  apiBase: string;
}

interface SettingsState {
  theme: Theme;
  fontSize: FontSize;
  sidebarCollapsed: boolean;
  aiConfig: AIConfig;
  weatherConfig: WeatherConfig;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: FontSize) => void;
  toggleSidebar: () => void;
  setAIConfig: (config: Partial<AIConfig>) => void;
  setWeatherConfig: (config: Partial<WeatherConfig>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      fontSize: 'medium',
      sidebarCollapsed: false,
      aiConfig: {
        apiKey: '',
        apiBase: 'https://aihubmix.com/v1',
        model: 'gpt-4o-mini',
      },
      weatherConfig: {
        apiKey: '',
        apiBase: 'https://devapi.qweather.com/v7',
      },
      
      setTheme: (theme) => set({ theme }),
      
      setFontSize: (fontSize) => set({ fontSize }),
      
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      setAIConfig: (config) =>
        set((state) => ({
          aiConfig: { ...state.aiConfig, ...config },
        })),
      
      setWeatherConfig: (config) =>
        set((state) => ({
          weatherConfig: { ...state.weatherConfig, ...config },
        })),
    }),
    {
      name: 'settings-storage',
    }
  )
);

