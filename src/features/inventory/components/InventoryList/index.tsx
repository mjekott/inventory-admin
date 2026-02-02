"use client";

import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { PageGuard } from '@/features/auth/components/PageGuard';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Package,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useInventory, useLowStockInventory } from '../../hooks/useInventory';
import { AdjustStockDialog } from '../AdjustStockDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function InventoryList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedInventory, setSelectedInventory] = useState<{
    id: string;
    productName: string;
    currentStock: number;
  } | null>(null);

  // Fetch inventory data
  const { data, isLoading, isError, refetch } = useInventory({
    page,
    limit,
  });

  // Fetch low stock count
  const { data: lowStockData } = useLowStockInventory({
    page: 1,
    limit: 1,
  });

  const inventoryData = data?.data || [];
  const pagination = data?.pagination;
  const lowStockCount = lowStockData?.pagination?.total || 0;

  const getStockStatus = (currentStock: number, minimumStock?: number) => {
    if (!minimumStock) return 'normal';
    if (currentStock === 0) return 'out';
    if (currentStock <= minimumStock) return 'low';
    if (currentStock >= minimumStock * 3) return 'high';
    return 'normal';
  };

  const getStockPercentage = (currentStock: number, minimumStock?: number) => {
    if (!minimumStock || minimumStock === 0) return 50;
    const maxStock = minimumStock * 5; // Assume max is 5x minimum
    return Math.min((currentStock / maxStock) * 100, 100);
  };

  return (
    <PageGuard permissions={['inventory:read']}>
      <div className="space-y-6">
        <PageHeader
          title="Inventory Management"
          description="Monitor and manage your stock levels"
          action={
            <div className="flex gap-2">
              <Link href="/dashboard/inventory/low-stock">
                <Button variant="outline" className="relative">
                  <AlertTriangle />
                  Low Stock Alerts
                  {lowStockCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="ml-2 px-1.5 py-0 text-xs min-w-[20px] h-5 flex items-center justify-center"
                    >
                      {lowStockCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw />
                Refresh
              </Button>
            </div>
          }
        />

        {/* Error State */}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load inventory data. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Inventory Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU / Variant</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-10 h-10 rounded-lg" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : inventoryData.length === 0 ? (
                  // Empty state
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Package className="w-12 h-12" />
                        <p className="text-sm">No inventory items found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  // Data rows
                  inventoryData.map((item) => {
                    const product = item.product;
                    const variant = item.variant;
                    const productName = variant
                      ? `${product?.name} - ${variant.name}`
                      : product?.name || 'Unknown Product';
                    const sku = variant?.sku || product?.sku || '-';
                    const currentStock = item.quantity || 0;
                    const status = getStockStatus(currentStock, item.minimumStock);

                    return (
                      <TableRow
                        key={item.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => router.push(`/dashboard/inventory/${item.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                              <Package className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {productName}
                              </p>
                              {variant && (
                                <p className="text-xs text-muted-foreground">
                                  Variant
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{sku}</TableCell>
                        <TableCell>
                          <div className="space-y-1.5 w-32">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium">{currentStock}</span>
                              {item.minimumStock && (
                                <span className="text-muted-foreground">
                                  Min: {item.minimumStock}
                                </span>
                              )}
                            </div>
                            <Progress
                              value={getStockPercentage(
                                currentStock,
                                item.minimumStock
                              )}
                              className="h-1.5"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={status} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.updatedAt
                            ? new Date(item.updatedAt).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInventory({
                                id: item.id,
                                productName,
                                currentStock,
                              });
                            }}
                          >
                            Adjust Stock
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="text-sm">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Adjust Stock Dialog */}
        {selectedInventory && (
          <AdjustStockDialog
            open={!!selectedInventory}
            onOpenChange={(open) => !open && setSelectedInventory(null)}
            inventoryId={selectedInventory.id}
            productName={selectedInventory.productName}
            currentStock={selectedInventory.currentStock}
          />
        )}
      </div>
    </PageGuard>
  );
}
