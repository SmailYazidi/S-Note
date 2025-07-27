"use client"

import { useRouter } from "next/navigation"

import { useState, useEffect, useMemo } from "react"
import SnoteApp from "@/components/snote-app"
import { checkSession } from "@/lib/api"
import { notesApi, authApi, type NoteItem } from "@/lib/api"
import { useIsMobile } from "@/hooks/use-mobile"
import { useToast } from "@/hooks/use-toast"

type CurrentView = "notes" | "dashboard"

export default function HomePage() {
  const [items, setItems] = useState<NoteItem[]>([])
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Partial<NoteItem> | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showPasswordContent, setShowPasswordContent] = useState<{ [key: string]: boolean }>({})
  const [currentView, setCurrentView] = useState<CurrentView>("notes")
  const [filterType, setFilterType] = useState<"all" | "note" | "password">("all")
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<NoteItem | null>(null)
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  const isMobile = useIsMobile()
  const { toast } = useToast()
  const router = useRouter()

  // Check authentication and load notes
  useEffect(() => {
    const verifySession = async () => {
      try {
        const isValid = await checkSession()
        setIsAuthenticated(isValid)

        if (!isValid) {
          router.push("/auth/signin")
          return
        }

        setLoggedIn(true)
        await loadNotes()
      } catch (error) {
        console.error("Session verification failed:", error)
        setIsAuthenticated(false)
        router.push("/auth/signin")
      }
    }

    verifySession()
  }, [router])

  const loadNotes = async () => {
    try {
      const notes = await notesApi.getAll()
      setItems(notes)
    } catch (error) {
      console.error("Failed to load notes:", error)
      toast({
        title: "Error",
        description: "Failed to load notes. Please try again.",
        variant: "destructive",
      })
    }
  }

  const selectedItem = useMemo(() => {
    return items.find((item) => item._id === selectedItemId)
  }, [items, selectedItemId])

  const handleNewItem = () => {
    setEditingItem({
      type: "note",
      title: "",
      content: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditItem = (item: NoteItem) => {
    setEditingItem({ ...item })
    setIsDialogOpen(true)
  }

  const handleSaveItem = async () => {
    if (!editingItem) return

    try {
      if (editingItem._id) {
        // Update existing item
        const updatedNote = await notesApi.update(editingItem._id, {
          type: editingItem.type,
          title: editingItem.title,
          content: editingItem.content,
        })
        setItems(items.map((item) => (item._id === updatedNote._id ? updatedNote : item)))
        setSelectedItemId(updatedNote._id)
      } else {
        // Create new item
        const newNote = await notesApi.create({
          type: editingItem.type as "note" | "password",
          title: editingItem.title || "",
          content: editingItem.content || "",
        })
        setItems([newNote, ...items])
        setSelectedItemId(newNote._id)
      }

      setIsDialogOpen(false)
      setEditingItem(null)

      toast({
        title: "Success",
        description: editingItem._id ? "Note updated successfully!" : "Note created successfully!",
      })
    } catch (error) {
      console.error("Failed to save note:", error)
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = (item: NoteItem) => {
    setItemToDelete(item)
    setIsConfirmDeleteDialogOpen(true)
  }

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return

    try {
      await notesApi.delete(itemToDelete._id)
      setItems(items.filter((item) => item._id !== itemToDelete._id))
      setIsConfirmDeleteDialogOpen(false)
      setIsDialogOpen(false)
      setSelectedItemId(null)
      setItemToDelete(null)

      toast({
        title: "Item deleted!",
        description: `"${itemToDelete.title || "Untitled"}" has been removed.`,
        variant: "destructive",
      })
    } catch (error) {
      console.error("Failed to delete note:", error)
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    try {
      await authApi.signOut()
      setLoggedIn(false)
      setSelectedItemId(null)
      setShowPasswordContent({})
      setItems([])
      router.push("/auth/signin")
    } catch (error) {
      console.error("Logout failed:", error)
      // Still redirect even if logout fails
      localStorage.removeItem("sessionId")
      router.push("/auth/signin")
    }
  }

  const togglePasswordVisibility = (id: string) => {
    setShowPasswordContent((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleCopyContent = (content: string, itemId: string) => {
    navigator.clipboard.writeText(content)
    setCopiedItemId(itemId)
    toast({
      title: "Content copied!",
      description: "The item's content has been copied to your clipboard.",
    })
    setTimeout(() => {
      setCopiedItemId(null)
    }, 1000)
  }

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  // Show the main app if authenticated
  return <SnoteApp />
}
