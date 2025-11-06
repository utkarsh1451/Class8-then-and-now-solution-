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
}

export interface Unit {
  id: number;
  title: string;
  icon: string;
  chapters: Chapter[];
}
