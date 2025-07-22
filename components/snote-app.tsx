"use client"

import { useState, useEffect, useMemo } from "react"
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
import { loadItems, saveItems, type NoteItem } from "@/lib/storage"
import { isLoggedIn, logout } from "@/lib/auth"
import LoginForm from "@/components/login-form"
import ChangePasswordDialog from "@/components/change-password-dialog"

export default function SNoteApp() {
  const [items, setItems] = useState<NoteItem[]>([])
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<NoteItem | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false)
  const [showPasswordContent, setShowPasswordContent] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    const status = isLoggedIn()
    setLoggedIn(status)
    if (status) {
      setItems(loadItems())
    }
  }, [])

  useEffect(() => {
    if (loggedIn) {
      setItems(loadItems())
    }
  }, [loggedIn])

  useEffect(() => {
    if (loggedIn) {
      saveItems(items)
    }
  }, [items, loggedIn])

  const filteredItems = useMemo(() => {
    return items
      .filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.content.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [items, searchTerm])

  const selectedItem = useMemo(() => {
    return items.find((item) => item.id === selectedItemId)
  }, [items, selectedItemId])

  const handleNewItem = () => {
    setEditingItem({
      id: uuidv4(),
      type: "note",
      title: "",
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    setIsDialogOpen(true)
  }

  const handleEditItem = (item: NoteItem) => {
    setEditingItem({ ...item })
    setIsDialogOpen(true)
  }

  const handleSaveItem = () => {
    if (!editingItem) return

    const now = new Date().toISOString()
    const itemToSave = { ...editingItem, updatedAt: now }

    if (items.some((item) => item.id === itemToSave.id)) {
      setItems(items.map((item) => (item.id === itemToSave.id ? itemToSave : item)))
    } else {
      setItems([...items, { ...itemToSave, createdAt: now }])
    }
    setIsDialogOpen(false)
    setSelectedItemId(itemToSave.id)
    setEditingItem(null)
  }

  const handleDeleteItem = () => {
    if (!editingItem) return
    setItems(items.filter((item) => item.id !== editingItem.id))
    setIsDialogOpen(false)
    setSelectedItemId(null)
    setEditingItem(null)
  }

  const handleLogout = () => {
    logout()
    setLoggedIn(false)
    setSelectedItemId(null)
    setShowPasswordContent({})
  }

  const togglePasswordVisibility = (id: string) => {
    setShowPasswordContent((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  if (!loggedIn) {
    return <LoginForm onLoginSuccess={() => setLoggedIn(true)} />
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          {/* Sidebar Trigger for mobile */}
          <SidebarTrigger className="-ml-1 md:hidden" />
          <h1 className="text-2xl font-bold">SNote App</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleNewItem} className="hidden md:flex">
            {" "}
            {/* Show "Add New" on desktop header */}
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
        {/* The sidebar content is now in AppSidebar. This main area is for the selected item. */}
        <div className="flex-1 p-4 overflow-auto">
          {selectedItem ? (
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {selectedItem.type === "note" ? <FileText className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
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
                      {showPasswordContent[selectedItem.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
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
                  Warning: Passwords stored in localStorage are not secure. This app is for demonstration purposes only.
                </p>
              </CardFooter>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
              <p>Select an item or click "Add New" to get started.</p>
              {/* "Add New" button for mobile screens */}
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
            {editingItem?.id && items.some((item) => item.id === editingItem.id) && (
              <Button variant="destructive" onClick={handleDeleteItem} className="mr-auto">
                Delete
              </Button>
            )}
            <Button type="submit" onClick={handleSaveItem}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <ChangePasswordDialog isOpen={isChangePasswordDialogOpen} onClose={() => setIsChangePasswordDialogOpen(false)} />
    </div>
  )
}
