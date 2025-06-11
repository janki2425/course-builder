export type TopicType = 'text' | 'image' | 'video' | 'table' | 'information';

export type Topic = {
  id: number;
  uniqueId: string;
  type: TopicType;
  title: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  tableData?: string[][];
  duration?: number;
  topics?: Topic[];
  boxColor?: string[];
};

