"use client";

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle, ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';
import { useState } from 'react';
import { useInventoryTransactions } from '../hooks/useInventory';

interface InventoryTransactionsProps {
  inventoryId: string;
  productName: string;
}

export function InventoryTransactions({
  inventoryId,
  productName,
}: InventoryTransactionsProps) {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const { data, isLoading, isError } = useInventoryTransactions(inventoryId, {
    page,
    limit,
  });

  const transactions = data?.data || [];
  const pagination = data?.pagination;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'ADD':
        return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'REMOVE':
        return <ArrowDown className="w-4 h-4 text-red-600" />;
      case 'SET':
        return <Edit3 className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case 'ADD':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Stock In</Badge>;
      case 'REMOVE':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Stock Out</Badge>;
      case 'SET':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Adjustment</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Stock movement history for <span className="font-medium">{productName}</span>
        </p>
      </div>

      {/* Error State */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load transaction history. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Balance After</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : transactions.length === 0 ? (
                // Empty state
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Edit3 className="w-12 h-12" />
                      <p className="text-sm">No transactions found</p>
                      <p className="text-xs">Stock movements will appear here</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Data rows
                transactions.map((transaction) => {
                  const isIncrease = transaction.type === 'ADD';
                  const quantityColor = isIncrease ? 'text-green-600' : 'text-red-600';

                  return (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>
                            {transaction.createdAt
                              ? new Date(transaction.createdAt).toLocaleDateString()
                              : '-'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {transaction.createdAt
                              ? new Date(transaction.createdAt).toLocaleTimeString()
                              : ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(transaction.type)}
                          {getTransactionBadge(transaction.type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${quantityColor}`}>
                          {isIncrease ? '+' : transaction.type === 'REMOVE' ? '-' : ''}
                          {transaction.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.newQuantity ?? '-'}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <span className="text-sm">{transaction.reason || '-'}</span>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <span className="text-sm text-muted-foreground">
                          {transaction.referenceType ? `${transaction.referenceType}${transaction.referenceId ? `: ${transaction.referenceId}` : ''}` : '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {transaction.creator?.name || 'System'}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
