export interface QuestionAnswer {
  q: string;
  a: string;
  isTable?: boolean;
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export interface ContentSection {
  title: string;
  questions: QuestionAnswer[];
}

export interface Chapter {
  id: number;
  title: string;
  active: boolean;
  summary: string;
}

export interface Unit {
  id: number;
  title: string;
  icon: string;
  chapters: Chapter[];
}

export interface Message {
  role: 'user' | 'model' | 'loading' | 'error';
  content: string;
  image?: string;
}

export interface UserInfo {
  name: string;
  dob: string;
}

export interface DownloadedFile {
  id: string;
  name: string;
  unitTitle: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}
