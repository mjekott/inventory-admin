"use client";

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AdjustInventoryDto } from '@/types/generated/adjustInventoryDto';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAdjustStock } from '../hooks/useInventory';

const adjustStockSchema = z.object({
  quantity: z.coerce.number().int('Quantity must be a whole number'),
  type: z.enum(['ADD', 'REMOVE', 'SET'], {
    required_error: 'Please select a transaction type',
  }),
  reason: z.string().min(3, 'Please provide a reason (minimum 3 characters)'),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
});

type AdjustStockFormValues = z.infer<typeof adjustStockSchema>;

interface AdjustStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventoryId: string;
  productName: string;
  currentStock: number;
}

export function AdjustStockDialog({
  open,
  onOpenChange,
  inventoryId,
  productName,
  currentStock,
}: AdjustStockDialogProps) {
  const { mutate: adjustStock, isPending } = useAdjustStock();

  const form = useForm<AdjustStockFormValues>({
    resolver: zodResolver(adjustStockSchema),
    defaultValues: {
      quantity: 0,
      type: 'ADD',
      reason: '',
      referenceType: '',
      referenceId: '',
    },
  });

  const selectedType = form.watch('type');
  const quantity = form.watch('quantity');

  const getNewStock = () => {
    const qty = Number(quantity) || 0;
    if (selectedType === 'ADD') return currentStock + qty;
    if (selectedType === 'REMOVE') return currentStock - qty;
    return qty; // SET sets absolute value
  };

  const onSubmit = (values: AdjustStockFormValues) => {
    const data: AdjustInventoryDto = {
      quantity: values.quantity,
      type: values.type,
      reason: values.reason,
      referenceType: values.referenceType,
      referenceId: values.referenceId,
    };

    adjustStock(
      { id: inventoryId, data },
      {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            Adjust inventory levels for <span className="font-medium">{productName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-muted p-3 mb-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current Stock:</span>
            <span className="font-semibold">{currentStock}</span>
          </div>
          {quantity !== 0 && (
            <div className="flex items-center justify-between text-sm mt-1 pt-1 border-t border-border">
              <span className="text-muted-foreground">New Stock:</span>
              <span className="font-semibold text-primary">{getNewStock()}</span>
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ADD">Stock In (Add)</SelectItem>
                      <SelectItem value="REMOVE">Stock Out (Remove)</SelectItem>
                      <SelectItem value="SET">Adjustment (Set Absolute)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {selectedType === 'SET' ? 'New Stock Level' : 'Quantity'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={selectedType === 'SET' ? 'Enter new stock level' : 'Enter quantity'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., New shipment, Damaged goods, Stock count correction"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Adjust Stock
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
