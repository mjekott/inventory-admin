"use client";

import { forwardRef } from 'react';
import { Order } from '@/types/inventory';
import { mockCompanySettings } from '@/data/mockData';
import { format } from 'date-fns';

interface ThermalReceiptProps {
  order: Order;
}

export const ThermalReceipt = forwardRef<HTMLDivElement, ThermalReceiptProps>(
  ({ order }, ref) => {
    const company = mockCompanySettings;
    const subtotal = order.items.reduce((sum, item) => sum + item.total, 0);
    const tax = order.tax || 0;
    const discount = order.discount || 0;

    return (
      <div
        ref={ref}
        className="bg-white text-black font-mono text-[10px] leading-tight p-2"
        style={{
          width: '80mm',
          minHeight: 'auto',
        }}
      >
        {/* Header */}
        <div className="text-center mb-3">
          <p className="font-bold text-sm">{company.name}</p>
          <p className="text-[9px]">{company.address}</p>
          <p className="text-[9px]">Tel: {company.phone}</p>
          {company.taxId && <p className="text-[9px]">Tax ID: {company.taxId}</p>}
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-black my-2" />

        {/* Order Info */}
        <div className="mb-2">
          <div className="flex justify-between">
            <span>Order #:</span>
            <span className="font-bold">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{format(order.createdAt, 'dd/MM/yyyy HH:mm')}</span>
          </div>
          <div className="flex justify-between">
            <span>Cashier:</span>
            <span>{order.createdBy}</span>
          </div>
        </div>

        {/* Customer */}
        <div className="mb-2">
          <div className="flex justify-between">
            <span>Customer:</span>
            <span>{order.customerName}</span>
          </div>
          {order.customerPhone && (
            <div className="flex justify-between">
              <span>Phone:</span>
              <span>{order.customerPhone}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-black my-2" />

        {/* Items Header */}
        <div className="flex justify-between font-bold mb-1">
          <span className="flex-1">Item</span>
          <span className="w-8 text-right">Qty</span>
          <span className="w-16 text-right">Price</span>
          <span className="w-16 text-right">Total</span>
        </div>

        {/* Items */}
        {order.items.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between">
              <span className="flex-1 truncate pr-1">{item.productName}</span>
              <span className="w-8 text-right">{item.quantity}</span>
              <span className="w-16 text-right">${item.unitPrice.toFixed(2)}</span>
              <span className="w-16 text-right">${item.total.toFixed(2)}</span>
            </div>
            <div className="text-[8px] text-gray-600">SKU: {item.sku}</div>
          </div>
        ))}

        {/* Divider */}
        <div className="border-t border-dashed border-black my-2" />

        {/* Totals */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}
          {tax > 0 && (
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${tax.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-black my-1" />
          <div className="flex justify-between font-bold text-sm">
            <span>TOTAL:</span>
            <span>${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method */}
        {order.paymentMethod && (
          <div className="mt-2">
            <div className="flex justify-between">
              <span>Payment:</span>
              <span className="capitalize">{order.paymentMethod}</span>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-dashed border-black my-2" />

        {/* Footer */}
        <div className="text-center text-[9px] mt-3">
          {company.receiptFooter && <p>{company.receiptFooter}</p>}
          <p className="mt-2">*** Thank You! ***</p>
          <p className="mt-1 text-[8px] text-gray-500">
            Printed: {format(new Date(), 'dd/MM/yyyy HH:mm:ss')}
          </p>
        </div>

        {/* Barcode placeholder */}
        <div className="mt-3 text-center">
          <div className="inline-block bg-black/10 px-4 py-1">
            <p className="font-bold tracking-widest">{order.orderNumber}</p>
          </div>
        </div>
      </div>
    );
  }
);

ThermalReceipt.displayName = 'ThermalReceipt';
