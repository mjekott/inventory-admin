"use client";

import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockAuditLogs } from '@/data/mockData';
import { PageGuard } from '@/features/auth/components/PageGuard';
import { format } from 'date-fns';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Clock,
  Filter,
  History,
  Package,
  Search,
  ShoppingCart,
  User,
} from 'lucide-react';
import { useState } from 'react';

const actionIcons: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  STOCK_INWARD: { icon: ArrowDownToLine, color: 'text-success', bg: 'bg-success/10' },
  STOCK_OUTWARD: { icon: ArrowUpFromLine, color: 'text-destructive', bg: 'bg-destructive/10' },
  STOCK_ADJUSTMENT: { icon: Package, color: 'text-warning', bg: 'bg-warning/10' },
  ORDER_CREATED: { icon: ShoppingCart, color: 'text-info', bg: 'bg-info/10' },
  ORDER_STATUS_UPDATED: { icon: ShoppingCart, color: 'text-primary', bg: 'bg-primary/10' },
  PRODUCT_UPDATED: { icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
  USER_LOGIN: { icon: User, color: 'text-muted-foreground', bg: 'bg-muted' },
};

export default function AuditHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const uniqueActions = [...new Set(mockAuditLogs.map((log) => log.action))];

  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntity =
      entityFilter === 'all' || log.entityType === entityFilter;
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesEntity && matchesAction;
  });

  return (
  <PageGuard permissions={["setting:read"]}>
      <div className="space-y-6">
      <PageHeader
        title="Audit History"
        description="Complete log of all system activities and changes"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <History className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {mockAuditLogs.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <ArrowDownToLine className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {mockAuditLogs.filter((l) => l.entityType === 'stock').length}
                </p>
                <p className="text-sm text-muted-foreground">Stock Changes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-info/10">
                <ShoppingCart className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {mockAuditLogs.filter((l) => l.entityType === 'order').length}
                </p>
                <p className="text-sm text-muted-foreground">Order Activities</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-muted">
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {mockAuditLogs.filter((l) => l.entityType === 'user').length}
                </p>
                <p className="text-sm text-muted-foreground">User Activities</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by details or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Entity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="order">Order</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">Timestamp</TableHead>
                <TableHead className="w-40">Action</TableHead>
                <TableHead className="w-24">Entity</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="w-32">User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => {
                const actionStyle = actionIcons[log.action] || {
                  icon: History,
                  color: 'text-muted-foreground',
                  bg: 'bg-muted',
                };
                const Icon = actionStyle.icon;

                return (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      <div>
                        <p className="font-medium">
                          {format(log.timestamp, 'MMM d, yyyy')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(log.timestamp, 'h:mm:ss a')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${actionStyle.bg}`}>
                          <Icon className={`w-4 h-4 ${actionStyle.color}`} />
                        </div>
                        <span className="text-xs font-medium">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground capitalize">
                        {log.entityType}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.details}
                    </TableCell>
                    <TableCell className="font-medium">{log.userName}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  </PageGuard>
  );
}
