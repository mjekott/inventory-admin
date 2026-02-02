'use client';

import { ReceiptActions } from '@/components/orders/ReceiptActions';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { PageGuard } from '@/features/auth/components/PageGuard';
import {
  useCancelOrder,
  useCompleteOrder,
  useConfirmOrder,
  useMarkOrderPaid,
  useOrder,
} from '../hooks/useOrders';
import { formatAmount } from '@/lib/utils';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  Package,
  User,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { format } from 'date-fns';

export default function OrderDetail() {
  const params = useParams();
  const id = params.id as string;
  const [showMarkPaidDialog, setShowMarkPaidDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');

  const { data: order, isLoading, isError } = useOrder(id);
  const { mutate: markPaid, isPending: isMarkingPaid } = useMarkOrderPaid();
  const { mutate: confirmOrder, isPending: isConfirming } = useConfirmOrder();
  const { mutate: completeOrder, isPending: isCompleting } = useCompleteOrder();
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();

  const handleMarkPaid = () => {
    markPaid(
      { id, data: { paymentMethod: paymentMethod as any } },
      {
        onSuccess: () => {
          setShowMarkPaidDialog(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <PageGuard permissions={['orders:read']}>
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
        </div>
      </PageGuard>
    );
  }

  if (isError || !order) {
    return (
      <PageGuard permissions={['orders:read']}>
        <div className="space-y-6">
          <Link href="/dashboard/orders">
            <Button variant="ghost">
              <ArrowLeft />
              Back to Orders
            </Button>
          </Link>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load order details. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </PageGuard>
    );
  }

  // Calculate totals - handle nullable types
  const tax = typeof order.tax === 'number' ? order.tax : 0;
  const discount = typeof order.discount === 'number' ? order.discount : 0;
  const subtotal = order.totalAmount - tax + discount;

  // Create receipt-compatible order for ReceiptActions
  const receiptOrder: any = {
    ...order,
    customerName: 'Walk-in Customer',
    items: [],
  };

  return (
    <PageGuard permissions={['orders:read']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Link href="/dashboard/orders" className="mb-2 inline-block">
              <Button variant="ghost">
                <ArrowLeft />
                Back to Orders
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                Order {order.orderNumber}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-muted-foreground">
              Created on {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>

          <div className="flex gap-2">
            <ReceiptActions order={receiptOrder} variant="button" />
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Order Type</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{order.orderType}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAmount(order.totalAmount)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {order.isPaid ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Paid
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Clock className="w-3 h-3 mr-1" />
                  Unpaid
                </Badge>
              )}
              {order.paymentMethod && (
                <p className="text-xs text-muted-foreground mt-2 capitalize">
                  {order.paymentMethod.replace('_', ' ')}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customer</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {order.customerId ? 'Customer' : 'Walk-in'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Order Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {/* Mark as Paid */}
              {!order.isPaid && (
                <Button
                  onClick={() => setShowMarkPaidDialog(true)}
                  disabled={isMarkingPaid}
                  variant="outline"
                >
                  <CreditCard />
                  Mark as Paid
                </Button>
              )}

              {/* Confirm Order */}
              {order.status === 'pending' && (
                <Button
                  onClick={() => confirmOrder(id)}
                  disabled={isConfirming}
                  variant="outline"
                >
                  <CheckCircle />
                  Confirm Order
                </Button>
              )}

              {/* Complete Order */}
              {order.status === 'confirmed' && (
                <Button
                  onClick={() => completeOrder(id)}
                  disabled={isCompleting}
                  variant="outline"
                >
                  <CheckCircle />
                  Complete Order
                </Button>
              )}

              {/* Cancel Order */}
              {order.status !== 'completed' && order.status !== 'cancelled' && (
                <Button
                  onClick={() => cancelOrder(id)}
                  disabled={isCancelling}
                  variant="destructive"
                >
                  <XCircle />
                  Cancel Order
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Order Number</p>
                <p className="text-base font-mono font-semibold">{order.orderNumber}</p>
              </div>
              {order.receiptNumber && typeof order.receiptNumber === 'string' && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Receipt Number
                  </p>
                  <p className="text-base font-mono">{order.receiptNumber}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Order Type</p>
                <p className="text-base capitalize">{order.orderType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created By</p>
                <p className="text-base">{order.creator?.name || order.createdBy}</p>
              </div>
            </div>

            {order.notes && typeof order.notes === 'string' && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                <p className="text-base">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items - Placeholder since API doesn't return items in detail */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Order items details are not available in the current API response.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardHeader>
            <CardTitle>Order Totals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatAmount(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount:</span>
                  <span className="text-destructive">-{formatAmount(discount)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax:</span>
                  <span>{formatAmount(tax)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatAmount(order.totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mark as Paid Dialog */}
        <Dialog open={showMarkPaidDialog} onOpenChange={setShowMarkPaidDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Mark Order as Paid</DialogTitle>
              <DialogDescription>
                Select the payment method used for this order.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowMarkPaidDialog(false)}
                disabled={isMarkingPaid}
              >
                Cancel
              </Button>
              <Button onClick={handleMarkPaid} disabled={isMarkingPaid}>
                {isMarkingPaid ? 'Processing...' : 'Mark as Paid'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageGuard>
  );
}
