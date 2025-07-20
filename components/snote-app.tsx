"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { Plus, Edit, Trash, FileText, Lock, LogOut, KeyRound, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function SNoteApp() {
  // State
  const [items, setItems] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("snote-items")
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [selectedItemId, setSelectedItemId] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false)
  const [showPasswordContent, setShowPasswordContent] = useState({})

  // Derived state
  const selectedItem = items.find((item) => item.id === selectedItemId) || null

  // Save items to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("snote-items", JSON.stringify(items))
  }, [items])

  // Handlers
  function handleNewItem() {
    const newItem = {
      id: uuidv4(),
      type: "note",
      title: "",
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setEditingItem(newItem)
    setIsDialogOpen(true)
  }

  function handleEditItem(item) {
    setEditingItem(item)
    setIsDialogOpen(true)
  }

  function handleSaveItem() {
    if (!editingItem) return
    const now = new Date().toISOString()
    if (items.some((item) => item.id === editingItem.id)) {
      // Update existing
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id ? { ...editingItem, updatedAt: now } : item
        )
      )
    } else {
      // Add new
      setItems((prev) => [...prev, { ...editingItem, createdAt: now, updatedAt: now }])
    }
    setSelectedItemId(editingItem.id)
    setIsDialogOpen(false)
  }

  function handleDeleteItem() {
    if (!editingItem) return
    setItems((prev) => prev.filter((item) => item.id !== editingItem.id))
    setSelectedItemId(null)
    setEditingItem(null)
    setIsDialogOpen(false)
  }

  function togglePasswordVisibility(id) {
    setShowPasswordContent((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function handleViewAll(type) {
    // Example: select the first item of the given type
    const firstOfType = items.find((item) => item.type === type)
    if (firstOfType) setSelectedItemId(firstOfType.id)
  }

  function handleLogout() {
    // Add your logout logic here
    alert("Logged out (stub)")
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1 md:hidden" />
          <h1 className="text-2xl font-bold">SNote App</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleNewItem} className="hidden md:flex">
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsChangePasswordDialogOpen(true)}>
            <KeyRound className="w-5 h-5" />
            <span className="sr-only">Change Password</span>
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-4 overflow-auto">
          {selectedItem ? (
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {selectedItem.type === "note" ? (
                      <FileText className="h-5 w-5" />
                    ) : (
                      <Lock className="h-5 w-5" />
                    )}
                    {selectedItem.title || "Untitled"}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditItem(selectedItem)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        setEditingItem(selectedItem)
                        handleDeleteItem()
                      }}
                    >
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
              <CardFooter className="text-sm text-muted-foreground">
                <p className="text-red-500 font-semibold">
                  Warning: Passwords stored in localStorage are not secure. This app is for demonstration purposes
                  only.
                </p>
              </CardFooter>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
              <p>Select an item or click "Add New" to get started.</p>
              <Button onClick={handleNewItem} className="md:hidden">
                <Plus className="mr-2 h-4 w-4" /> Add New
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem?.id && items.some((item) => item.id === editingItem.id) ? "Edit Item" : "Add New Item"}
            </DialogTitle>
            <DialogDescription>
              {editingItem?.id && items.some((item) => item.id === editingItem.id)
                ? "Make changes to your note or password here."
                : "Create a new note or password."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={editingItem?.type || "note"}
                onValueChange={(value) =>
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
                className="col-span-3"
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Change your master password here.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Implement your password change form here */}
            <p className="text-muted-foreground">This feature is not implemented yet.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangePasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
