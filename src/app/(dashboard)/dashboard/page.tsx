"use client";

import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockOrders, mockProducts, mockStockMovements } from '@/data/mockData';
import { format } from 'date-fns';
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 4000, orders: 24 },
  { month: 'Feb', revenue: 3000, orders: 18 },
  { month: 'Mar', revenue: 5000, orders: 32 },
  { month: 'Apr', revenue: 4500, orders: 28 },
  { month: 'May', revenue: 6000, orders: 40 },
  { month: 'Jun', revenue: 5500, orders: 35 },
];

export default function DashboardPage() {
  const totalProducts = mockProducts.length;
  const lowStockProducts = mockProducts.filter(
    (p) => p.currentStock <= p.minStock
  ).length;
  const totalOrders = mockOrders.length;
  const pendingOrders = mockOrders.filter((o) => o.status === 'pending').length;
  const totalRevenue = mockOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const recentMovements = mockStockMovements.slice(0, 5);
  const recentOrders = mockOrders.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your inventory and sales performance"
      />

<div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Products"
              value={totalProducts}
              change="+12 this month"
              changeType="positive"
              icon={Package}
              iconColor="text-info"
              iconBg="bg-info/10"
            />
            <StatCard
              title="Low Stock Alerts"
              value={lowStockProducts}
              change={lowStockProducts > 0 ? 'Needs attention' : 'All good'}
              changeType={lowStockProducts > 0 ? 'negative' : 'positive'}
              icon={AlertTriangle}
              iconColor="text-warning"
              iconBg="bg-warning/10"
            />
            <StatCard
              title="Total Orders"
              value={totalOrders}
              change={`${pendingOrders} pending`}
              changeType="neutral"
              icon={ShoppingCart}
              iconColor="text-success"
              iconBg="bg-success/10"
            />
            <StatCard
              title="Revenue"
              value={`$${totalRevenue.toLocaleString()}`}
              change="+18% from last month"
              changeType="positive"
              icon={DollarSign}
              iconColor="text-primary"
              iconBg="bg-primary/10"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  Revenue Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--chart-1))"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Order</TableHead>
                      <TableHead className="text-xs">Customer</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="text-sm font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {order.customerName}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="text-sm text-right font-medium">
                          ${order.totalAmount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Stock Movements & Low Stock */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Stock Movements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Recent Stock Movements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentMovements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">
                              {movement.productName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(movement.createdAt, 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {movement.type === 'inward' ? (
                              <ArrowDownToLine className="w-4 h-4 text-success" />
                            ) : (
                              <ArrowUpFromLine className="w-4 h-4 text-destructive" />
                            )}
                            <span className="text-sm capitalize">{movement.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-medium ${
                              movement.type === 'inward'
                                ? 'text-success'
                                : 'text-destructive'
                            }`}
                          >
                            {movement.type === 'inward' ? '+' : '-'}
                            {movement.quantity}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Low Stock Products */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Low Stock Products
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {lowStockProducts === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">All products are well stocked!</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockProducts
                        .filter((p) => p.currentStock <= p.minStock)
                        .slice(0, 5)
                        .map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{product.sku}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="text-destructive font-medium">
                                {product.currentStock}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                /{product.minStock}
                              </span>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status="low" />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
}
