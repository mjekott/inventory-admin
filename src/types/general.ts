// ============================================
// Base API Response Types
// ============================================

export type ApiResponse<T> = {
    message: string;
    data: T;
  };

// ============================================
// Extended Types (Not in OpenAPI spec)
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isActive: boolean;
  lastLogin: string | null;
  roleId: string;
  role: {
    id: string;
    name: string;
    code: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderWithCreator {
  creator?: User;
}

