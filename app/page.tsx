"use client"

import { useState, useEffect, useMemo } from "react"
import { Edit, Trash, FileText, Lock, LogOut, Eye, EyeOff, ArrowLeft, Copy, Check } from "lucide-react"
import AllItemsView from "@/components/all-items-view"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { notesApi, authApi, type NoteItem } from "@/lib/api"
import DesktopSidebar from "@/components/desktop-sidebar"
import MobileSidebar from "@/components/mobile-sidebar"
import DashboardView from "@/components/dashboard-view"
import { useIsMobile } from "@/hooks/use-mobile"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

  const isMobile = useIsMobile()
  const { toast } = useToast()
  const router = useRouter()

  // Check authentication and load notes
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const isAuthenticated = await authApi.checkAuth()
        if (!isAuthenticated) {
          router.push("/auth/signin")
          return
        }

        setLoggedIn(true)
        await loadNotes()
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/auth/signin")
      } finally {
        setLoading(false)
      }
    }

    checkAuthAndLoadData()
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
          type: editingItem.type as "note" | "password",
          title: editingItem.title || "",
          content: editingItem.content || "",
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (!loggedIn) {
    return null // Will redirect to signin
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            {isMobile && (
              <MobileSidebar
                setCurrentView={setCurrentView}
                currentView={currentView}
                handleNewItem={handleNewItem}
                setSelectedItemId={setSelectedItemId}
                setFilterType={setFilterType}
              />
            )}
            <h1 className="text-2xl font-bold">S-Note</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </header>
        <main className="flex flex-1 overflow-hidden">
          {!isMobile && (
            <DesktopSidebar
              setCurrentView={setCurrentView}
              currentView={currentView}
              handleNewItem={handleNewItem}
              setSelectedItemId={setSelectedItemId}
              setFilterType={setFilterType}
            />
          )}

          <div className="flex-1 p-4 overflow-auto">
            {currentView === "dashboard" ? (
              <DashboardView
                items={items}
                handleNewItem={handleNewItem}
                setCurrentView={setCurrentView}
                setFilterType={setFilterType}
                setSelectedItemId={setSelectedItemId}
              />
            ) : selectedItem ? (
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedItemId(null)} className="-ml-2">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Back to All Items</span>
                      </Button>
                      <CardTitle className="flex items-center gap-2">
                        {selectedItem.type === "note" ? <FileText className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                        {selectedItem.title || "Untitled"}
                      </CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopyContent(selectedItem.content, selectedItem._id)}
                      >
                        {copiedItemId === selectedItem._id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span className="sr-only">Copy content</span>
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleEditItem(selectedItem)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(selectedItem)}>
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    {selectedItem.type === "note" ? "Note" : "Password"} | Created:{" "}
                    {new Date(selectedItem.createdAt).toLocaleDateString()} | Last Updated:{" "}
                    {new Date(selectedItem.updatedAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto whitespace-pre-wrap">
                  {selectedItem.type === "password" ? (
                    <div className="flex items-center gap-2">
                      <p className="flex-1">
                        {showPasswordContent[selectedItem._id] ? selectedItem.content : "••••••••••••"}
                      </p>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => togglePasswordVisibility(selectedItem._id)}
                        className="shrink-0"
                      >
                        {showPasswordContent[selectedItem._id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showPasswordContent[selectedItem._id] ? "Hide password" : "Show password"}
                        </span>
                      </Button>
                    </div>
                  ) : (
                    <p>{selectedItem.content}</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <AllItemsView
                items={items}
                setSelectedItemId={setSelectedItemId}
                handleNewItem={handleNewItem}
                initialFilterType={filterType}
                setFilterType={setFilterType}
              />
            )}
          </div>
        </main>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingItem?._id ? "Edit Item" : "Add New Item"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={editingItem?.type || "note"}
                onValueChange={(value: "note" | "password") =>
                  setEditingItem((prev) => (prev ? { ...prev, type: value } : null))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="password">Password</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={editingItem?.title || ""}
                onChange={(e) => setEditingItem((prev) => (prev ? { ...prev, title: e.target.value } : null))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="content" className="text-right pt-2">
                Content
              </Label>
              <Textarea
                id="content"
                value={editingItem?.content || ""}
                onChange={(e) => setEditingItem((prev) => (prev ? { ...prev, content: e.target.value } : null))}
                className="col-span-3 min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSaveItem}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your item{" "}
              <span className="font-semibold">"{itemToDelete?.title || "Untitled"}"</span> and remove its data from the
              database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsConfirmDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteItem}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
