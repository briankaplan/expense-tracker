'use client';

import * as React from "react"
import { useExpenses } from "@/contexts/ExpensesContext"
import { useReceipts } from "@/contexts/ReceiptsContext"
import { ReceiptList } from "./ReceiptList"
import { ReceiptUploadDialog } from "./ReceiptUploadDialog"
import { ReceiptMatchDialog } from "./ReceiptMatchDialog"
import { ReceiptViewerDialog } from "./ReceiptViewerDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { Plus, Search } from "lucide-react"

export function ReceiptManagerView() {
  const { expenses } = useExpenses()
  const { receipts } = useReceipts()
  const [showUploadDialog, setShowUploadDialog] = React.useState(false)
  const [showMatchDialog, setShowMatchDialog] = React.useState(false)
  const [showViewerDialog, setShowViewerDialog] = React.useState(false)
  const [selectedReceipt, setSelectedReceipt] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [dateRange, setDateRange] = React.useState<DateRange>()
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [sortBy, setSortBy] = React.useState<string>("date")

  const filteredReceipts = React.useMemo(() => {
    let filtered = [...receipts]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((receipt) => {
        const metadata = receipt.metadata || {}
        return (
          metadata.merchant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          metadata.total?.toString().includes(searchQuery) ||
          receipt.id.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })
    }

    // Apply date range filter
    if (dateRange?.from) {
      filtered = filtered.filter((receipt) => {
        const date = new Date(receipt.createdAt)
        if (dateRange.from && date < dateRange.from) return false
        if (dateRange.to && date > dateRange.to) return false
        return true
      })
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((receipt) =>
        statusFilter === "matched"
          ? receipt.expenseId
          : statusFilter === "unmatched"
          ? !receipt.expenseId
          : true
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      if (sortBy === "merchant") {
        const merchantA = a.metadata?.merchant || ""
        const merchantB = b.metadata?.merchant || ""
        return merchantA.localeCompare(merchantB)
      }
      if (sortBy === "amount") {
        const amountA = a.metadata?.total || 0
        const amountB = b.metadata?.total || 0
        return amountB - amountA
      }
      return 0
    })

    return filtered
  }, [receipts, searchQuery, dateRange, statusFilter, sortBy])

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Receipts</h1>
        <Button onClick={() => setShowUploadDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Upload Receipt
        </Button>
      </div>

      <div className="grid gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search receipts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <DateRangePicker
            date={dateRange}
            onSelect={setDateRange}
            className="w-[300px]"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Receipts</SelectItem>
              <SelectItem value="matched">Matched</SelectItem>
              <SelectItem value="unmatched">Unmatched</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="merchant">Merchant</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ReceiptList
          receipts={filteredReceipts}
          onMatch={(receipt) => {
            setSelectedReceipt(receipt.id)
            setShowMatchDialog(true)
          }}
          onView={(receipt) => {
            setSelectedReceipt(receipt.id)
            setShowViewerDialog(true)
          }}
        />
      </div>

      <ReceiptUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
      />

      {selectedReceipt && (
        <>
          <ReceiptMatchDialog
            open={showMatchDialog}
            onOpenChange={setShowMatchDialog}
            receiptId={selectedReceipt}
            expenses={expenses}
          />
          <ReceiptViewerDialog
            open={showViewerDialog}
            onOpenChange={setShowViewerDialog}
            receiptId={selectedReceipt}
          />
        </>
      )}
    </div>
  )
} 