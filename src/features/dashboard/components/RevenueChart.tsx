import { DateRangeSelect, DateRangeValue } from '@/components/shared/DateRangeSelect'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ApiInstance from '@/lib/httpclient'
import { RevenueChartDto } from '@/types/api.schemas'
import { ApiResponse } from '@/types/general'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp } from 'lucide-react'
import { useState } from 'react'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

const getDefaultDateRange = (): DateRangeValue => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    range: 'week',
  }
}

const RevenueChart = () => {
  const [dateRange, setDateRange] = useState<DateRangeValue>(getDefaultDateRange)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'revenue', dateRange.startDate, dateRange.endDate],
    queryFn: () =>
      ApiInstance.ApiPrivateApiInstance.get<ApiResponse<RevenueChartDto>>(
        '/analytics/revenue-chart',
        {
          params: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          },
        }
      ),
  })

  // Loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2 mb-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              Sales Performance Overview
            </CardTitle>
            <DateRangeSelect
              value={dateRange.range}
              onChange={setDateRange}
              className="w-[180px]"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 rounded-lg bg-muted animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  // Error or empty state
  if (isError || !data?.data.data.data?.length) {
    return (
      <Card>
        <CardHeader className="pb-2 mb-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              Sales Performance Overview
            </CardTitle>
            <DateRangeSelect
              value={dateRange.range}
              onChange={setDateRange}
              className="w-[180px]"
            />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.data.data.data

  // Dynamic bars (easy to extend)
  const bars = [
    { key: 'revenue', name: 'Revenue', fill: 'hsl(var(--chart-1))' },
    { key: 'orderCount', name: 'Total Orders', fill: 'hsl(var(--chart-2))' },
  ]

  return (
    <Card>
      <CardHeader className="pb-2 mb-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-success" />
            Sales Performance Overview
          </CardTitle>
          <DateRangeSelect
            value={dateRange.range}
            onChange={setDateRange}
            className="w-[180px]"
          />
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={8} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              {bars.map((bar) => (
                <Bar
                  key={bar.key}
                  dataKey={bar.key}
                  name={bar.name}
                  fill={bar.fill}
                  radius={[6, 6, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default RevenueChart
