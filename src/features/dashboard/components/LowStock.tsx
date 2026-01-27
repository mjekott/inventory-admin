import { DateRangeValue } from "@/components/shared/DateRangeSelect"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import ApiInstance from "@/lib/httpclient"
import { PaginatedLowStockDataDto } from "@/types/api.schemas"

import { ApiResponse } from "@/types/general"
import { useQuery } from "@tanstack/react-query"
import { AlertTriangle, ArrowRight, Package } from "lucide-react"
import { useRouter } from "next/navigation"

const getDefaultDateRange = (): DateRangeValue => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
    range: "30days",
  }
}

const LowStock = () => {
  const router = useRouter()


  const { data, isLoading, isError } = useQuery({
    queryKey: ["inventory", "low-stock"],
    queryFn: () =>
      ApiInstance.ApiPrivateApiInstance.get<
        ApiResponse<PaginatedLowStockDataDto>
      >("/inventory/low-stock", {
        params: {
          page: 1,
          take: 5,
       
        },
      }),
  })

  const inventory = data?.data.data.items ?? []
  const total = data?.data.data.total ?? 0

  const contentHeight = "h-64"




  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Low Stock Products
          </CardTitle>
        
        </div>
      </CardHeader>

      <CardContent className={`p-0 ${contentHeight} flex flex-col`}>
        {/* Loading */}
        {isLoading && (
          <div className="flex-1 flex flex-col justify-center gap-3 px-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-4 w-full bg-muted animate-pulse rounded"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex-1 flex items-center justify-center text-sm text-destructive">
            Failed to load inventory
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && inventory.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground px-6">
            <Package className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">All products are well stocked!</p>
          </div>
        )}

        {/* Table */}
        {!isLoading && !isError && inventory.length > 0 && (
          <>
            <Table className="flex-1">
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {inventory.map((item) => {
                  const isOutOfStock = item.quantity === 0

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            {item.product.name}
                          </p>
                          {item.variant && (
                            <p className="text-xs text-muted-foreground">
                              {item.variant.name}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <span className="text-destructive font-medium">
                          {item.quantity}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          /{item.minimumStock}
                        </span>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={isOutOfStock ? "cancelled" : "low"} />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {/* Footer CTA */}
            {total > 5 && (
              <div className="border-t px-4 py-3 text-xs text-muted-foreground flex justify-between items-center">
                <span>
                  Showing <strong>5</strong> of{" "}
                  <strong>{total}</strong> products
                </span>

                <button
                  className="text-primary hover:underline font-medium"
                  onClick={() => router.push("/inventory/low-stock")}
                >
                  View all <ArrowRight/>
                </button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default LowStock
