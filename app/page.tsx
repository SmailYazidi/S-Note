"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Plus,
  LayoutDashboard,
  FileText,
  Lock,
  Share,
  ArrowLeft,
  Copy,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Menu,
  X,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { notesApi, authApi, type NoteItem } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const [notes, setNotes] = useState<NoteItem[]>([])
  const [currentView, setCurrentView] = useState<"dashboard" | "all-items" | "note-detail">("all-items")
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "note" | "password">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [newNote, setNewNote] = useState({ type: "note" as "note" | "password", title: "", content: "" })
  const [editNote, setEditNote] = useState({ type: "note" as "note" | "password", title: "", content: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
  const [isDeleting, setIsDeleting] = useState<{ [key: string]: boolean }>({})
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkAuthAndLoadNotes = async () => {
      if (!authApi.isAuthenticated()) {
        router.push("/auth/signin")
        return
      }

      const sessionResult = await authApi.checkSession()
      if (!sessionResult.success) {
        router.push("/auth/signin")
        return
      }

      await loadNotes()
      setIsLoading(false)
    }

    checkAuthAndLoadNotes()
  }, [router])

  const loadNotes = async () => {
    try {
      const notesResult = await notesApi.getAll()
      if (notesResult.success && notesResult.data) {
        setNotes(notesResult.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to load notes",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive",
      })
    }
  }

  const handleSignOut = async () => {
    await authApi.signout()
    router.push("/auth/signin")
  }

  const handleCreateNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const result = await notesApi.create(newNote)
      if (result.success && result.data) {
        await loadNotes()
        setNewNote({ type: "note", title: "", content: "" })
        setIsCreateDialogOpen(false)
        toast({
          title: "Success",
          description: "Note created successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create note",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditNote = async () => {
    if (!selectedNote || !editNote.title.trim() || !editNote.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)
    try {
      const result = await notesApi.update(selectedNote._id, editNote)
      if (result.success && result.data) {
        await loadNotes()
        setSelectedNote(result.data)
        setIsEditDialogOpen(false)
        toast({
          title: "Success",
          description: "Note updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update note",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return

    setIsDeleting((prev) => ({ ...prev, [noteId]: true }))
    try {
      const result = await notesApi.delete(noteId)
      if (result.success) {
        await loadNotes()
        if (selectedNote?._id === noteId) {
          setSelectedNote(null)
          setCurrentView("all-items")
        }
        toast({
          title: "Success",
          description: "Note deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete note",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      })
    } finally {
      setIsDeleting((prev) => ({ ...prev, [noteId]: false }))
    }
  }

  const handleCopy = async (text: string, noteId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates((prev) => ({ ...prev, [noteId]: true }))
      toast({
        title: "Copied",
        description: "Content copied to clipboard",
      })
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [noteId]: false }))
      }, 1000)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleNoteClick = (note: NoteItem) => {
    setSelectedNote(note)
    setCurrentView("note-detail")
    setIsSidebarOpen(false)
  }

  const openEditDialog = (note: NoteItem) => {
    setEditNote({
      type: note.type,
      title: note.title,
      content: note.content,
    })
    setIsEditDialogOpen(true)
  }

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || note.type === filterType
    return matchesSearch && matchesFilter
  })

  const noteCount = notes.filter((note) => note.type === "note").length
  const passwordCount = notes.filter((note) => note.type === "password").length

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const Sidebar = ({ className = "" }: { className?: string }) => (
    <div className={`bg-card border-r border-border ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">S-Note</h1>
          {isSidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => {
              setCurrentView("dashboard")
              setIsSidebarOpen(false)
            }}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              currentView === "dashboard"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <LayoutDashboard className="mr-3 h-4 w-4" />
            Dashboard
          </button>

          <button
            onClick={() => {
              setCurrentView("all-items")
              setIsSidebarOpen(false)
            }}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              currentView === "all-items"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <FileText className="mr-3 h-4 w-4" />
            All Items
          </button>
        </nav>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:block w-64 min-h-screen" />

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)} />
            <Sidebar className="relative w-64 min-h-screen" />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-h-screen">
          {/* Header */}
          <div className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(true)}
                  className="md:hidden text-muted-foreground hover:text-foreground"
                >
                  <Menu className="h-5 w-5" />
                </Button>

                {currentView === "note-detail" && selectedNote ? (
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCurrentView("all-items")}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center space-x-2">
                      {selectedNote.type === "password" ? (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      )}
                      <h2 className="text-xl font-bold text-foreground">{selectedNote.title}</h2>
                    </div>
                  </div>
                ) : (
                  <h2 className="text-xl font-bold text-foreground">
                    {currentView === "dashboard" ? "Dashboard" : "All Items"}
                  </h2>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Search className="h-4 w-4" />
                </Button>

                <ThemeToggle />

                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Share className="h-4 w-4" />
                </Button>

                <Button variant="ghost" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {currentView === "dashboard" ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Total Items</h3>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-3xl font-bold text-foreground mb-2">{notes.length}</div>
                      <p className="text-xs text-muted-foreground mb-4">All your notes and passwords</p>
                      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Item
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create New Item</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="type">Type</Label>
                              <Select
                                value={newNote.type}
                                onValueChange={(value: "note" | "password") => setNewNote({ ...newNote, type: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="note">Note</SelectItem>
                                  <SelectItem value="password">Password</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="title">Title</Label>
                              <Input
                                id="title"
                                value={newNote.title}
                                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                placeholder="Enter title..."
                              />
                            </div>
                            <div>
                              <Label htmlFor="content">Content</Label>
                              <Textarea
                                id="content"
                                value={newNote.content}
                                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                placeholder="Enter content..."
                                rows={4}
                              />
                            </div>
                            <Button onClick={handleCreateNote} disabled={isCreating} className="w-full">
                              {isCreating ? "Creating..." : "Create Item"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Total Notes</h3>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-3xl font-bold text-foreground mb-2">{noteCount}</div>
                      <p className="text-xs text-muted-foreground mb-4">Your written notes</p>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => {
                          setCurrentView("all-items")
                          setFilterType("note")
                        }}
                      >
                        View All Notes
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Total Passwords</h3>
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-3xl font-bold text-foreground mb-2">{passwordCount}</div>
                      <p className="text-xs text-muted-foreground mb-4">Your stored passwords</p>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => {
                          setCurrentView("all-items")
                          setFilterType("password")
                        }}
                      >
                        View All Passwords
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : currentView === "note-detail" && selectedNote ? (
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {selectedNote.type === "password" ? "Password" : "Note"} | Created:{" "}
                          {new Date(selectedNote.createdAt).toLocaleDateString()} | Last Updated:{" "}
                          {new Date(selectedNote.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(selectedNote.content, selectedNote._id)}
                          disabled={copiedStates[selectedNote._id]}
                        >
                          {copiedStates[selectedNote._id] ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(selectedNote)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteNote(selectedNote._id)}
                          disabled={isDeleting[selectedNote._id]}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {selectedNote.type === "password" ? (
                        <div className="relative">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-2xl font-bold text-foreground">
                              {showPassword ? selectedNote.content : "•".repeat(12)}
                            </span>
                            <Button variant="ghost" size="icon" onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-foreground whitespace-pre-wrap">{selectedNote.content}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <Select
                      value={filterType}
                      onValueChange={(value: "all" | "note" | "password") => setFilterType(value)}
                    >
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="note">Notes</SelectItem>
                        <SelectItem value="password">Passwords</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Item</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="type">Type</Label>
                          <Select
                            value={newNote.type}
                            onValueChange={(value: "note" | "password") => setNewNote({ ...newNote, type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="note">Note</SelectItem>
                              <SelectItem value="password">Password</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            value={newNote.title}
                            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                            placeholder="Enter title..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="content">Content</Label>
                          <Textarea
                            id="content"
                            value={newNote.content}
                            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                            placeholder="Enter content..."
                            rows={4}
                          />
                        </div>
                        <Button onClick={handleCreateNote} disabled={isCreating} className="w-full">
                          {isCreating ? "Creating..." : "Create Item"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="text-sm text-muted-foreground">
                  Showing {filteredNotes.length} of {notes.length} items
                </div>

                <div className="space-y-4">
                  {filteredNotes.map((note) => (
                    <Card
                      key={note._id}
                      className="hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => handleNoteClick(note)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 mt-1">
                            {note.type === "password" ? (
                              <Lock className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <FileText className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-foreground truncate">{note.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {note.type === "password" ? "•".repeat(12) : note.content}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Last Updated: {new Date(note.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopy(note.content, note._id)}
                              disabled={copiedStates[note._id]}
                            >
                              {copiedStates[note._id] ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(note)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteNote(note._id)}
                              disabled={isDeleting[note._id]}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredNotes.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No items found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-type">Type</Label>
              <Select
                value={editNote.type}
                onValueChange={(value: "note" | "password") => setEditNote({ ...editNote, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="password">Password</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editNote.title}
                onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
                placeholder="Enter title..."
              />
            </div>
            <div>
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={editNote.content}
                onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
                placeholder="Enter content..."
                rows={4}
              />
            </div>
            <Button onClick={handleEditNote} disabled={isUpdating} className="w-full">
              {isUpdating ? "Updating..." : "Update Item"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
