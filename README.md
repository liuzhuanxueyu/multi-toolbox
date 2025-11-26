# Multi-Toolbox 个人助理工具箱

一个功能丰富的个人助理工具箱单页应用，集成任务管理、笔记记录、AI 草稿、数据统计等多种实用功能。

## ✨ 功能特性

### 📋 任务管理
- 创建、完成、删除待办任务
- 任务优先级标记（高/中/低）
- 已完成/待完成任务分类展示

### 📝 Markdown 笔记
- 支持 Markdown 语法编辑
- 实时预览渲染
- 笔记列表管理

### 🤖 AI 草稿
- 模拟 Claude / GPT / Sora 接口
- 多模型切换
- 对话历史记录

### 📊 数据总结
- 今日/本周任务统计
- 完成率可视化
- 最近活动记录

### 🧩 小组件区
- **天气组件** - 支持手动搜索切换城市，记忆用户选择
- **番茄钟** - 25分钟专注 + 5分钟休息模式
- **倒计时** - 年末倒计时（可自定义目标日期）
- **快捷链接** - 常用网站快速访问

### 🎨 主题切换
- 浅色 / 深色 / 跟随系统
- 平滑过渡动画

### 💾 数据持久化
- 本地 localStorage 自动存储
- 支持数据导出备份
- 一键清除数据

## 🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| React 19 | 前端框架 |
| TypeScript | 类型安全 |
| Vite | 构建工具 |
| TailwindCSS | 原子化 CSS |
| Zustand | 轻量状态管理 |
| React Router v6 | 路由管理 |
| react-markdown | Markdown 渲染 |
| @dnd-kit | 拖拽支持（预留） |

## 📁 项目结构

```
src/
├── api/                # API 接口层
├── components/
│   ├── layout/         # 布局组件（Header、Sidebar、MainLayout）
│   ├── ui/             # 基础 UI 组件（Button、Card、Input）
│   └── widgets/        # 小组件（天气、番茄钟、倒计时、快捷链接）
├── pages/              # 页面组件
│   ├── home/           # 首页仪表盘
│   ├── tasks/          # 任务管理
│   ├── notes/          # Markdown 笔记
│   ├── ai-draft/       # AI 草稿
│   ├── summary/        # 数据总结
│   └── settings/       # 应用设置
├── store/              # Zustand 状态管理
├── utils/              # 工具函数
└── mock/               # Mock 服务
```

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 📌 路由规划

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 仪表盘 + 小组件 |
| `/tasks` | 任务 | 待办事项管理 |
| `/notes` | 笔记 | Markdown 笔记 |
| `/ai-draft` | AI 草稿 | AI 对话模拟 |
| `/summary` | 总结 | 数据统计卡片 |
| `/settings` | 设置 | 主题与数据管理 |

## 🔮 后续规划

- [ ] 任务拖拽排序（@dnd-kit 集成）
- [ ] GitHub Gist 云同步
- [ ] 笔记标签系统
- [ ] 自定义快捷链接
- [ ] 导入数据功能
- [ ] PWA 离线支持

## 📄 许可证

MIT License
