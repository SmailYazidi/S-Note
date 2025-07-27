"use client"

import { useState, useEffect } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardView } from "@/components/dashboard-view"
import { AllItemsView } from "@/components/all-items-view"
import { fetchNotes, type NoteItem } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function SnoteApp() {
  const [activeView, setActiveView] = useState<"dashboard" | "all-items">("dashboard")
  const [notes, setNotes] = useState<NoteItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Load notes from database
  const loadNotes = async () => {
    try {
      setLoading(true)
      const fetchedNotes = await fetchNotes()
      setNotes(fetchedNotes)
    } catch (error) {
      console.error("Error loading notes:", error)
      toast({
        title: "Error",
        description: "Failed to load notes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotes()
  }, [])

  const handleNotesChange = () => {
    loadNotes() // Reload notes when changes occur
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar activeView={activeView} setActiveView={setActiveView} notes={notes} />
        <main className="flex-1 overflow-hidden">
          {activeView === "dashboard" ? (
            <DashboardView notes={notes} onNotesChange={handleNotesChange} loading={loading} />
          ) : (
            <AllItemsView notes={notes} onNotesChange={handleNotesChange} loading={loading} />
          )}
        </main>
      </div>
    </SidebarProvider>
  )
}
