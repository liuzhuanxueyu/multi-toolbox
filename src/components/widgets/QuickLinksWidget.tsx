import { Card, CardTitle, CardContent } from '../ui/Card';

interface QuickLink {
  title: string;
  url: string;
  icon: string;
}

const defaultLinks: QuickLink[] = [
  { title: 'GitHub', url: 'https://github.com', icon: '📦' },
  { title: 'Google', url: 'https://google.com', icon: '🔍' },
  { title: 'ChatGPT', url: 'https://chat.openai.com', icon: '🤖' },
  { title: 'Claude', url: 'https://claude.ai', icon: '🧠' },
];

interface QuickLinksWidgetProps {
  links?: QuickLink[];
}

export function QuickLinksWidget({ links = defaultLinks }: QuickLinksWidgetProps) {
  return (
    <Card variant="bordered">
      <CardTitle className="flex items-center gap-2">
        🔗 快捷链接
      </CardTitle>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--border-color)] transition-colors text-[var(--text-primary)]"
            >
              <span>{link.icon}</span>
              <span className="text-sm truncate">{link.title}</span>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

