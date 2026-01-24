"use client";

import { POSTerminal } from '@/components/pos/POSTerminal';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageGuard } from '@/features/auth/components/PageGuard';

export default function POSPage() {
  return (
 <PageGuard permissions={["order:create"]}>
     <div className="space-y-6">
      <PageHeader
        title="POS Terminal"
        description="Point of sale - quick order creation"
      />
      <POSTerminal />
    </div>
 </PageGuard>
  );
}
