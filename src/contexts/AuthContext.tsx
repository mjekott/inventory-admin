"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, Permission } from '@/types/inventory';
import { mockUsers, mockRoles, mockPermissions } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
  hasPermissionCode: (permissionCode: string | string[]) => boolean;
  getUserPermissions: () => Permission[];
  isSuperAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const roleHierarchy: Record<string, number> = {
  super_admin: 4,
  admin: 3,
  manager: 2,
  staff: 1,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, _password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    const foundUser = mockUsers.find((u) => u.email === email && u.isActive);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const hasPermission = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!user) return false;

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const userLevel = roleHierarchy[user.role] || 0;

    return roles.some((role) => userLevel >= (roleHierarchy[role] || 0));
  };

  const hasPermissionCode = (permissionCode: string | string[]): boolean => {
    if (!user) return false;

    // Super admin has all permissions
    if (user.role === 'super_admin') return true;

    const userRole = mockRoles.find(r => r.id === user.roleId);
    if (!userRole) return false;

    const codes = Array.isArray(permissionCode) ? permissionCode : [permissionCode];
    const userPermissions = mockPermissions.filter(p => userRole.permissions.includes(p.id));

    return codes.some(code => userPermissions.some(p => p.code === code));
  };

  const getUserPermissions = (): Permission[] => {
    if (!user) return [];

    const userRole = mockRoles.find(r => r.id === user.roleId);
    if (!userRole) return [];

    return mockPermissions.filter(p => userRole.permissions.includes(p.id));
  };

  const isSuperAdmin = (): boolean => {
    return user?.role === 'super_admin';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
        hasPermissionCode,
        getUserPermissions,
        isSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
