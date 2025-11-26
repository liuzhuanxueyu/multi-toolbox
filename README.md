# Multi-Toolbox 个人助理工具箱

<p align="center">
  <strong>一个功能丰富的个人助理工具箱单页应用</strong><br>
  集成任务管理、笔记记录、AI 草稿、数据统计等多种实用功能
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-7-purple?logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/TailwindCSS-3-cyan?logo=tailwindcss" alt="TailwindCSS">
</p>

---

## ✨ 功能特性

### 📋 任务管理
- 新建 / 编辑 / 删除待办任务
- 任务优先级标记（🔴高 / 🟡中 / 🟢低）+ 颜色卡片
- 任务描述、截止日期
- **拖拽排序**（@dnd-kit 实现）
- 按优先级 / 状态筛选
- 已完成 / 待完成分类展示

### 📝 Markdown 笔记
- Markdown 语法编辑 + 实时预览
- **代码语法高亮**（rehype-highlight）
- **标签分类系统**（支持多标签）
- 标题 / 内容搜索过滤
- **自动保存**（debounce 500ms）
- 双栏布局，深色模式完整适配

### 🤖 AI 草稿
- **接入 AiHubMix API**（OpenAI 兼容格式）
- 支持模型：GPT-4o / GPT-4o-mini / Claude 3.5 / DeepSeek
- 多模型快速切换
- 历史记录持久化
- **一键保存到笔记库**
- Markdown 渲染 AI 响应
- 支持自定义 API 地址
- **API Key 有效性验证**

### 📊 数据总结
- 今日 / 本周任务统计
- 完成率可视化进度条
- **笔记关键词标签云**
- 优先级分布图表
- 最近活动时间线
- **导出 Markdown 周报**
- **一键保存到笔记**

### 🏠 首页仪表盘
- 数据概览统计卡片
- **本周完成趋势折线图**（纯 CSS 实现）
- **优先级分布柱状图**
- 最近笔记列表
- 待办任务快览
- 快捷操作入口

### 🧩 小组件区
| 组件 | 功能 |
|------|------|
| 🌤️ 天气 | 接入和风天气 API，城市搜索，实时数据 |
| 🍅 番茄钟 | 25 分钟专注 + 5 分钟休息，可切换模式 |
| ⏰ 倒计时 | 年末倒计时，支持自定义目标日期 |
| 🔗 快捷链接 | GitHub / Google / ChatGPT / Claude |

### ⚙️ 设置中心
- 主题切换（☀️ 浅色 / 🌙 深色 / 🖥️ 跟随系统）
- **字体大小调整**（小 / 中 / 大）
- **AI API 配置**（AiHubMix + 连接测试）
- **天气 API 配置**（和风天气 + 连接测试）
- 数据统计概览
- 数据导出（JSON 备份）
- **数据导入**（恢复备份）
- 数据清空（带确认）

---

## 🛠️ 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 19 | 前端框架 |
| TypeScript | 5.9 | 类型安全 |
| Vite | 7 | 构建工具 |
| TailwindCSS | 3.4 | 原子化 CSS |
| Zustand | 5 | 轻量状态管理 + 持久化 |
| React Router | 6 | 路由管理 |
| @dnd-kit | 6 | 拖拽排序 |
| react-markdown | 9 | Markdown 渲染 |
| rehype-highlight | 7 | 代码高亮 |

---

## 📁 项目结构

