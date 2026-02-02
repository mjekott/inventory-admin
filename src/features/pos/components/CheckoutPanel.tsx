'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useCustomers, useCreateCustomer } from '@/features/customers/hooks/useCustomers';
import { useCreateOrder } from '@/features/pos/hooks/useOrders';
import { useMarkOrderPaid, useCancelOrder } from '@/features/orders/hooks/useOrders';
import { usePOSStore } from '@/features/pos/store/usePOSStore';
import type { CreateOrderDto } from '@/types/generated/createOrderDto';
import type { CreateCustomerDto } from '@/types/generated/createCustomerDto';
import type { Order } from '@/types/generated/order';
import { formatAmount } from '@/lib/utils';
import { ReceiptActions } from '@/components/orders/ReceiptActions';
import { ThermalReceipt } from '@/components/orders/ThermalReceipt';
import { CreditCard, Loader2, Receipt, Search, Trash2, User, X, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { useState, useRef } from 'react';

export function CheckoutPanel() {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [newCustomerData, setNewCustomerData] = useState<CreateCustomerDto>({
    name: '',
    email: '',
    phone: '',
    customerType: 'walk-in',
  });

  const cartItems = usePOSStore((state) => state.cartItems);
  const selectedCustomer = usePOSStore((state) => state.selectedCustomer);
  const setSelectedCustomer = usePOSStore((state) => state.setSelectedCustomer);
  const paymentMethod = usePOSStore((state) => state.paymentMethod);
  const setPaymentMethod = usePOSStore((state) => state.setPaymentMethod);
  const notes = usePOSStore((state) => state.notes);
  const setNotes = usePOSStore((state) => state.setNotes);
  const discount = usePOSStore((state) => state.discount);
  const tax = usePOSStore((state) => state.tax);
  const clearCart = usePOSStore((state) => state.clearCart);
  const getTotal = usePOSStore((state) => state.getTotal);

  const { mutate: createOrder, isPending } = useCreateOrder();
  const { mutate: createCustomer, isPending: isCreatingCustomer } = useCreateCustomer();
  const { mutate: markOrderPaid, isPending: isMarkingPaid } = useMarkOrderPaid();
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();

  const total = getTotal();

  const { data: customersData, isLoading: isLoadingCustomers } = useCustomers({
    page: 1,
    limit: 20,
    search: customerSearch || undefined,
  });

  const customers = customersData?.data || [];

  const handleCreateCustomer = () => {
    if (!newCustomerData.name.trim()) {
      return;
    }

    createCustomer(newCustomerData, {
      onSuccess: (customer) => {
        setSelectedCustomer(customer);
        setIsCustomerSearchOpen(false);
        setShowCreateForm(false);
        setCustomerSearch('');
        setNewCustomerData({
          name: '',
          email: '',
          phone: '',
          customerType: 'walk-in',
        });
      },
    });
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      return;
    }

    const orderData: CreateOrderDto = {
      customerId: selectedCustomer?.id,
      orderType: 'pos',
      items: cartItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      discount,
      tax,
      paymentMethod: paymentMethod || undefined,
      notes: notes || undefined,
    };

    createOrder(orderData, {
      onSuccess: (order) => {
        // Construct receipt-compatible order object
        const receiptOrder = {
          ...order,
          customerName: selectedCustomer?.name || 'Walk-in Customer',
          customerEmail: selectedCustomer?.email || '',
          items: cartItems.map((item) => ({
            productId: item.productId,
            productName: item.name,
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        };

        // Clear the cart immediately after order creation
        clearCart();

        // Show receipt modal
        setCompletedOrder(receiptOrder);
        setShowReceipt(true);
      },
    });
  };

  const handleNewOrder = () => {
    setShowReceipt(false);
    setCompletedOrder(null);
  };

  const handleMarkPaid = () => {
    if (!completedOrder?.id) return;

    markOrderPaid(
      {
        id: completedOrder.id,
        data: { paymentMethod: completedOrder.paymentMethod || 'cash' }
      },
      {
        onSuccess: () => {
          setCompletedOrder({ ...completedOrder, isPaid: true });
        },
      }
    );
  };

  const handleCancelOrder = () => {
    if (!completedOrder?.id) return;

    cancelOrder(completedOrder.id, {
      onSuccess: () => {
        handleNewOrder();
      },
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          Checkout
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Customer Selection */}
        <div className="space-y-2">
          <Label>Customer (Optional)</Label>
          {selectedCustomer ? (
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{selectedCustomer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedCustomer.email || selectedCustomer.customerNumber}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCustomer(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsCustomerSearchOpen(true)}
            >
              <User />
              Select Customer
            </Button>
          )}
        </div>

        {/* Customer Search Dialog */}
        <Dialog open={isCustomerSearchOpen} onOpenChange={(open) => {
          setIsCustomerSearchOpen(open);
          if (!open) {
            setShowCreateForm(false);
            setCustomerSearch('');
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{showCreateForm ? 'Create New Customer' : 'Select Customer'}</DialogTitle>
            </DialogHeader>

            {showCreateForm ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    placeholder="Customer name"
                    value={newCustomerData.name}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="customer@example.com"
                    value={newCustomerData.email}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    placeholder="+1234567890"
                    value={newCustomerData.phone}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Customer Type</Label>
                  <Select
                    value={newCustomerData.customerType}
                    onValueChange={(value) => setNewCustomerData({ ...newCustomerData, customerType: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="walk-in">Walk-in</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="wholesale">Wholesale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewCustomerData({
                        name: '',
                        email: '',
                        phone: '',
                        customerType: 'walk-in',
                      });
                    }}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateCustomer}
                    disabled={!newCustomerData.name.trim() || isCreatingCustomer}
                    className="flex-1"
                  >
                    {isCreatingCustomer ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus />
                        Create
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by name or email..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(true)}
                  className="w-full"
                >
                  <UserPlus />
                  Create New Customer
                </Button>

                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {isLoadingCustomers ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-3 border rounded">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    ))
                  ) : customers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No customers found</p>
                    </div>
                  ) : (
                    customers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setIsCustomerSearchOpen(false);
                          setCustomerSearch('');
                        }}
                        className="w-full text-left p-3 border rounded hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{customer.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {customer.email || customer.customerNumber}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Payment Method */}
        <div className="space-y-2">
          <Label>Payment Method *</Label>
          <Select
            value={paymentMethod || ''}
            onValueChange={(value) => setPaymentMethod(value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="online">Online Payment</SelectItem>
              <SelectItem value="credit">Credit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label className="text-sm">Notes (Optional)</Label>
          <Textarea
            placeholder="Add order notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearCart}
            disabled={cartItems.length === 0 || isPending}
          >
            <Trash2 />
            Clear
          </Button>
          <Button
            className="flex-1"
            onClick={handleCheckout}
            disabled={cartItems.length === 0 || !paymentMethod || isPending}
            size="lg"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard />
                Complete {formatAmount(total)}
              </>
            )}
          </Button>
        </div>

        {/* Receipt Dialog */}
        {completedOrder && (
          <Dialog open={showReceipt} onOpenChange={(open) => {
            if (!open) {
              handleNewOrder();
            }
          }}>
            <DialogContent className="max-w-fit max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Order Complete!</DialogTitle>
              </DialogHeader>

              {/* Receipt Preview */}
              <div className="flex justify-center bg-muted/50 p-4 rounded-lg">
                <ThermalReceipt ref={receiptRef} order={completedOrder} />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <p className="text-sm text-muted-foreground text-center">
                  Order {completedOrder.orderNumber} created successfully
                </p>

                {/* Receipt Actions */}
                <ReceiptActions order={completedOrder} variant="button" />

                {/* Order Management Actions */}
                <div className="flex gap-2">
                  {!completedOrder.isPaid && (
                    <Button
                      onClick={handleMarkPaid}
                      disabled={isMarkingPaid}
                      className="flex-1"
                      variant="outline"
                    >
                      <CheckCircle />
                      {isMarkingPaid ? 'Marking...' : 'Mark as Paid'}
                    </Button>
                  )}
                  <Button
                    onClick={handleCancelOrder}
                    disabled={isCancelling}
                    className="flex-1"
                    variant="destructive"
                  >
                    <XCircle />
                    {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                  </Button>
                </div>

                {/* New Order Button */}
                <Button onClick={handleNewOrder} className="w-full" variant="outline">
                  New Order
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
