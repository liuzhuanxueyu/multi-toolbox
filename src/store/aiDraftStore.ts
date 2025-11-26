import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AIDraft {
  id: string;
  prompt: string;
  response: string;
  model: string;
  createdAt: string;
}

interface AIDraftState {
  drafts: AIDraft[];
  addDraft: (draft: Omit<AIDraft, 'id' | 'createdAt'>) => void;
  deleteDraft: (id: string) => void;
  clearDrafts: () => void;
}

/**
 * AI 草稿状态管理
 * 持久化到 localStorage
 */
export const useAIDraftStore = create<AIDraftState>()(
  persist(
    (set) => ({
      drafts: [],

      addDraft: (draft) =>
        set((state) => ({
          drafts: [
            {
              ...draft,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
            ...state.drafts,
          ].slice(0, 50), // 最多保存 50 条历史
        })),

      deleteDraft: (id) =>
        set((state) => ({
          drafts: state.drafts.filter((d) => d.id !== id),
        })),

      clearDrafts: () => set({ drafts: [] }),
    }),
    {
      name: 'ai-draft-storage',
    }
  )
);

