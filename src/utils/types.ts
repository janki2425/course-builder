export type TopicType = 'text' | 'image' | 'video' | 'table' | 'information' | 'file' | 'quiz';

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
  quizData?: Quiz;
};

export type QuestionType = 'single' | 'multiple';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  title: string;
  content?: string;
  questions: QuizQuestion[];
}