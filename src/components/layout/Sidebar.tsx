"use client";

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  History,
  LayoutDashboard,
  LogOut,
  Monitor,
  Package,
  Settings,
  Shield,
  ShoppingCart,
  Users,
  UsersRound,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    permissions: [],
  },
  {
    name: 'POS Terminal',
    href: '/dashboard/pos',
    icon: Monitor,
    permissions: ["orders:create"],
  },
  {
    name: 'Inventory',
    href: '/dashboard/inventory',
    icon: Package,
    permissions: ["inventory:create"],
  },
  {
    name: 'Categories',
    href: '/dashboard/categories',
    icon: FolderOpen,
    permissions: ["inventory:create"],
  },
  {
    name: 'Orders',
    href: '/dashboard/orders',
    icon: ShoppingCart,
    permissions: ["orders:create"],
  },
  {
    name: 'Customers',
    href: '/dashboard/customers',
    icon: UsersRound,
    permissions: ["customers:create"],
  },
  {
    name: 'Audit History',
    href: '/dashboard/audit',
    icon: History,
    permissions: ["settings:read"],
  },
  {
    name: 'User Management',
    href: '/dashboard/users',
    icon: Users,
    permissions: ["users:create"],
  },
  {
    name: 'Roles & Permissions',
    href: '/dashboard/roles',
    icon: Shield,
    permissions: [],
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    permissions: ["settings:create"],
  },
];
export function Sidebar() {
  const pathname = usePathname();
  const { user, logout,hasPermission} = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNavigation = navigation.filter((item) => {
    // No permissions means allow
    if (!item.permissions || item.permissions.length === 0) {
      return true;
    }
  
    // At least one permission must match
    return item.permissions.some(hasPermission);
  });


  return (
    <div
      className={cn(
        'flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 relative',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center g">
            <span className="font-semibold text-sidebar-accent-foreground">
             Inventory
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="font-medium text-sm">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-sidebar-border">
        {user && (
          <div
            className={cn(
              'flex items-center gap-3 p-2 rounded-lg',
              collapsed ? 'justify-center' : ''
            )}
          >
            <Avatar className="w-9 h-9 bg-sidebar-accent">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
                  {user.name}
                </p>
                <Badge
                  className="text-[10px] px-1.5 py-0 capitalize"
                >
                  {user.role.name}
                </Badge>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className={cn(
                'text-sidebar-muted hover:text-destructive hover:bg-sidebar-accent',
                collapsed && 'absolute bottom-20 left-1/2 -translate-x-1/2'
              )}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
