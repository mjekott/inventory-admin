"use client";

import { useRef, useState } from 'react';
import { Order } from '@/types/inventory';
import { ThermalReceipt } from './ThermalReceipt';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Printer, Mail, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface ReceiptActionsProps {
  order: Order;
  variant?: 'icon' | 'button';
}

export function ReceiptActions({ order, variant = 'icon' }: ReceiptActionsProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailAddress, setEmailAddress] = useState(order.customerEmail || '');
  const [isSending, setIsSending] = useState(false);

  const handlePrint = () => {
    if (!receiptRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print receipts');
      return;
    }

    const receiptContent = receiptRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${order.orderNumber}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 10px;
              line-height: 1.2;
              width: 80mm;
              padding: 8px;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .border-t { border-top: 1px solid black; }
            .border-dashed { border-style: dashed; }
            .my-2 { margin: 8px 0; }
            .mb-1 { margin-bottom: 4px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-3 { margin-bottom: 12px; }
            .mt-2 { margin-top: 8px; }
            .mt-3 { margin-top: 12px; }
            .space-y-1 > * + * { margin-top: 4px; }
            .text-sm { font-size: 12px; }
            .text-\\[9px\\] { font-size: 9px; }
            .text-\\[8px\\] { font-size: 8px; }
            .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .pr-1 { padding-right: 4px; }
            .px-4 { padding-left: 16px; padding-right: 16px; }
            .py-1 { padding-top: 4px; padding-bottom: 4px; }
            .flex-1 { flex: 1; }
            .w-8 { width: 32px; }
            .w-16 { width: 64px; }
            .capitalize { text-transform: capitalize; }
            .tracking-widest { letter-spacing: 0.1em; }
            .inline-block { display: inline-block; }
            .bg-black\\/10 { background-color: rgba(0,0,0,0.1); }
            .text-gray-500, .text-gray-600 { color: #666; }
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                width: 80mm;
              }
            }
          </style>
        </head>
        <body>
          ${receiptContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);

    toast.success('Receipt sent to printer');
  };

  const handleSendEmail = async () => {
    if (!emailAddress) {
      toast.error('Please enter an email address');
      return;
    }

    setIsSending(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success('Receipt sent!', {
      description: `Receipt for ${order.orderNumber} sent to ${emailAddress}`,
    });

    setIsSending(false);
    setShowEmailDialog(false);
  };

  if (variant === 'button') {
    return (
      <>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowEmailDialog(true)}>
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
        </div>

        {/* Hidden receipt for printing */}
        <div className="hidden">
          <ThermalReceipt ref={receiptRef} order={order} />
        </div>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-fit">
            <DialogHeader>
              <DialogTitle>Receipt Preview</DialogTitle>
              <DialogDescription>
                80mm thermal printer format
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center bg-muted/50 p-4 rounded-lg overflow-auto max-h-[60vh]">
              <ThermalReceipt ref={receiptRef} order={order} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Close
              </Button>
              <Button onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Email Dialog */}
        <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Send Receipt via Email</DialogTitle>
              <DialogDescription>
                Send receipt for {order.orderNumber} to the customer
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="customer@example.com"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail} disabled={isSending}>
                {isSending ? 'Sending...' : 'Send Receipt'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => setShowPreview(true)} title="Preview">
          <Eye className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handlePrint} title="Print">
          <Printer className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setShowEmailDialog(true)} title="Email">
          <Mail className="w-4 h-4" />
        </Button>
      </div>

      {/* Hidden receipt for printing */}
      <div className="hidden">
        <ThermalReceipt ref={receiptRef} order={order} />
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-fit">
          <DialogHeader>
            <DialogTitle>Receipt Preview</DialogTitle>
            <DialogDescription>80mm thermal printer format</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center bg-muted/50 p-4 rounded-lg overflow-auto max-h-[60vh]">
            <ThermalReceipt ref={receiptRef} order={order} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Receipt via Email</DialogTitle>
            <DialogDescription>
              Send receipt for {order.orderNumber} to the customer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="customer@example.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={isSending}>
              {isSending ? 'Sending...' : 'Send Receipt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
