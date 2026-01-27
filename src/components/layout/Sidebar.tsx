"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Box,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  History,
  LayoutDashboard,
  Monitor,
  Package,
  Ruler,
  Settings,
  Shield,
  ShoppingCart,
  Tag,
  Users,
  UsersRound
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const mainNavigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
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
];

const manageNavigation = [
  {
    name: 'Inventory',
    href: '/dashboard/inventory',
    icon: Package,
    permissions: ["inventory:create"],
  },
  {
    name: 'Manufacturers',
    href: '/dashboard/manufacturers',
    icon: Building2,
    permissions: ["inventory:create"],
  },
  {
    name: 'Brands',
    href: '/dashboard/brands',
    icon: Tag,
    permissions: ["inventory:create"],
  },
  {
    name: 'Units',
    href: '/dashboard/units',
    icon: Ruler,
    permissions: ["inventory:create"],
  },
  {
    name: 'Product Categories',
    href: '/dashboard/categories',
    icon: FolderOpen,
    permissions: ["inventory:create"],
  },
  {
    name: 'Products',
    href: '/dashboard/products',
    icon: Box,
    permissions: ["inventory:create"],
  },
];

const operationsNavigation = [
  {
    name: 'Staff Management',
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
    name: 'Audit History',
    href: '/dashboard/audit',
    icon: History,
    permissions: ["settings:read"],
  },
];

const settingsNavigation = [
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
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    manage: false,
    operations: false,
    settings: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const filterNavigation = (items: typeof mainNavigation) => {
    return items.filter((item) => {
      // No permissions means allow
      if (!item.permissions || item.permissions.length === 0) {
        return true;
      }

      // At least one permission must match
      return item.permissions.some(hasPermission);
    });
  };

  const filteredMainNavigation = filterNavigation(mainNavigation);
  const filteredManageNavigation = filterNavigation(manageNavigation);
  const filteredOperationsNavigation = filterNavigation(operationsNavigation);
  const filteredSettingsNavigation = filterNavigation(settingsNavigation);


  return (
    <TooltipProvider delayDuration={0}>
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
        {/* Main Navigation */}
        {filteredMainNavigation.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/dashboard');
          const linkContent = (
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

          if (collapsed) {
            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.name}</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}

        {/* Manage Section */}
        {filteredManageNavigation.length > 0 && (
          <>
            <div className="pt-4">
              {!collapsed ? (
                <button
                  onClick={() => toggleSection('manage')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-sidebar-muted uppercase tracking-wider hover:text-sidebar-foreground transition-colors"
                >
                  <span>Manage</span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform',
                      openSections.manage ? 'rotate-0' : '-rotate-90'
                    )}
                  />
                </button>
              ) : (
                <div className="h-px bg-sidebar-border mx-3" />
              )}
            </div>
            {(openSections.manage || collapsed) && filteredManageNavigation.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/dashboard');
              const linkContent = (
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

              if (collapsed) {
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      {linkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.name}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return linkContent;
            })}
          </>
        )}

        {/* Operations Section */}
        {filteredOperationsNavigation.length > 0 && (
          <>
            <div className="pt-4">
              {!collapsed ? (
                <button
                  onClick={() => toggleSection('operations')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-sidebar-muted uppercase tracking-wider hover:text-sidebar-foreground transition-colors"
                >
                  <span>Operations</span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform',
                      openSections.operations ? 'rotate-0' : '-rotate-90'
                    )}
                  />
                </button>
              ) : (
                <div className="h-px bg-sidebar-border mx-3" />
              )}
            </div>
            {(openSections.operations || collapsed) && filteredOperationsNavigation.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/dashboard');
              const linkContent = (
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

              if (collapsed) {
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      {linkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.name}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return linkContent;
            })}
          </>
        )}

        {/* Settings Section */}
        {filteredSettingsNavigation.length > 0 && (
          <>
            <div className="pt-4">
              {!collapsed ? (
                <button
                  onClick={() => toggleSection('settings')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-sidebar-muted uppercase tracking-wider hover:text-sidebar-foreground transition-colors"
                >
                  <span>Settings</span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform',
                      openSections.settings ? 'rotate-0' : '-rotate-90'
                    )}
                  />
                </button>
              ) : (
                <div className="h-px bg-sidebar-border mx-3" />
              )}
            </div>
            {(openSections.settings || collapsed) && filteredSettingsNavigation.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/dashboard');
              const linkContent = (
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

              if (collapsed) {
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      {linkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.name}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return linkContent;
            })}
          </>
        )}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-sidebar-border">
        {user && (
          <div
            onClick={() => setShowLogoutDialog(true)}
            className={cn(
              'flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-sidebar-accent transition-colors',
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
                  {user.role?.name}
                </Badge>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You will need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowLogoutDialog(false);
                logout();
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </TooltipProvider>
  );
}
