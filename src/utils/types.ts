export type TopicType = 'text' | 'image' | 'video' | 'table' | 'information' | 'file';

export type Topic = {
  id: number;
  uniqueId: string;
  type: TopicType;
  title: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  fileUrl?:string;
  tableData?: string[][];
  duration?: number;
  topics?: Topic[];
  boxColor?: string[];
};

