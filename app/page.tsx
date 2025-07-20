"use client"

import { useState, useEffect } from "react"

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
import DesktopSidebar from "@/components/desktop-sidebar"
import MobileSidebar from "@/components/mobile-sidebar"
import DashboardView from "@/components/dashboard-view"
import { useIsMobile } from "@/hooks/use-mobile"
import { useToast } from "@/hooks/use-toast"

import LoginForm from "@/components/login-form"

type ItemType = "note" | "password"

interface Item {
  id: string
  type: ItemType
  title: string
  content: string
  createdAt: string
  updatedAt: string
}
interface User {
  id: string;
  email: string;
  name: string;
}
type CurrentView = "notes" | "dashboard"

export default function HomePage() {
  const isMobile = useIsMobile()
  const { toast } = useToast()

  // State
  const [items, setItems] = useState<Item[]>([])
  const [currentView, setCurrentView] = useState<CurrentView>("notes")
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null)
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null)
  const [showPasswordContent, setShowPasswordContent] = useState<Record<string, boolean>>({})
  const [user, setUser] = useState<User | null>(null)
  const selectedItem = items.find((item) => item.id === selectedItemId) || null

  // Fetch items from API on mount
  useEffect(() => {
    fetch("/api/note/list")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch notes")
        return res.json()
      })
      .then((data: { items: Item[] }) => {
        setItems(data.items)
      })
      .catch(() => {
        toast({ title: "Error", description: "Failed to load notes", variant: "destructive" })
      })
  }, [])

  // New item handler (open dialog with empty item)
  function handleNewItem() {
    setEditingItem({
      id: "", // empty means new
      type: "note",
      title: "",
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    setIsDialogOpen(true)
  }

  // Save item handler - create or update via API
  async function handleSaveItem() {
    if (!editingItem) return

    try {
      let res
      if (editingItem.id) {
        // Update existing
        res = await fetch(`/api/note/update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingItem),
        })
      } else {
        // Create new
        res = await fetch(`/api/note/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingItem),
        })
      }

      if (!res.ok) throw new Error("Failed to save")

      const savedItem: Item = await res.json()

      // Update local state
      setItems((prev) => {
        if (editingItem.id) {
          // update
          return prev.map((item) => (item.id === savedItem.id ? savedItem : item))
        } else {
          // add new
          return [savedItem, ...prev]
        }
      })

      setSelectedItemId(savedItem.id)
      setIsDialogOpen(false)
      toast({ title: "Success", description: "Item saved." })
    } catch (error) {
      toast({ title: "Error", description: "Failed to save item.", variant: "destructive" })
    }
  }

  // Delete item handlers
  function handleDeleteClick(item: Item) {
    setItemToDelete(item)
    setIsConfirmDeleteDialogOpen(true)
  }

  async function confirmDeleteItem() {
    if (!itemToDelete) return

    try {
      const res = await fetch(`/api/note/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemToDelete.id }),
      })

      if (!res.ok) throw new Error("Delete failed")

      setItems((prev) => prev.filter((item) => item.id !== itemToDelete.id))
      setSelectedItemId(null)
      setItemToDelete(null)
      setIsConfirmDeleteDialogOpen(false)
      toast({ title: "Deleted", description: "Item deleted." })
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete item.", variant: "destructive" })
    }
  }

  // Copy content
  function handleCopyContent(content: string, id: string) {
    navigator.clipboard.writeText(content)
    setCopiedItemId(id)
    setTimeout(() => setCopiedItemId(null), 2000)
  }

  // Toggle password visibility
  function togglePasswordVisibility(id: string) {
    setShowPasswordContent((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Logout handler example (you can adapt to your auth solution)
  async function handleLogout() {
    await fetch("/api/auth/signout", { method: "POST" })
    window.location.reload()
  }
   if (!user) {
    // Show login form if not logged in
    return <LoginForm />
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
            />
          )}
          <div className="flex-1 p-4 overflow-auto">
            {currentView === "dashboard" ? (
              <DashboardView
                items={items}
                handleNewItem={handleNewItem}
                setCurrentView={setCurrentView}
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
                        onClick={() => handleCopyContent(selectedItem.content, selectedItem.id)}
                      >
                        {copiedItemId === selectedItem.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span className="sr-only">Copy content</span>
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => { setEditingItem(selectedItem); setIsDialogOpen(true); }}>
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
                        {showPasswordContent[selectedItem.id] ? selectedItem.content : "••••••••••••"}
                      </p>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => togglePasswordVisibility(selectedItem.id)}
                        className="shrink-0"
                      >
                        {showPasswordContent[selectedItem.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">
                          {showPasswordContent[selectedItem.id] ? "Hide password" : "Show password"}
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
              />
            )}
          </div>
        </main>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem?.id ? "Edit Item" : "Add New Item"}
            </DialogTitle>
          </DialogHeader>
          {editingItem && (
            <>
              <div className="flex flex-col space-y-4">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={editingItem.type}
                  onValueChange={(val: ItemType) =>
                    setEditingItem({ ...editingItem, type: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="password">Password</SelectItem>
                  </SelectContent>
                </Select>

                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editingItem.title}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, title: e.target.value })
                  }
                  placeholder="Enter title"
                />

                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={editingItem.content}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, content: e.target.value })
                  }
                  placeholder={
                    editingItem.type === "password" ? "Enter password" : "Enter note content"
                  }
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveItem}>Save</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete "{itemToDelete?.title}"?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