```
src/
├── api/                    # API 接口层
│   ├── ai.ts               # AI API（AiHubMix / OpenAI 兼容）
│   └── weather.ts          # 天气 API（和风天气）
├── components/
│   ├── layout/             # 布局组件
│   │   ├── MainLayout.tsx  # 主布局
│   │   ├── Sidebar.tsx     # 侧边栏导航
│   │   └── Header.tsx      # 顶部栏
│   ├── ui/                 # 基础 UI 组件
│   │   ├── Button.tsx      # 按钮
│   │   ├── Card.tsx        # 卡片
│   │   ├── Input.tsx       # 输入框
│   │   ├── Modal.tsx       # 模态框
│   │   ├── Select.tsx      # 下拉选择
│   │   ├── Tag.tsx         # 标签
│   │   └── Textarea.tsx    # 多行输入
│   └── widgets/            # 小组件
│       ├── WeatherWidget.tsx
│       ├── PomodoroWidget.tsx
│       ├── CountdownWidget.tsx
│       ├── QuickLinksWidget.tsx
│       └── ChartWidget.tsx
├── pages/
│   ├── home/               # 首页仪表盘
│   ├── tasks/              # 任务管理
│   │   ├── TasksPage.tsx
│   │   ├── TaskItem.tsx    # 可拖拽任务卡片
│   │   └── TaskModal.tsx   # 任务编辑弹窗
│   ├── notes/              # Markdown 笔记
│   ├── ai-draft/           # AI 草稿
│   ├── summary/            # 数据总结
│   └── settings/           # 应用设置
├── store/                  # Zustand 状态管理
│   ├── tasksStore.ts       # 任务状态
│   ├── notesStore.ts       # 笔记状态
│   ├── aiDraftStore.ts     # AI 草稿历史
│   └── settingsStore.ts    # 设置（含 API 配置）
└── utils/                  # 工具函数
    ├── date.ts             # 日期格式化
    ├── debounce.ts         # 防抖节流
    └── storage.ts          # localStorage 封装
```

---

## 🚀 快速开始

```bash
# 克隆项目
git clone <repo-url>
cd multi-toolbox

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

---

## 🔑 API 配置（可选）

### AI API - AiHubMix

1. 访问 [AiHubMix.com](https://aihubmix.com/) 注册账号
2. 充值并获取 API Key（格式：`sk-xxx`）
3. 在「设置」或「AI 草稿」页面点击 API 配置
4. 输入 Key，点击「测试连接」验证
5. 保存后即可使用真实 AI 模型

**支持的模型：**
- ⚡ GPT-4o Mini（快速经济）
- 🧠 GPT-4o（强大智能）
- 🚀 GPT-4 Turbo（高性能）
- 🎭 Claude 3.5 Sonnet（创意写作）
- 🔮 DeepSeek Chat（中文优化）

### 天气 API - 和风天气

1. 访问 [和风天气开发平台](https://dev.qweather.com/) 注册
2. 创建项目，选择「Web API」免费订阅
3. ⚠️ **重要**：项目管理 → 应用限制 → 选择「网站」并**留空**保存
4. 获取 API Key，在「设置」或天气组件 ⚙️ 配置
5. 测试连接成功后保存

> 💡 未配置 API 时，AI 草稿和天气均使用模拟数据，不影响其他功能使用

---

## 📌 路由结构

| 路径 | 页面 | 功能 |
|------|------|------|
| `/` | 首页 | 仪表盘 + 图表 + 小组件 |
| `/tasks` | 任务 | 待办管理 + 拖拽排序 + 筛选 |
| `/notes` | 笔记 | Markdown 编辑 + 标签 + 搜索 |
| `/ai-draft` | AI 草稿 | 多模型对话 + 历史记录 |
| `/summary` | 总结 | 数据统计 + 标签云 + 导出 |
| `/settings` | 设置 | 主题 + API + 数据管理 |

---

## 🎨 主题系统

- ☀️ **浅色模式** - 明亮清爽
- 🌙 **深色模式** - 护眼舒适
- 🖥️ **跟随系统** - 自动切换

所有组件完整适配深色模式，支持平滑过渡动画。

---

## 💾 数据存储

所有数据使用 `localStorage` 本地持久化：

| Key | 内容 |
|-----|------|
| `tasks-storage` | 任务列表 |
| `notes-storage` | 笔记列表 |
| `ai-draft-storage` | AI 草稿历史 |
| `settings-storage` | 设置 + API Key |
| `weather-city` | 选中的城市 |

✅ 支持 JSON 导出备份  
✅ 支持导入恢复数据

---

## 📄 许可证

[MIT License](LICENSE)
