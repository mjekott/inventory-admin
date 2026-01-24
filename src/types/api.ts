// ============================================
// Base API Response Types
// ============================================

export type ApiResponse<T> = {
    message: string;
    data: T;
  };
  
  export type PaginatedData<T> = {
    data: T[];
    meta: Meta;
  };
  
  export type Meta = {
    page: number;
    take: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
