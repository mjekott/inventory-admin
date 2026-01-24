"use client";

import { Sidebar } from '@/components/layout/Sidebar';
import { AuthProvider } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

export default function DashboardGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  

  return (
  <AuthProvider>
      <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  </AuthProvider>
  );
}
