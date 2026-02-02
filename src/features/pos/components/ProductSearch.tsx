'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useProducts } from '@/features/products/hooks/useProducts';
import { usePOSStore } from '@/features/pos/store/usePOSStore';
import type { ProductResponseDto } from '@/types/generated/productResponseDto';
import type { VariantResponseDto } from '@/types/generated/variantResponseDto';
import { formatAmount } from '@/lib/utils';
import { AlertCircle, Package, Plus, Search } from 'lucide-react';
import { useState } from 'react';

export function ProductSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponseDto | null>(null);
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const limit = 12;

  const { data: productsData, isLoading } = useProducts({
    page,
    limit,
    search: searchQuery || undefined,
  });

  const addItem = usePOSStore((state) => state.addItem);

  const products = productsData?.data || [];
  const totalPages = productsData?.pagination?.totalPages || 1;

  const handleProductClick = (product: ProductResponseDto) => {
    // Check if product has variants
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      setSelectedProduct(product);
      setShowVariantDialog(true);
    } else {
      addToCart(product);
    }
  };

  const addToCart = (product: ProductResponseDto, variant?: VariantResponseDto) => {
    const itemName = variant
      ? `${product.name} - ${variant.name}`
      : product.name;
    const itemSku = variant?.sku || product.sku;
    const itemPrice = variant?.price || product.sellingPrice;
    const stock = variant
      ? (variant.stock ?? variant.inventory?.quantity ?? 0)
      : (product.totalStock ?? product.inventory?.quantity ?? 0);

    if (stock <= 0) {
      return; // Don't add if out of stock
    }

    addItem({
      productId: product.id,
      variantId: variant?.id,
      name: itemName,
      sku: itemSku,
      unitPrice: itemPrice,
      quantity: 1,
      product,
      variant,
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search products by name or SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-16 w-16 rounded shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Package className="w-12 h-12 mb-2" />
            <p className="text-sm">No products found</p>
          </div>
        ) : (
          products.map((product) => {
            const stock = product.totalStock ?? product.inventory?.quantity ?? 0;
            const outOfStock = stock <= 0;
            const lowStock = stock > 0 && stock <= 5;
            const hasVariants = product.hasVariants && product.variants && product.variants.length > 0;

            return (
              <Card
                key={product.id}
                className={`cursor-pointer transition-all ${
                  outOfStock
                    ? 'opacity-60 cursor-not-allowed bg-muted/30'
                    : 'hover:shadow-md hover:border-primary/50 hover:bg-accent/5'
                }`}
                onClick={() => !outOfStock && handleProductClick(product)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className={`p-3 rounded-lg shrink-0 ${
                      outOfStock ? 'bg-destructive/10' : 'bg-primary/10'
                    }`}>
                      <Package className={`w-6 h-6 ${
                        outOfStock ? 'text-destructive' : 'text-primary'
                      }`} />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-sm line-clamp-1">
                          {product.name}
                        </h3>
                        <span className="text-lg font-bold text-primary shrink-0">
                          {formatAmount(product.sellingPrice)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs text-muted-foreground font-mono">
                          {product.sku}
                        </p>
                        {hasVariants && (
                          <Badge variant="outline" className="text-xs h-5">
                            {product.variants!.length} variants
                          </Badge>
                        )}
                        {outOfStock ? (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Out of Stock
                          </Badge>
                        ) : lowStock ? (
                          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                            {stock} left
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            {stock} in stock
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Add Button */}
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product);
                      }}
                      disabled={outOfStock}
                      className="shrink-0"
                    >
                      {hasVariants ? (
                        'Select'
                      ) : (
                        <>
                          <Plus />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Variant Selection Dialog */}
      <Dialog open={showVariantDialog} onOpenChange={setShowVariantDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Variant</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="pb-3 border-b">
                <h3 className="font-semibold">{selectedProduct.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedProduct.sku}</p>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {selectedProduct.variants?.map((variant) => {
                  const variantStock = variant.stock ?? variant.inventory?.quantity ?? 0;
                  const variantOutOfStock = variantStock <= 0;
                  const variantLowStock = variantStock > 0 && variantStock <= 5;

                  return (
                    <button
                      key={variant.id}
                      onClick={() => {
                        if (!variantOutOfStock) {
                          addToCart(selectedProduct, variant);
                          setShowVariantDialog(false);
                          setSelectedProduct(null);
                        }
                      }}
                      disabled={variantOutOfStock}
                      className={`w-full text-left p-4 border rounded-lg transition-all ${
                        variantOutOfStock
                          ? 'opacity-50 cursor-not-allowed bg-muted/30'
                          : 'hover:bg-muted hover:border-primary'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1">{variant.name}</h4>
                          {variant.sku && (
                            <p className="text-xs text-muted-foreground font-mono mb-2">
                              SKU: {variant.sku}
                            </p>
                          )}
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-primary">
                              {formatAmount(variant.price)}
                            </span>
                            {variantOutOfStock ? (
                              <Badge variant="destructive" className="text-xs">
                                Out of Stock
                              </Badge>
                            ) : variantLowStock ? (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-orange-100 text-orange-800"
                              >
                                {variantStock} left
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-green-100 text-green-800"
                              >
                                {variantStock} in stock
                              </Badge>
                            )}
                          </div>
                        </div>
                        {!variantOutOfStock && (
                          <Plus className="w-5 h-5 text-muted-foreground shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
