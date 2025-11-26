import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useNotesStore, type Note } from '../../store/notesStore';
import { formatDate } from '../../utils/date';

export function NotesPage() {
  const { notes, addNote, updateNote, deleteNote } = useNotesStore();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const handleNewNote = () => {
    addNote({
      title: '新笔记',
      content: '# 新笔记\n\n开始写点什么...',
      tags: [],
    });
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (selectedNote) {
      updateNote(selectedNote.id, {
        title: editTitle,
        content: editContent,
      });
      setSelectedNote({ ...selectedNote, title: editTitle, content: editContent });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (selectedNote) {
      deleteNote(selectedNote.id);
      setSelectedNote(null);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* 笔记列表 */}
      <div className="w-80 flex-shrink-0">
        <Card variant="bordered" className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
            <CardTitle className="mb-0">📝 笔记</CardTitle>
            <Button size="sm" onClick={handleNewNote}>
              +
            </Button>
          </div>
          <CardContent className="flex-1 overflow-auto p-2">
            <div className="space-y-2">
              {notes.length === 0 ? (
                <p className="text-[var(--text-secondary)] text-center py-8">
                  暂无笔记，点击 + 创建
                </p>
              ) : (
                notes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => handleSelectNote(note)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedNote?.id === note.id
                        ? 'bg-[var(--accent)] text-white'
                        : 'hover:bg-[var(--border-color)]'
                    }`}
                  >
                    <div className="font-medium truncate">{note.title}</div>
                    <div
                      className={`text-xs mt-1 ${
                        selectedNote?.id === note.id
                          ? 'text-white/70'
                          : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {formatDate(note.updatedAt, 'relative')}
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 笔记内容 */}
      <div className="flex-1">
        <Card variant="bordered" className="h-full flex flex-col">
          {selectedNote ? (
            <>
              <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
                {isEditing ? (
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-lg font-bold"
                  />
                ) : (
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    {selectedNote.title}
                  </h2>
                )}
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button size="sm" onClick={handleSave}>
                        保存
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setIsEditing(false)}
                      >
                        取消
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" onClick={() => setIsEditing(true)}>
                        编辑
                      </Button>
                      <Button size="sm" variant="danger" onClick={handleDelete}>
                        删除
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <CardContent className="flex-1 overflow-auto p-4">
                {isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-full p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                ) : (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[var(--text-secondary)]">
              选择一个笔记或创建新笔记
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

