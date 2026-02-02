"use client";

import { PageHeader } from '@/components/shared/PageHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageGuard } from '@/features/auth/components/PageGuard';
import { ProductVariants } from '@/features/products/components/ProductVariants';
import { useProduct } from '@/features/products/hooks/useProducts';
import { AlertCircle, ArrowLeft, Package } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const { data: product, isLoading, isError } = useProduct(productId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <PageGuard permissions={['inventory:read']}>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PageGuard>
    );
  }

  if (isError || !product) {
    return (
      <PageGuard permissions={['inventory:read']}>
        <div className="space-y-6">
          <PageHeader
            title="Product Details"
            action={
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            }
          />
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load product details. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </PageGuard>
    );
  }

  return (
    <PageGuard permissions={['inventory:read']}>
      <div className="space-y-6">
        <PageHeader
          title={product.name}
          description={`SKU: ${product.sku}`}
          action={
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          }
        />

        {/* Product Information */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product Image */}
              {product.imageUrl ? (
                <img
                  src={product.imageUrl as string}
                  alt={product.name}
                  className="w-full h-48 rounded object-cover"
                />
              ) : (
                <div className="w-full h-48 rounded bg-muted flex items-center justify-center">
                  <Package className="w-16 h-16 text-muted-foreground" />
                </div>
              )}

              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{product.name}</p>
                </div>

                {product.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm">{product.description as string}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">SKU</p>
                    <p className="font-mono text-sm">{product.sku}</p>
                  </div>

                  {product.barcode && (
                    <div>
                      <p className="text-sm text-muted-foreground">Barcode</p>
                      <p className="font-mono text-sm">{product.barcode as string}</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {product.isActive ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Classification & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Classification</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Category</span>
                    <span className="text-sm font-medium">
                      {product.category?.name || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Brand</span>
                    <span className="text-sm font-medium">
                      {product.brand?.name || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Manufacturer</span>
                    <span className="text-sm font-medium">
                      {product.manufacturer?.name || '-'}
                    </span>
                  </div>
                  {product.unit && (
                    <div className="flex justify-between">
                      <span className="text-sm">Unit</span>
                      <span className="text-sm font-medium">
                        {product.unit as string}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Pricing</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Cost Price</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(product.costPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Selling Price</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(product.sellingPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Margin</span>
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(product.sellingPrice - product.costPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {!product.hasVariants && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Inventory</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Current Stock</span>
                      <span className="text-sm font-medium">
                        {product.inventory?.quantity || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Minimum Stock</span>
                      <span className="text-sm font-medium">
                        {product.inventory?.minimumStock || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Track Inventory</span>
                      <span className="text-sm font-medium">
                        {product.trackInventory ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {product.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{product.notes as string}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Variants Section - Always show so users can add variants */}
        <ProductVariants product={product} />
      </div>
    </PageGuard>
  );
}
