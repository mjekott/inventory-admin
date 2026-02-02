'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { usePOSStore } from '@/features/pos/store/usePOSStore';
import { formatAmount } from '@/lib/utils';
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';

export function Cart() {
  const cartItems = usePOSStore((state) => state.cartItems);
  const updateQuantity = usePOSStore((state) => state.updateQuantity);
  const removeItem = usePOSStore((state) => state.removeItem);
  const getSubtotal = usePOSStore((state) => state.getSubtotal);
  const getTaxAmount = usePOSStore((state) => state.getTaxAmount);
  const getTotal = usePOSStore((state) => state.getTotal);
  const discount = usePOSStore((state) => state.discount);
  const setDiscount = usePOSStore((state) => state.setDiscount);
  const tax = usePOSStore((state) => state.tax);
  const setTax = usePOSStore((state) => state.setTax);

  const subtotal = getSubtotal();
  const taxAmount = getTaxAmount();
  const total = getTotal();

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Cart ({cartItems.length} items)
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Cart Items */}
        <div className="max-h-[300px] overflow-y-auto px-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm font-medium">Cart is empty</p>
              <p className="text-xs">Add products to get started</p>
            </div>
          ) : (
            <div className="space-y-3 py-3">
              {cartItems.map((item) => (
                <div key={item.id} className="space-y-2 pb-3 border-b last:border-0">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatAmount(item.unitPrice)} × {item.quantity} = {formatAmount(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center border rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-r-none"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="px-3 text-sm font-medium border-x min-w-[40px] text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-l-none"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold">{formatAmount(item.quantity * item.unitPrice)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        {cartItems.length > 0 && (
          <div className="border-t p-4 space-y-2 bg-muted/30">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-semibold">{formatAmount(subtotal)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground shrink-0">Discount:</span>
              <Input
                type="number"
                value={discount || ''}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="h-7 flex-1"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
              <span className="font-semibold text-destructive shrink-0 min-w-[80px] text-right">
                -{formatAmount(discount)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground shrink-0">Tax (%):</span>
              <Input
                type="number"
                value={tax || ''}
                onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                className="h-7 flex-1"
                min="0"
                step="0.1"
                placeholder="0"
              />
              <span className="font-semibold shrink-0 min-w-[80px] text-right">
                {formatAmount(taxAmount)}
              </span>
            </div>

            <Separator className="my-2" />

            <div className="flex justify-between items-center pt-1">
              <span className="text-base font-bold">Total:</span>
              <span className="text-2xl font-bold text-primary">{formatAmount(total)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
