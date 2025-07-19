"use client"

import { FileText, LayoutDashboard, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

interface DesktopSidebarProps {
  currentView: "notes" | "dashboard"
  setCurrentView: (view: "notes" | "dashboard") => void
  handleNewItem: () => void
  setSelectedItemId: (id: string | null) => void
  setFilterType: (type: "all" | "note" | "password") => void
}

export default function DesktopSidebar({
  currentView,
  setCurrentView,
  handleNewItem,
  setSelectedItemId,
  setFilterType,
}: DesktopSidebarProps) {
  const handleViewChange = (view: "notes" | "dashboard", filter?: "note" | "password") => {
    setCurrentView(view)
    setSelectedItemId(null) // Deselect item when changing view
    if (filter) {
      setFilterType(filter) // Apply filter if provided
    } else {
      setFilterType("all") // Reset filter if no specific filter is requested
    }
  }

  return (
    <div className="hidden md:flex flex-col h-screen w-64 border-r bg-sidebar text-sidebar-foreground shrink-0">
  
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
  )
}
