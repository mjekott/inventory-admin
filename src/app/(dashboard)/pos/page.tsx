"use client";

import { PageHeader } from '@/components/shared/PageHeader';
import { POSTerminal } from '@/components/pos/POSTerminal';

export default function POSPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="POS Terminal"
        description="Point of sale - quick order creation"
      />
      <POSTerminal />
    </div>
  );
}
