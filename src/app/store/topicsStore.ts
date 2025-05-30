import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type TopicType = 'text' | 'image' | 'video' | 'table' | 'information';

export type Topic = {
  id: number;
  type: TopicType;
  title: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  tableData?: string[][];
  duration?: number;
  topics?: Topic[];
};

type TopicsState = {
  topicsByModule: { [moduleId: string]: Topic[] };
  activeTopicId: number | null;
  addTopic: (moduleId: string, type: TopicType, title: string) => void;
  setActiveTopicId: (id: number) => void;
  updateTopic: (moduleId: string, topicId: number, data: Partial<Topic>) => void;
  deleteTopic: (moduleId: string, topicId: number) => void;
  removeModuleTopics: (moduleId: string) => void;
};

export const useTopicsStore = create<TopicsState>()(
  persist(
    (set) => ({
      topicsByModule: {},
      activeTopicId: null,
      addTopic: (moduleId, type, title) =>
    set((state) => {
      const newTopic: Topic = {
        id: Date.now(),
        type,
        title,
        duration: 15,
        ...(type === 'table' ? { tableData: [['Header 1', 'Header 2'], ['Cell content', 'Cell content']] } : {}),
      };
      return {
        topicsByModule: {
          ...state.topicsByModule,
          [moduleId]: [...(state.topicsByModule[moduleId] || []), newTopic],
        },
        activeTopicId: newTopic.id,
      };
    }),
  setActiveTopicId: (id) => set({ activeTopicId: id }),
  updateTopic: (moduleId, topicId, data) =>
    set((state) => ({
      topicsByModule: {
        ...state.topicsByModule,
        [moduleId]: (state.topicsByModule[moduleId] || []).map((t) =>
          t.id === topicId ? { ...t, ...data } : t
        ),
      },
    })),
  deleteTopic: (moduleId, topicId) =>
    set((state) => ({
      topicsByModule: {
        ...state.topicsByModule,
        [moduleId]: (state.topicsByModule[moduleId] || []).filter((t) => t.id !== topicId),
      },
      activeTopicId: state.activeTopicId === topicId ? null : state.activeTopicId,
    })),
  removeModuleTopics: (moduleId) =>
    set((state) => {
      const newTopicsByModule = { ...state.topicsByModule };
      delete newTopicsByModule[moduleId];
      return { topicsByModule: newTopicsByModule };
    }),
  }),
  {
    name: 'topics',
    partialize: (state) => ({
      topicsByModule: state.topicsByModule,
      activeTopicId: state.activeTopicId,
    }),
    storage: createJSONStorage(() => localStorage),
  }
  )
);


