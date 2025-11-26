import { useState, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { Card, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Tag } from '../../components/ui/Tag';
import { useNotesStore, type Note } from '../../store/notesStore';
import { formatDate } from '../../utils/date';
import { debounce } from '../../utils/debounce';

// 代码高亮样式（内联）
const codeHighlightStyles = `
.prose pre {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
}
.prose code {
  background: var(--border-color);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}
.prose pre code {
  background: transparent;
  padding: 0;
}
.hljs-keyword, .hljs-selector-tag { color: #c678dd; }
.hljs-string, .hljs-attr { color: #98c379; }
.hljs-number { color: #d19a66; }
.hljs-comment { color: #5c6370; font-style: italic; }
.hljs-function { color: #61afef; }
.hljs-variable, .hljs-params { color: #e06c75; }
`;

/**
 * 笔记管理页面
 * - Markdown 编辑 + 实时预览
 * - Tag 分类系统
 * - 搜索功能
 * - 自动保存（debounce 500ms）
 */
export function NotesPage() {
  const { notes, addNote, updateNote, deleteNote } = useNotesStore();
  
  // 选中的笔记
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  
  // 编辑状态
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  // 搜索和筛选
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // 自动保存状态
  const [isSaving, setIsSaving] = useState(false);

  // 获取所有唯一标签
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((note) => note.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [notes]);

  // 筛选笔记
  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        // 搜索过滤
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchTitle = note.title.toLowerCase().includes(query);
          const matchContent = note.content.toLowerCase().includes(query);
          if (!matchTitle && !matchContent) return false;
        }
        // 标签过滤
        if (selectedTag && !note.tags.includes(selectedTag)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, searchQuery, selectedTag]);

  // 自动保存函数（防抖）
  const autoSave = useCallback(
    debounce((id: string, title: string, content: string, tags: string[]) => {
      updateNote(id, { title, content, tags });
      setIsSaving(false);
    }, 500),
    [updateNote]
  );

  // 内容变化时触发自动保存
  useEffect(() => {
    if (isEditing && selectedNote) {
      setIsSaving(true);
      autoSave(selectedNote.id, editTitle, editContent, editTags);
    }
  }, [editTitle, editContent, editTags, isEditing, selectedNote, autoSave]);

  // 选中笔记时同步编辑状态
  useEffect(() => {
    if (selectedNote) {
      const currentNote = notes.find((n) => n.id === selectedNote.id);
      if (currentNote) {
        setSelectedNote(currentNote);
      }
    }
  }, [notes, selectedNote?.id]);

  // 新建笔记
  const handleNewNote = () => {
    const newNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> = {
      title: '无标题笔记',
      content: '# 新笔记\n\n开始写点什么...',
      tags: [],
    };
    addNote(newNote);
    
    // 选中新创建的笔记（需要等待 store 更新）
    setTimeout(() => {
      const latestNotes = useNotesStore.getState().notes;
      const newest = latestNotes[latestNotes.length - 1];
      if (newest) {
        handleSelectNote(newest);
        setIsEditing(true);
      }
    }, 50);
  };

  // 选中笔记
  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags([...note.tags]);
    setIsEditing(false);
  };

  // 删除笔记
  const handleDelete = () => {
    if (selectedNote && window.confirm('确定要删除这篇笔记吗？')) {
      deleteNote(selectedNote.id);
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  // 添加标签
  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !editTags.includes(tag)) {
      setEditTags([...editTags, tag]);
      setNewTag('');
    }
  };

  // 移除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setEditTags(editTags.filter((t) => t !== tagToRemove));
  };

  return (
    <>
      {/* 代码高亮样式 */}
      <style>{codeHighlightStyles}</style>

      <div className="flex gap-6 h-[calc(100vh-8rem)]">
        {/* 左侧：笔记列表 */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-4">
          {/* 搜索框 */}
          <div className="relative">
            <Input
              placeholder="搜索笔记..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
              🔍
            </span>
          </div>

          {/* 标签筛选 */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <Tag
                active={selectedTag === null}
                onClick={() => setSelectedTag(null)}
              >
                全部
              </Tag>
              {allTags.map((tag) => (
                <Tag
                  key={tag}
                  active={selectedTag === tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                >
                  #{tag}
                </Tag>
              ))}
            </div>
          )}

          {/* 笔记列表 */}
          <Card variant="bordered" className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
              <CardTitle className="mb-0 text-base">
                📝 笔记 ({filteredNotes.length})
              </CardTitle>
              <Button size="sm" onClick={handleNewNote}>
                ➕
              </Button>
            </div>
            <CardContent className="flex-1 overflow-auto p-2">
              <div className="space-y-1">
                {filteredNotes.length === 0 ? (
                  <div className="text-center py-8 text-[var(--text-secondary)]">
                    <p className="text-3xl mb-2">📭</p>
                    <p className="text-sm">
                      {searchQuery || selectedTag ? '没有找到匹配的笔记' : '暂无笔记'}
                    </p>
                    {!searchQuery && !selectedTag && (
                      <Button size="sm" className="mt-3" onClick={handleNewNote}>
                        创建第一篇笔记
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredNotes.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => handleSelectNote(note)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedNote?.id === note.id
                          ? 'bg-[var(--accent)] text-white shadow-md'
                          : 'hover:bg-[var(--border-color)]'
                      }`}
                    >
                      <div className="font-medium truncate">{note.title}</div>
                      <div
                        className={`text-xs mt-1 truncate ${
                          selectedNote?.id === note.id
                            ? 'text-white/70'
                            : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        {note.content.replace(/^#+ /, '').slice(0, 50)}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`text-xs ${
                            selectedNote?.id === note.id
                              ? 'text-white/60'
                              : 'text-[var(--text-secondary)]'
                          }`}
                        >
                          {formatDate(note.updatedAt, 'relative')}
                        </span>
                        {note.tags.length > 0 && (
                          <div className="flex gap-1">
                            {note.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className={`text-xs px-1.5 py-0.5 rounded ${
                                  selectedNote?.id === note.id
                                    ? 'bg-white/20'
                                    : 'bg-[var(--border-color)]'
                                }`}
                              >
                                #{tag}
                              </span>
                            ))}
                            {note.tags.length > 2 && (
                              <span
                                className={`text-xs ${
                                  selectedNote?.id === note.id
                                    ? 'text-white/60'
                                    : 'text-[var(--text-secondary)]'
                                }`}
                              >
                                +{note.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：笔记内容 */}
        <div className="flex-1 flex flex-col">
          <Card variant="bordered" className="h-full flex flex-col overflow-hidden">
            {selectedNote ? (
              <>
                {/* 工具栏 */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
                  <div className="flex-1 mr-4">
                    {isEditing ? (
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full text-xl font-bold bg-transparent text-[var(--text-primary)] border-none outline-none focus:ring-0"
                        placeholder="笔记标题..."
                      />
                    ) : (
                      <h2 className="text-xl font-bold text-[var(--text-primary)] truncate">
                        {selectedNote.title}
                      </h2>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isSaving && (
                      <span className="text-xs text-[var(--text-secondary)]">保存中...</span>
                    )}
                    {isEditing ? (
                      <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)}>
                        预览
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => setIsEditing(true)}>
                        编辑
                      </Button>
                    )}
                    <Button size="sm" variant="danger" onClick={handleDelete}>
                      删除
                    </Button>
                  </div>
                </div>

                {/* 标签区域（编辑模式） */}
                {isEditing && (
                  <div className="px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-[var(--text-secondary)]">标签：</span>
                      {editTags.map((tag) => (
                        <Tag key={tag} removable onRemove={() => handleRemoveTag(tag)}>
                          #{tag}
                        </Tag>
                      ))}
                      <div className="flex items-center gap-1">
                        <input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                          placeholder="添加标签..."
                          className="w-24 px-2 py-1 text-xs rounded bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent)]"
                        />
                        <Button size="sm" variant="ghost" onClick={handleAddTag}>
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 内容区域 */}
                <CardContent className="flex-1 overflow-auto p-0">
                  {isEditing ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-full p-4 bg-[var(--bg-primary)] text-[var(--text-primary)] resize-none focus:outline-none font-mono text-sm leading-relaxed"
                      placeholder="使用 Markdown 格式编写..."
                    />
                  ) : (
                    <div className="p-4">
                      {/* 显示标签 */}
                      {selectedNote.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {selectedNote.tags.map((tag) => (
                            <Tag key={tag} variant="primary">
                              #{tag}
                            </Tag>
                          ))}
                        </div>
                      )}
                      {/* Markdown 渲染 */}
                      <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-primary)] prose-strong:text-[var(--text-primary)] prose-a:text-[var(--accent)]">
                        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                          {selectedNote.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </CardContent>

                {/* 底部信息栏 */}
                <div className="px-4 py-2 border-t border-[var(--border-color)] text-xs text-[var(--text-secondary)] flex justify-between">
                  <span>创建于 {formatDate(selectedNote.createdAt)}</span>
                  <span>更新于 {formatDate(selectedNote.updatedAt, 'relative')}</span>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)]">
                <p className="text-6xl mb-4">📝</p>
                <p className="text-lg mb-2">选择一个笔记开始阅读</p>
                <p className="text-sm mb-4">或者创建一个新笔记</p>
                <Button onClick={handleNewNote}>创建新笔记</Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
