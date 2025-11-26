import { NavLink } from 'react-router-dom';
import { useSettingsStore } from '../../store/settingsStore';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/tasks', label: '任务', icon: '✅' },
  { path: '/notes', label: '笔记', icon: '📝' },
  { path: '/ai-draft', label: 'AI 草稿', icon: '🤖' },
  { path: '/summary', label: '总结', icon: '📊' },
  { path: '/settings', label: '设置', icon: '⚙️' },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useSettingsStore();

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-[var(--bg-secondary)] border-r border-[var(--border-color)] transition-all duration-300 z-50 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-color)]">
        {!sidebarCollapsed && (
          <span className="font-bold text-lg text-[var(--text-primary)]">
            Multi-Toolbox
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-[var(--border-color)] transition-colors"
          aria-label={sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]'
              } ${sidebarCollapsed ? 'justify-center' : ''}`
            }
          >
            <span className="text-xl">{item.icon}</span>
            {!sidebarCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

