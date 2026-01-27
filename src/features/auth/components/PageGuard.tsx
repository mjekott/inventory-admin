"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Shield } from "lucide-react";
import { ReactNode } from "react";

interface PageGuardProps {
  permissions?: string[]; // empty or undefined = allow
  children: ReactNode;
  fallback?: ReactNode;
}

export function PageGuard({
  permissions,
  children,
  fallback,
}: PageGuardProps) {
  const { hasPermission } = useAuth();

  const isAllowed =
    !permissions || permissions.length === 0
      ? true
      : permissions.some(hasPermission);

  if (!isAllowed) {
    return (
      fallback ?? (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You do not have permission to access this page.
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
