"use client";

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle, AlertTriangle, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { useState } from 'react';
import { useLowStockInventory } from '../hooks/useInventory';
import { AdjustStockDialog } from './AdjustStockDialog';

export function LowStockAlerts() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedInventory, setSelectedInventory] = useState<{
    id: string;
    productName: string;
    currentStock: number;
  } | null>(null);

  const { data, isLoading, isError } = useLowStockInventory({
    page,
    limit,
  });

  const lowStockItems = data?.data || [];
  const pagination = data?.pagination;

  const getUrgencyBadge = (currentStock: number, minimumStock?: number) => {
    if (!minimumStock) return null;
    if (currentStock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (currentStock <= minimumStock * 0.5) {
      return <Badge variant="destructive">Critical</Badge>;
    }
    return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
  };

  const getStockPercentage = (currentStock: number, minimumStock?: number) => {
    if (!minimumStock || minimumStock === 0) return 0;
    return Math.min((currentStock / minimumStock) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Items below minimum stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load low stock data. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Low Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Min Stock</TableHead>
                <TableHead>Stock Health</TableHead>
                <TableHead>Urgency</TableHead>
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
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : lowStockItems.length === 0 ? (
                // Empty state
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Package className="w-12 h-12" />
                      <p className="text-sm font-medium">No low stock items</p>
                      <p className="text-xs">All products are adequately stocked</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Data rows
                lowStockItems.map((item) => {
                  const product = item.product;
                  const variant = item.variant;
                  const productName = variant
                    ? `${product?.name} - ${variant.name}`
                    : product?.name || 'Unknown Product';
                  const sku = variant?.sku || product?.sku || '-';

                  return (
                    <TableRow key={item.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <Package className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{productName}</p>
                            {variant && (
                              <p className="text-xs text-muted-foreground">Variant</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{sku}</TableCell>
                      <TableCell>
                        <span
                          className={
                            item.quantity === 0
                              ? 'font-bold text-destructive'
                              : 'font-medium'
                          }
                        >
                          {item.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.minimumStock || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5 w-32">
                          <Progress
                            value={getStockPercentage(item.quantity, item.minimumStock)}
                            className="h-2"
                            indicatorClassName={
                              item.quantity === 0
                                ? 'bg-destructive'
                                : item.quantity <= (item.minimumStock || 0) * 0.5
                                ? 'bg-orange-500'
                                : 'bg-yellow-500'
                            }
                          />
                          <p className="text-[10px] text-muted-foreground">
                            {Math.round(
                              getStockPercentage(item.quantity, item.minimumStock)
                            )}
                            % of minimum
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getUrgencyBadge(item.quantity, item.minimumStock)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setSelectedInventory({
                              id: item.id,
                              productName,
                              currentStock: item.quantity,
                            })
                          }
                        >
                          Restock
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
  );
}
