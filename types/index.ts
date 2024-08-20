export interface Questionnaire {
  name: string;
  createdAt: Date;
  questions: [];
}

export interface Question {
  id: number;
  question: string;
  typeField: TypeField;
  options?: Option[];
  description?: string;
}

export interface Option {
  id: string;
  name: string;
}

export type TypeField = "text" | "multiple" | "select" | "splash";
