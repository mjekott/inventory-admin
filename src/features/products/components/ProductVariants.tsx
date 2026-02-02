"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ProductResponseDto } from '@/types/generated/productResponseDto';
import { AlertCircle, Download, Package, Plus, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { downloadVariantCsvTemplate, useDeleteVariant, useUploadVariantsCsv, useVariants } from '../hooks/useVariants';
import { CreateVariantDialog } from './CreateVariantDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

interface ProductVariantsProps {
  product: ProductResponseDto;
}

export function ProductVariants({ product }: ProductVariantsProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deleteVariantId, setDeleteVariantId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: variants = [], isLoading, isError } = useVariants(product.id);
  const { mutate: deleteVariant, isPending: isDeleting } = useDeleteVariant(product.id);
  const { mutate: uploadCsv, isPending: isUploading } = useUploadVariantsCsv();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleDelete = () => {
    if (deleteVariantId) {
      deleteVariant(deleteVariantId, {
        onSuccess: () => {
          setDeleteVariantId(null);
        },
      });
    }
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Product Variants</CardTitle>
            <CardDescription>
              Manage different variations of this product (e.g., sizes, colors)
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadVariantCsvTemplate}
            >
              <Download className="w-4 h-4 mr-2" />
              Template
            </Button>
            <Button
              variant="outline"
              size="sm"
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
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Variant
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Error State */}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load variants. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Variants Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Variant</TableHead>
              <TableHead>SKU</TableHead>
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
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-12 h-12 rounded" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : variants.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Package className="w-12 h-12" />
                    <p className="text-sm">No variants found</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCreateDialog(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add your first variant
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              variants.map((variant) => {
                const stock = variant.inventory?.quantity || 0;
                const minStock = variant.inventory?.minimumStock || 0;
                const isLowStock = stock <= minStock && stock > 0;
                const isOutOfStock = stock === 0;

                return (
                  <TableRow key={variant.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {variant.imageUrl ? (
                          <img
                            src={variant.imageUrl as string}
                            alt={variant.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{variant.name}</p>
                          {variant.barcode && (
                            <p className="text-xs text-muted-foreground">
                              {variant.barcode as string}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {variant.sku}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(variant.costPrice)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(variant.sellingPrice)}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      {variant.isActive ? (
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
                        onClick={() => setDeleteVariantId(variant.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Create Variant Dialog */}
      <CreateVariantDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        productId={product.id}
        productName={product.name}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteVariantId} onOpenChange={(open) => !open && setDeleteVariantId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Variant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this variant? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
