export interface Questionnaire {
  name: string;
  createdAt: Date;
  initialQuestion: string;
  finalQuestion: string;
  questions: Question[];
}

export interface Question {
  id: string;
  question: string;
  typeField: TypeField;
  options?: Option[];
  description?: string;
  next?: string;
  image?: Image;
}

export interface Option {
  id: string;
  name: string;
  required?: boolean;
  textArea?: boolean;
  next?: string;
  image?: Image;
}

export interface Image {
  id: string;
  url: string;
}

export type TypeField = "text" | "multiple" | "select" | "splash";
