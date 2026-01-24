import { ApiResponse } from "@/types/api";


export interface AuthData {
    user: User;
    accessToken: string;
    refreshToken: string;
    refreshTokenExpires: string; // ISO date
  }

  export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    isActive: boolean;
    lastLogin: string; // ISO date
    roleId: string;
    role: Role;
    createdAt: string; // ISO date
    updatedAt: string; // ISO date
  }

  export interface Role {
    id: string;
    name: string;
    code: string;
    description: string;
    isSystem: boolean;
    createdAt: string; // ISO date
    updatedAt: string; // ISO date
  }

  export type AuthResponse = ApiResponse<AuthData>;