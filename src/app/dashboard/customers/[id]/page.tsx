'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomerForm } from '@/features/customers/components/CustomerForm';
import { useCustomer } from '@/features/customers/hooks/useCustomers';
import type { Customer } from '@/types/generated/customer';
import { AlertCircle, ArrowLeft, Calendar, Edit, Mail, Phone, User } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const { data: customer, isLoading, isError } = useCustomer(customerId);

  const getCustomerTypeBadge = (type: string) => {
    switch (type) {
      case 'wholesale':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Wholesale</Badge>;
      case 'regular':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Regular</Badge>;
      case 'walk-in':
        return <Badge variant="secondary">Walk-in</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Customer Details"
          description="Loading customer information..."
        />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Customer Details"
          description="View customer information"
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load customer details. Please try again.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/dashboard/customers')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Details"
        description={`View and manage ${customer.name}'s information`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/dashboard/customers')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={() => setEditingCustomer(customer)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Customer
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{customer.name}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-muted-foreground mt-0.5 flex items-center justify-center">
                #
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Customer Number</p>
                <p className="font-mono text-sm">{customer.customerNumber}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{customer.email || '-'}</p>
                {customer.isEmailVerified && customer.email && (
                  <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800">
                    Verified
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{customer.phone ? String(customer.phone) : '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Customer Type</p>
              {getCustomerTypeBadge(customer.customerType)}
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground mb-2">Status</p>
              {customer.isActive ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Created At</p>
                <p className="font-medium">
                  {new Date(customer.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {new Date(customer.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes Section */}
      {customer.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {String(customer.notes)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <CustomerForm
        open={!!editingCustomer}
        onOpenChange={(open) => {
          if (!open) {
            setEditingCustomer(null);
          }
        }}
        customer={editingCustomer}
      />
    </div>
  );
}
