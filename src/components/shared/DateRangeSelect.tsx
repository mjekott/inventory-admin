import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "lucide-react"

export type DateRangeOption = "week" | "30days" | "90days" | "6months" | "year" | "all"

export interface DateRangeValue {
  startDate: string
  endDate: string
  range: DateRangeOption
}

interface DateRangeSelectProps {
  value: DateRangeOption
  onChange: (value: DateRangeValue) => void
  className?: string
}

const getDateRange = (option: DateRangeOption): { startDate: string; endDate: string } => {
  const now = new Date()
  const endDate = now.toISOString().split("T")[0] // Today in YYYY-MM-DD format
  let startDate: string

  switch (option) {
    case "week": {
      // 7 days ago
      const date = new Date(now)
      date.setDate(date.getDate() - 7)
      startDate = date.toISOString().split("T")[0]
      break
    }
    case "30days": {
      // 30 days ago
      const date = new Date(now)
      date.setDate(date.getDate() - 30)
      startDate = date.toISOString().split("T")[0]
      break
    }
    case "90days": {
      // 60 days ago
      const date = new Date(now)
      date.setDate(date.getDate() - 90)
      startDate = date.toISOString().split("T")[0]
      break
    }
    case "6months": {
      // 6 months ago
      const date = new Date(now)
      date.setMonth(date.getMonth() - 6)
      startDate = date.toISOString().split("T")[0]
      break
    }
    case "year": {
      // Start of current year (January 1st)
      const date = new Date(now.getFullYear(), 0, 1)
      startDate = date.toISOString().split("T")[0]
      break
    }
    case "all": {
      // A very old date to represent "all time"
      startDate = "2000-01-01"
      break
    }
    default:
      // Default to 30 days
      const date = new Date(now)
      date.setDate(date.getDate() - 30)
      startDate = date.toISOString().split("T")[0]
  }

  return { startDate, endDate }
}

export const DateRangeSelect = ({ value, onChange, className }: DateRangeSelectProps) => {
  const handleChange = (newValue: DateRangeOption) => {
    const { startDate, endDate } = getDateRange(newValue)
    onChange({ startDate, endDate, range: newValue })
  }

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className={className}>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <SelectValue placeholder="Select date range" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="week">This Week</SelectItem>
        <SelectItem value="30days">Last 30 Days</SelectItem>
        <SelectItem value="90days">Last 90 Days</SelectItem>
        <SelectItem value="6months">Last 6 Months</SelectItem>
        <SelectItem value="year">This Year</SelectItem>
        <SelectItem value="all">All Time</SelectItem>
      </SelectContent>
    </Select>
  )
}
