export interface BaseModel {
    _id?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export type ApiResponse<T> = {
    data?: T;
    error?: string;
    status: number;
  };
  
  export type Pagination = {
    page: number;
    limit: number;
    total: number;
  };
  
  export type ID = string;
  
  export interface ApiError {
    error: string;
    status?: number;
    details?: Record<string, unknown>;
  }