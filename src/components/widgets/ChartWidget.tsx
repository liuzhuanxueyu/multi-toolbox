import { useMemo } from 'react';
import { Card, CardTitle, CardContent } from '../ui/Card';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface ChartWidgetProps {
  title: string;
  data: DataPoint[];
  type?: 'bar' | 'line';
  height?: number;
}

/**
 * 简单图表组件（纯 CSS 实现，无需依赖）
 * 支持柱状图和折线图
 */
export function ChartWidget({ title, data, type = 'bar', height = 160 }: ChartWidgetProps) {
  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);

  if (type === 'line') {
    // 折线图
    const points = data.map((d, i) => ({
      x: (i / (data.length - 1 || 1)) * 100,
      y: 100 - (d.value / maxValue) * 100,
    }));

    const pathD = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    return (
      <Card variant="bordered">
        <CardTitle>{title}</CardTitle>
        <CardContent>
          <div style={{ height }} className="relative">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              {/* 网格线 */}
              {[0, 25, 50, 75, 100].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="100"
                  y2={y}
                  stroke="var(--border-color)"
                  strokeWidth="0.5"
                />
              ))}

              {/* 渐变填充 */}
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* 填充区域 */}
              <path
                d={`${pathD} L 100 100 L 0 100 Z`}
                fill="url(#lineGradient)"
              />

              {/* 折线 */}
              <path
                d={pathD}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />

              {/* 数据点 */}
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="3"
                  fill="var(--bg-secondary)"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            {/* X 轴标签 */}
            <div className="flex justify-between mt-2 text-xs text-[var(--text-secondary)]">
              {data.map((d, i) => (
                <span key={i} className="truncate" style={{ maxWidth: `${100 / data.length}%` }}>
                  {d.label}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 柱状图
  return (
    <Card variant="bordered">
      <CardTitle>{title}</CardTitle>
      <CardContent>
        <div style={{ height }} className="flex items-end justify-between gap-2">
          {data.map((d, i) => {
            const barHeight = (d.value / maxValue) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full relative flex flex-col items-center" style={{ height: height - 24 }}>
                  {/* 数值标签 */}
                  <span className="absolute -top-5 text-xs text-[var(--text-secondary)]">
                    {d.value}
                  </span>
                  {/* 柱子 */}
                  <div
                    className="w-full max-w-8 rounded-t transition-all duration-500 mt-auto"
                    style={{
                      height: `${barHeight}%`,
                      backgroundColor: d.color || 'var(--accent)',
                      minHeight: d.value > 0 ? 4 : 0,
                    }}
                  />
                </div>
                {/* X 轴标签 */}
                <span className="text-xs text-[var(--text-secondary)] mt-1 truncate w-full text-center">
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}


