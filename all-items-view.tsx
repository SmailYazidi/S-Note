"use client"

import { useState, useMemo, useEffect } from "react"
import { FileText, Lock, ChevronLeft, ChevronRight, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { NoteItem } from "@/lib/storage"

interface AllItemsViewProps {
  items: NoteItem[] // Now receives all items, filtering happens internally
  setSelectedItemId: (id: string | null) => void
  handleNewItem: () => void
  initialFilterType: "all" | "note" | "password" // New prop for initial filter
  setFilterType: (type: "all" | "note" | "password") => void // New prop to update parent filter
}

const ITEMS_PER_PAGE = 10

export default function AllItemsView({
  items,
  setSelectedItemId,
  handleNewItem,
  initialFilterType,
  setFilterType,
}: AllItemsViewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("") // Local state for search
  // filterType is now controlled by parent via initialFilterType and set via setFilterType
  const [localFilterType, setLocalFilterType] = useState<"all" | "note" | "password">(initialFilterType)

  // Sync localFilterType with initialFilterType prop
  useEffect(() => {
    setLocalFilterType(initialFilterType)
    // Reset search term when filter type changes from external source
    setSearchTerm("")
  }, [initialFilterType])

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchesSearch =
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.content.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = localFilterType === "all" || item.type === localFilterType
        return matchesSearch && matchesType
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [items, searchTerm, localFilterType])

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredItems.slice(startIndex, endIndex)
  }, [filteredItems, currentPage])

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Reset page to 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, localFilterType])

  const handleLocalFilterChange = (value: "all" | "note" | "password") => {
    setLocalFilterType(value)
    setFilterType(value) // Also update the parent's filterType
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="text-2xl font-bold">All Items</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={localFilterType} onValueChange={handleLocalFilterChange}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="note">Notes</SelectItem>
              <SelectItem value="password">Passwords</SelectItem>
            </SelectContent>
          </Select>
          {/* Add New button for All Items View header */}
          <Button onClick={handleNewItem} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Button>
        </div>
      </div>
      {paginatedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
          <p>No items found matching your criteria.</p>
          <Button onClick={handleNewItem}>
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 flex-1 overflow-auto">
          {paginatedItems.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => setSelectedItemId(item.id)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                {item.type === "note" ? (
                  <FileText className="h-6 w-6 text-primary" />
                ) : (
                  <Lock className="h-6 w-6 text-primary" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg truncate">{item.title || "Untitled"}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {item.content.substring(0, 100)}
                    {item.content.length > 100 ? "..." : ""}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last Updated: {new Date(item.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <Button variant="outline" onClick={handlePreviousPage} disabled={currentPage === 1}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button variant="outline" onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
