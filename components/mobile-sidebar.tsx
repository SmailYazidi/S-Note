"use client"

import { useState } from "react"
import { FileText, LayoutDashboard, Plus, PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface MobileSidebarProps {
  currentView: "notes" | "dashboard"
  setCurrentView: (view: "notes" | "dashboard") => void
  handleNewItem: () => void
  setSelectedItemId: (id: string | null) => void
  setFilterType: (type: "all" | "note" | "password") => void
}

export default function MobileSidebar({
  currentView,
  setCurrentView,
  handleNewItem,
  setSelectedItemId,
  setFilterType,
}: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleViewChange = (view: "notes" | "dashboard", filter?: "note" | "password") => {
    setCurrentView(view)
    setSelectedItemId(null) // Deselect item when changing view
    if (filter) {
      setFilterType(filter) // Apply filter if provided
    } else {
      setFilterType("all") // Reset filter if no specific filter is requested
    }
    setIsOpen(false) // Close sidebar on mobile after changing view
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="-ml-1 md:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[18rem] bg-sidebar p-0 text-sidebar-foreground">
        <div className="flex h-full w-full flex-col">
          <div className="flex flex-col gap-2 p-4 border-b">
            <h2 className="text-2xl font-bold text-center">S-Note</h2>
            <Button onClick={handleNewItem} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> New Item
            </Button>
          </div>
          <div className="flex-1 p-2">
            <Button
              variant={currentView === "dashboard" ? "secondary" : "ghost"}
              className="w-full justify-start mb-2"
              onClick={() => handleViewChange("dashboard")}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
            </Button>
            <Button
              variant={currentView === "notes" ? "secondary" : "ghost"}
              className="w-full justify-start mb-2"
              onClick={() => handleViewChange("notes")}
            >
              <FileText className="mr-2 h-4 w-4" /> All Items
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
