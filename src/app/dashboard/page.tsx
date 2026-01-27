"use client";

import { PageHeader } from '@/components/shared/PageHeader';
import DashboardStats from '@/features/dashboard/components/DashboardStats';
import LowStock from '@/features/dashboard/components/LowStock';
import RecentOrders from '@/features/dashboard/components/RecentOrders';
import RevenueChart from '@/features/dashboard/components/RevenueChart';



export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your inventory and sales performance"
      />
      <div className="space-y-6">
      <DashboardStats/>
       <RevenueChart/>
        {/* Recent Orders & Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <RecentOrders/>
          <LowStock/> 
        </div>
      </div>
    </div>
  );
}
