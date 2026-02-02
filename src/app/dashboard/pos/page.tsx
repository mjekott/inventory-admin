'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { Cart } from '@/features/pos/components/Cart';
import { CheckoutPanel } from '@/features/pos/components/CheckoutPanel';
import { ProductSearch } from '@/features/pos/components/ProductSearch';
import { usePOSStore } from '@/features/pos/store/usePOSStore';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function POSPage() {
  const clearCart = usePOSStore((state) => state.clearCart);
  const cartItems = usePOSStore((state) => state.cartItems);

  return (
    <div className="space-y-4">
      <PageHeader
        title="POS Terminal"
        description="Point of sale - quick order creation"
        action={
          cartItems.length > 0 && (
            <Button variant="outline" onClick={clearCart}>
              <RotateCcw />
              Reset Session
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left: Product Search - 2 columns */}
        <div className="xl:col-span-2">
          <ProductSearch />
        </div>

        {/* Right: Cart & Checkout - 1 column */}
        <div className="space-y-4">
          <Cart />
          <CheckoutPanel />
        </div>
      </div>
    </div>
  );
}
