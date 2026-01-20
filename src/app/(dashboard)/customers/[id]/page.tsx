"use client";

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockCustomers, mockCustomerActivities, mockOrders } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  UserX,
  UserCheck,
  CreditCard,
  RotateCcw,
  FileText,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState(() =>
    mockCustomers.find((c) => c.id === customerId)
  );

  const customerActivities = useMemo(
    () => mockCustomerActivities.filter((a) => a.customerId === customerId),
    [customerId]
  );

  const customerOrders = useMemo(
    () => mockOrders.filter((o) =>
      o.customerName === customer?.name ||
      o.customerEmail === customer?.email
    ),
    [customer]
  );

  // Generate spending data for chart
  const spendingData = useMemo(() => {
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
    return months.map((month, index) => ({
      month,
      amount: Math.floor(Math.random() * 3000) + 500 + (index * 200),
    }));
  }, []);

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Customer Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The customer you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button onClick={() => router.push('/customers')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Customers
        </Button>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleToggleStatus = () => {
    const newStatus = !customer.isActive;
    setCustomer({ ...customer, isActive: newStatus });
    toast({
      title: newStatus ? 'Customer Activated' : 'Customer Deactivated',
      description: `${customer.name} has been ${newStatus ? 'activated' : 'deactivated'}.`,
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="w-4 h-4" />;
      case 'payment':
        return <CreditCard className="w-4 h-4" />;
      case 'refund':
        return <RotateCcw className="w-4 h-4" />;
      case 'note':
        return <MessageSquare className="w-4 h-4" />;
      case 'status_change':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-primary/10 text-primary';
      case 'payment':
        return 'bg-success/10 text-success';
      case 'refund':
        return 'bg-warning/10 text-warning';
      case 'note':
        return 'bg-info/10 text-info';
      case 'status_change':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const avgOrderValue = customer.totalOrders > 0
    ? customer.totalSpent / customer.totalOrders
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/customers')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{customer.name}</h1>
          <p className="text-muted-foreground">Customer Details</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant={customer.isActive ? 'destructive' : 'default'}>
              {customer.isActive ? (
                <>
                  <UserX className="w-4 h-4 mr-2" />
                  Deactivate Customer
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Activate Customer
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {customer.isActive ? 'Deactivate' : 'Activate'} Customer?
              </AlertDialogTitle>
              <AlertDialogDescription>
                {customer.isActive
                  ? `This will deactivate ${customer.name}. They won't be able to place new orders until reactivated.`
                  : `This will activate ${customer.name}. They will be able to place orders again.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleToggleStatus}>
                {customer.isActive ? 'Deactivate' : 'Activate'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer Info */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {getInitials(customer.name)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">{customer.name}</h2>
                <Badge
                  variant={customer.isActive ? 'default' : 'secondary'}
                  className="mt-2"
                >
                  {customer.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{customer.email}</p>
                  </div>
                </div>

                {customer.phone && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium">{customer.phone}</p>
                    </div>
                  </div>
                )}

                {customer.address && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="text-sm font-medium">
                        {customer.address}
                        {customer.city && <><br />{customer.city}, {customer.country}</>}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Customer Since</p>
                    <p className="text-sm font-medium">
                      {format(customer.createdAt, 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </div>

              {customer.notes && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Notes</p>
                    <p className="text-sm bg-muted p-3 rounded-lg">{customer.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Analytics & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Orders</p>
                    <p className="text-xl font-bold">{customer.totalOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <DollarSign className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                    <p className="text-xl font-bold">${customer.totalSpent.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-info/10">
                    <TrendingUp className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg. Order</p>
                    <p className="text-xl font-bold">${avgOrderValue.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Calendar className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Order</p>
                    <p className="text-xl font-bold">
                      {customer.lastOrderDate
                        ? format(customer.lastOrderDate, 'MMM d')
                        : '—'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Spending Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Spending Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={spendingData}>
                    <defs>
                      <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
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
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spent']}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(var(--chart-1))"
                      fillOpacity={1}
                      fill="url(#colorSpending)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Orders & Activity */}
          <Tabs defaultValue="orders">
            <TabsList>
              <TabsTrigger value="orders">Orders ({customerOrders.length})</TabsTrigger>
              <TabsTrigger value="activity">Activity Log ({customerActivities.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  {customerOrders.length === 0 ? (
                    <div className="py-12 text-center">
                      <ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No orders yet</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customerOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">
                              {order.orderNumber}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(order.createdAt, 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={order.status} />
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ${order.totalAmount.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  {customerActivities.length === 0 ? (
                    <div className="py-12 text-center">
                      <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No activity recorded</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {customerActivities
                        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                        .map((activity) => (
                          <div key={activity.id} className="flex items-start gap-4 p-4">
                            <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{activity.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(activity.createdAt, 'MMM d, yyyy \'at\' h:mm a')}
                              </p>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {activity.type.replace('_', ' ')}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
