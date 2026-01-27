import { StatusBadge } from '@/components/shared/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import ApiInstance from '@/lib/httpclient'
import { formatAmount } from '@/lib/utils'
import { PaginatedOrdersResponseDto } from '@/types/api.schemas'
import { ApiResponse } from '@/types/general'
import { useQuery } from '@tanstack/react-query'

const RecentOrders = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['orders', 'recent'],
    queryFn: () =>
      ApiInstance.ApiPrivateApiInstance.get<ApiResponse<PaginatedOrdersResponseDto>>('/orders', {
        params: { page: 1, limit: 5 },
      }),
  })

  const recentOrders = data?.data.data.data ?? []

  // Minimum height for table content
  const contentHeight = 'h-64'

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
      </CardHeader>
      <CardContent className={`p-0 ${contentHeight} flex flex-col`}>
        <Table className="flex-1">
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Order</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-14 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-4 w-10 ml-auto bg-muted animate-pulse rounded" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && isError && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-sm text-destructive py-16"
                >
                  Failed to load recent orders
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !recentOrders.length && !isError && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-sm text-muted-foreground py-16"
                >
                  No recent orders
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="text-sm font-medium">{order.orderNumber}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-sm text-right font-medium">
                    {formatAmount(order.totalAmount)}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default RecentOrders
