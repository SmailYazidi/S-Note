"use client"

import { FileText, LayoutDashboard, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "@/components/ui/sidebar"

interface AppSidebarProps {
  currentView: "notes" | "dashboard"
  setCurrentView: (view: "notes" | "dashboard") => void
  handleNewItem: () => void
  setSelectedItemId: (id: string | null) => void
  setFilterType: (type: "all" | "note" | "password") => void // Added setFilterType
}

export default function AppSidebar({
  currentView,
  setCurrentView,
  handleNewItem,
  setSelectedItemId,
  setFilterType,
}: AppSidebarProps) {
  const { setOpenMobile } = useSidebar()

  const handleViewChange = (view: "notes" | "dashboard", filter?: "note" | "password") => {
    setCurrentView(view)
    setSelectedItemId(null) // Deselect item when changing view
    if (filter) {
      setFilterType(filter) // Apply filter if provided
    } else {
      setFilterType("all") // Reset filter if no specific filter is requested
    }
    setOpenMobile(false) // Close sidebar on mobile after changing view
  }

  return (
    <Sidebar collapsible="none" variant="sidebar">
      {" "}
      {/* Set to "none" for fixed desktop sidebar that pushes content */}
      <SidebarHeader className="flex flex-col gap-2 p-2">
        <h2 className="text-xl font-bold text-center">SNote</h2> {/* Simple text logo */}
      </SidebarHeader>
      <SidebarContent>
        <div className="p-2">
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
          {/* Add New button for mobile in sidebar */}
          <Button onClick={handleNewItem} className="w-full justify-start md:hidden">
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
