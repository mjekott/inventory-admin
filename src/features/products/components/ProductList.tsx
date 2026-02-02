"use client";

import { PageHeader } from '@/components/shared/PageHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageGuard } from '@/features/auth/components/PageGuard';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Package,
  Plus,
  Search,
  Upload,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProductResponseDto } from '@/types/generated/productResponseDto';
import { downloadProductCsvTemplate, useProducts, useUploadProductsCsv } from '../hooks/useProducts';
import { CreateProductDialog } from './CreateProductDialog';
import { EditProductDialog } from './EditProductDialog';

export function ProductList() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponseDto | null>(null);

  const { data, isLoading, isError } = useProducts({
    page,
    limit,
    search: searchTerm || undefined,
  });
  const { mutate: uploadCsv, isPending: isUploading } = useUploadProductsCsv();

  const products = data?.data || [];
  const pagination = data?.pagination;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadCsv(file);
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <PageGuard permissions={['inventory:read']}>
      <div className="space-y-6">
        <PageHeader
          title="Products"
          description="Manage your product catalog"
          action={
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={downloadProductCsvTemplate}
              >
                <Download className="w-4 h-4 mr-2" />
                Template
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload CSV'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          }
        />

        {/* Search Bar */}
        <Card>
          <CardContent className="py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, SKU, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load products. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Cost Price</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-12 h-12 rounded" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : products.length === 0 ? (
                  // Empty state
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Package className="w-12 h-12" />
                        <p className="text-sm">No products found</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCreateDialog(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add your first product
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  // Data rows
                  products.map((product) => {
                    const stock = product.inventory?.quantity || 0;
                    const minStock = product.inventory?.minimumStock || 0;
                    const isLowStock = product.trackInventory && stock <= minStock && stock > 0;
                    const isOutOfStock = product.trackInventory && stock === 0;

                    return (
                      <TableRow
                        key={product.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => router.push(`/dashboard/products/${product.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl as string}
                                alt={product.name}
                                className="w-12 h-12 rounded object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                                <Package className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{product.name}</p>
                              {product.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {product.description as string}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {product.sku}
                        </TableCell>
                        <TableCell>
                          {product.category?.name || '-'}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(product.costPrice)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(product.sellingPrice)}
                        </TableCell>
                        <TableCell>
                          {product.trackInventory ? (
                            <span
                              className={
                                isOutOfStock
                                  ? 'text-destructive font-semibold'
                                  : isLowStock
                                  ? 'text-yellow-600 font-semibold'
                                  : ''
                              }
                            >
                              {stock}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {product.isActive ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingProduct(product);
                            }}
                          >
                            <Edit className="w-4 h-4" />
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
        {pagination && pagination.total > limit && (
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
                    Page {pagination.page}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={products.length < limit}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Product Dialog */}
        <CreateProductDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />

        {/* Edit Product Dialog */}
        {editingProduct && (
          <EditProductDialog
            open={!!editingProduct}
            onOpenChange={(open) => {
              if (!open) setEditingProduct(null);
            }}
            product={editingProduct}
          />
        )}
      </div>
    </PageGuard>
  );
}
