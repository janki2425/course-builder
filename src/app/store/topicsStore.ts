import { create } from 'zustand';

export type TopicType = 'text' | 'image' | 'video' | 'table' | 'information';

export type Topic = {
  id: number;
  type: TopicType;
  title: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  tableData?: string[][]; // for table topic
};

type TopicsState = {
  topicsByModule: { [moduleId: string]: Topic[] };
  activeTopicId: number | null;
  addTopic: (moduleId: string, type: TopicType, title: string) => void;
  setActiveTopicId: (id: number) => void;
  updateTopic: (moduleId: string, topicId: number, data: Partial<Topic>) => void;
  deleteTopic: (moduleId: string, topicId: number) => void;
};

export const useTopicsStore = create<TopicsState>((set) => ({
  topicsByModule: {},
  activeTopicId: null,
  addTopic: (moduleId, type, title) =>
    set((state) => {
      const newTopic: Topic = {
        id: Date.now(),
        type,
        title,
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
}));
