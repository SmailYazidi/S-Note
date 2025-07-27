"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Lock, ListChecks, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { NoteItem } from "@/lib/storage"

interface DashboardViewProps {
  items: NoteItem[]
  handleNewItem: () => void
  setCurrentView: (view: "notes" | "dashboard") => void
  setFilterType: (type: "all" | "note" | "password") => void
  setSelectedItemId: (id: string | null) => void
}

export default function DashboardView({
  items,
  handleNewItem,
  setCurrentView,
  setFilterType,
  setSelectedItemId,
}: DashboardViewProps) {
  const totalItems = items.length
  const totalNotes = items.filter((item) => item.type === "note").length
  const totalPasswords = items.filter((item) => item.type === "password").length

  const handleViewAll = (type: "note" | "password") => {
    setCurrentView("notes")
    setFilterType(type)
    setSelectedItemId(null) // Deselect any item
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          <ListChecks className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalItems}</div>
          <p className="text-xs text-muted-foreground">All your notes and passwords</p>
          <Button onClick={handleNewItem} className="mt-4 w-full">
            <Plus className="mr-2 h-4 w-4" /> Add New Item
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalNotes}</div>
          <p className="text-xs text-muted-foreground">Your written notes</p>
          <Button onClick={() => handleViewAll("note")} className="mt-4 w-full" variant="outline">
            View All Notes
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Passwords</CardTitle>
          <Lock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPasswords}</div>
          <p className="text-xs text-muted-foreground">Your stored passwords</p>
          <Button onClick={() => handleViewAll("password")} className="mt-4 w-full" variant="outline">
            View All Passwords
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
