"use client";

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageGuard } from '@/features/auth/components/PageGuard';
import { AdjustStockDialog } from '@/features/inventory/components/AdjustStockDialog';
import { InventoryTransactions } from '@/features/inventory/components/InventoryTransactions';
import { useInventoryDetail } from '@/features/inventory/hooks/useInventory';
import { AlertCircle, ArrowLeft, Package, TrendingDown, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function InventoryDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);

  const { data, isLoading, isError } = useInventoryDetail(id);
  const inventory = data?.data;

  const product = inventory?.product || inventory?.variant?.product;
  const variant = inventory?.variant;
  const productName = variant
    ? `${product?.name} - ${variant.name}`
    : product?.name || 'Unknown Product';
  const sku = variant?.sku || product?.sku || '-';

  if (isLoading) {
    return (
      <PageGuard permissions={['inventory:read']}>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </PageGuard>
    );
  }

  if (isError || !inventory) {
    return (
      <PageGuard permissions={['inventory:read']}>
        <div className="space-y-6">
          <Link href="/dashboard/inventory">
            <Button variant="ghost">
              <ArrowLeft />
              Back to Inventory
            </Button>
          </Link>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load inventory details. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </PageGuard>
    );
  }

  const stockHealth = inventory.minimumStock
    ? (inventory.quantity / inventory.minimumStock) * 100
    : 100;
  const isLowStock = inventory.minimumStock && inventory.quantity <= inventory.minimumStock;
  const isOutOfStock = inventory.quantity === 0;

  return (
    <PageGuard permissions={['inventory:read']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Link href="/dashboard/inventory" className="mb-2 inline-block">
              <Button variant="ghost">
                <ArrowLeft />
                Back to Inventory
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">{productName}</h1>
            <p className="text-muted-foreground">SKU: {sku}</p>
          </div>
          <Button onClick={() => setShowAdjustDialog(true)}>
            Adjust Stock
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Stock</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventory.quantity}</div>
              {isOutOfStock && (
                <Badge variant="destructive" className="mt-2">Out of Stock</Badge>
              )}
              {isLowStock && !isOutOfStock && (
                <Badge variant="secondary" className="mt-2 bg-yellow-100 text-yellow-800">
                  Low Stock
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Minimum Stock</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventory.minimumStock || 'Not Set'}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Reorder threshold
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Health</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(stockHealth)}%
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Of minimum stock level
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {inventory.updatedAt
                  ? new Date(inventory.updatedAt).toLocaleDateString()
                  : 'Never'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {inventory.updatedAt
                  ? new Date(inventory.updatedAt).toLocaleTimeString()
                  : ''}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Product Details */}
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Product Name</p>
                <p className="text-base font-medium">{product?.name || '-'}</p>
              </div>
              {variant && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Variant</p>
                  <p className="text-base font-medium">{variant.name}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">SKU</p>
                <p className="text-base font-mono">{sku}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <p className="text-base">{variant ? 'Product Variant' : 'Base Product'}</p>
              </div>
            </div>

            {product?.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-base">{product.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction History */}
        <InventoryTransactions inventoryId={id} productName={productName} />

        {/* Adjust Stock Dialog */}
        {showAdjustDialog && (
          <AdjustStockDialog
            open={showAdjustDialog}
            onOpenChange={setShowAdjustDialog}
            inventoryId={id}
            productName={productName}
            currentStock={inventory.quantity}
          />
        )}
      </div>
    </PageGuard>
  );
}
