import { Button } from '@/components/ui/button';
import { PageGuard } from '@/features/auth/components/PageGuard';
import { LowStockAlerts } from '@/features/inventory/components/LowStockAlerts';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LowStockPage() {
  return (
    <PageGuard permissions={['inventory:read']}>
      <div className="space-y-6">
        <div>
          <Link href="/dashboard/inventory" className="mb-2 inline-block">
            <Button variant="ghost">
              <ArrowLeft />
              Back to Inventory
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Low Stock Alerts</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage products with low inventory levels
          </p>
        </div>
        <LowStockAlerts />
      </div>
    </PageGuard>
  );
}
