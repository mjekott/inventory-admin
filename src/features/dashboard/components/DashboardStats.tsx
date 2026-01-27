/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatCard } from "@/components/shared/StatCard"
import ApiInstance from "@/lib/httpclient"
import { formatAmount } from "@/lib/utils"
import { DashboardStatsDto } from "@/types/api.schemas"
import { ApiResponse } from "@/types/general"
import { useQuery } from "@tanstack/react-query"
import { AlertTriangle, DollarSign, Package, ShoppingCart } from "lucide-react"

const DashboardStats = () => {
  // Fetch dashboard stats
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () =>
      ApiInstance.ApiPrivateApiInstance.get<ApiResponse<DashboardStatsDto>>(
        "/analytics/dashboard"
      ),
  })

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-muted animate-pulse"
          />
        ))}
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Failed to load dashboard stats
      </p>
    )
  }

  // Safely destructure stats with defaults
  const stats = data?.data.data ?? {
    totalProducts: 0,
    lowStockProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue:0
  }

  const {
    totalProducts,
    lowStockProducts,
    totalOrders,
    pendingOrders,
    totalRevenue
  } = stats

  // Config array for cards
  const statCards = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: Package,
      iconColor: "text-info",
      iconBg: "bg-info/10",
    },
    {
      title: "Low Stock Alerts",
      value: lowStockProducts,
      change: lowStockProducts > 0 ? "Needs attention" : "All good",
      changeType: lowStockProducts > 0 ? "negative" : "positive",
      icon: AlertTriangle,
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
    },
    {
      title: "Total Orders",
      value: totalOrders,
      change: `${pendingOrders} pending`,
      changeType: "neutral",
      icon: ShoppingCart,
      iconColor: "text-success",
      iconBg: "bg-success/10",
    },
    {
      title: "Total Revenue",
      value: formatAmount(totalRevenue),
      icon: DollarSign,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card) => (
        <StatCard key={card.title} {...card as any} />
      ))}
    </div>
  )
}

export default DashboardStats
