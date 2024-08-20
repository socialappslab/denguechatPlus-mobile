export type ErrorResponse = {
  errors: {
    error_code: number;
    detail: string;
    field: string | null;
  }[];
};

export type BaseObject = {
  id: number;
  name: string;
};
