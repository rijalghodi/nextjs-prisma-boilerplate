export type PaginatedParams = {
  page?: number;
  limit?: number;
  sort?: string;
  dir?: string;
  status?: string;
  search?: string;
};

export type PaginatedResponse<T> = {
  ok: boolean;
  message: string;
  data: T[];
  empty: boolean;
  pagination: {
    total: number;
    page: number;
    from: number;
    to: number;
    [key: string]: any;
  };
};

export type BaseResponse<T> = {
  ok: boolean;
  message: string;
  data?: T;
};

export type BadRequestDetail<T> = {
  field: keyof T;
  message: string;
  source?: "body" | "query" | "path";
};

export type ErrorResponse<T> = {
  ok: boolean;
  message: string;
  details?: BadRequestDetail<T>[];
};

export type GlobalResponse<T> = BaseResponse<T> | ErrorResponse<T> | PaginatedResponse<T>;
