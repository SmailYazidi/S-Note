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
  const router = useRouter()

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
    const notesResult = await notesApi.getAll()
    if (notesResult.success && notesResult.data) {
      setNotes(notesResult.data)
    }
  }

  const handleSignOut = async () => {
    await authApi.signout()
    router.push("/auth/signin")
  }

  const handleCreateNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return

    const result = await notesApi.create(newNote)
    if (result.success && result.data) {
      await loadNotes()
      setNewNote({ type: "note", title: "", content: "" })
      setIsCreateDialogOpen(false)
    }
  }

  const handleEditNote = async () => {
    if (!selectedNote || !editNote.title.trim() || !editNote.content.trim()) return

    const result = await notesApi.update(selectedNote._id, editNote)
    if (result.success && result.data) {
      await loadNotes()
      setSelectedNote(result.data)
      setIsEditDialogOpen(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return

    const result = await notesApi.delete(noteId)
    if (result.success) {
      await loadNotes()
      if (selectedNote?._id === noteId) {
        setSelectedNote(null)
        setCurrentView("all-items")
      }
    }
  }

  const handleCopy = async (text: string, noteId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates((prev) => ({ ...prev, [noteId]: true }))
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [noteId]: false }))
      }, 1000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  const Sidebar = ({ className = "" }: { className?: string }) => (
    <div className={`bg-gray-900 border-r border-gray-800 ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">S-Note</h1>
          {isSidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-gray-400 hover:text-white"
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
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
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
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
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
    <div className="min-h-screen bg-black text-white">
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
          <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(true)}
                  className="md:hidden text-gray-400 hover:text-white"
                >
                  <Menu className="h-5 w-5" />
                </Button>

                {currentView === "note-detail" && selectedNote ? (
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCurrentView("all-items")}
                      className="text-gray-400 hover:text-white"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center space-x-2">
                      {selectedNote.type === "password" ? (
                        <Lock className="h-5 w-5 text-gray-400" />
                      ) : (
                        <FileText className="h-5 w-5 text-gray-400" />
                      )}
                      <h2 className="text-xl font-bold text-white">{selectedNote.title}</h2>
                    </div>
                  </div>
                ) : (
                  <h2 className="text-xl font-bold text-white">
                    {currentView === "dashboard" ? "Dashboard" : "All Items"}
                  </h2>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <Search className="h-4 w-4" />
                </Button>

                <ThemeToggle />

                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <Share className="h-4 w-4" />
                </Button>

                <Button variant="ghost" onClick={handleSignOut} className="text-gray-400 hover:text-white">
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
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Items</h3>
                        <FileText className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="text-3xl font-bold text-white mb-2">{notes.length}</div>
                      <p className="text-xs text-gray-500 mb-4">All your notes and passwords</p>
                      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-white text-black hover:bg-gray-200">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Item
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border-gray-800">
                          <DialogHeader>
                            <DialogTitle className="text-white">Create New Item</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="type" className="text-gray-300">
                                Type
                              </Label>
                              <Select
                                value={newNote.type}
                                onValueChange={(value: "note" | "password") => setNewNote({ ...newNote, type: value })}
                              >
                                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700">
                                  <SelectItem value="note" className="text-white">
                                    Note
                                  </SelectItem>
                                  <SelectItem value="password" className="text-white">
                                    Password
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="title" className="text-gray-300">
                                Title
                              </Label>
                              <Input
                                id="title"
                                value={newNote.title}
                                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                placeholder="Enter title..."
                                className="bg-gray-800 border-gray-700 text-white"
                              />
                            </div>
                            <div>
                              <Label htmlFor="content" className="text-gray-300">
                                Content
                              </Label>
                              <Textarea
                                id="content"
                                value={newNote.content}
                                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                placeholder="Enter content..."
                                rows={4}
                                className="bg-gray-800 border-gray-700 text-white"
                              />
                            </div>
                            <Button onClick={handleCreateNote} className="w-full bg-white text-black hover:bg-gray-200">
                              Create Item
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Notes</h3>
                        <FileText className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="text-3xl font-bold text-white mb-2">{noteCount}</div>
                      <p className="text-xs text-gray-500 mb-4">Your written notes</p>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
                        onClick={() => {
                          setCurrentView("all-items")
                          setFilterType("note")
                        }}
                      >
                        View All Notes
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Passwords</h3>
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="text-3xl font-bold text-white mb-2">{passwordCount}</div>
                      <p className="text-xs text-gray-500 mb-4">Your stored passwords</p>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
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
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">
                          {selectedNote.type === "password" ? "Password" : "Note"} | Created:{" "}
                          {new Date(selectedNote.createdAt).toLocaleDateString()} | Last Updated:{" "}
                          {new Date(selectedNote.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-white"
                          onClick={() => handleCopy(selectedNote.content, selectedNote._id)}
                        >
                          {copiedStates[selectedNote._id] ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-white"
                          onClick={() => openEditDialog(selectedNote)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteNote(selectedNote._id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {selectedNote.type === "password" ? (
                        <div className="relative">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-2xl font-bold text-white">
                              {showPassword ? selectedNote.content : "•".repeat(12)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-gray-400 hover:text-white"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-white whitespace-pre-wrap">{selectedNote.content}</div>
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
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-gray-900 border-gray-800 text-white placeholder-gray-400"
                      />
                    </div>

                    <Select
                      value={filterType}
                      onValueChange={(value: "all" | "note" | "password") => setFilterType(value)}
                    >
                      <SelectTrigger className="w-full sm:w-32 bg-gray-900 border-gray-800 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="all" className="text-white">
                          All
                        </SelectItem>
                        <SelectItem value="note" className="text-white">
                          Notes
                        </SelectItem>
                        <SelectItem value="password" className="text-white">
                          Passwords
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full sm:w-auto bg-white text-black hover:bg-gray-200">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-800">
                      <DialogHeader>
                        <DialogTitle className="text-white">Create New Item</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="type" className="text-gray-300">
                            Type
                          </Label>
                          <Select
                            value={newNote.type}
                            onValueChange={(value: "note" | "password") => setNewNote({ ...newNote, type: value })}
                          >
                            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="note" className="text-white">
                                Note
                              </SelectItem>
                              <SelectItem value="password" className="text-white">
                                Password
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="title" className="text-gray-300">
                            Title
                          </Label>
                          <Input
                            id="title"
                            value={newNote.title}
                            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                            placeholder="Enter title..."
                            className="bg-gray-800 border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="content" className="text-gray-300">
                            Content
                          </Label>
                          <Textarea
                            id="content"
                            value={newNote.content}
                            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                            placeholder="Enter content..."
                            rows={4}
                            className="bg-gray-800 border-gray-700 text-white"
                          />
                        </div>
                        <Button onClick={handleCreateNote} className="w-full bg-white text-black hover:bg-gray-200">
                          Create Item
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-4">
                  {filteredNotes.map((note) => (
                    <Card
                      key={note._id}
                      className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => handleNoteClick(note)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 mt-1">
                            {note.type === "password" ? (
                              <Lock className="h-5 w-5 text-gray-400" />
                            ) : (
                              <FileText className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-white truncate">{note.title}</h3>
                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                              {note.type === "password" ? "•".repeat(12) : note.content}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              Last Updated: {new Date(note.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredNotes.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No items found</p>
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
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-type" className="text-gray-300">
                Type
              </Label>
              <Select
                value={editNote.type}
                onValueChange={(value: "note" | "password") => setEditNote({ ...editNote, type: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="note" className="text-white">
                    Note
                  </SelectItem>
                  <SelectItem value="password" className="text-white">
                    Password
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-title" className="text-gray-300">
                Title
              </Label>
              <Input
                id="edit-title"
                value={editNote.title}
                onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
                placeholder="Enter title..."
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-content" className="text-gray-300">
                Content
              </Label>
              <Textarea
                id="edit-content"
                value={editNote.content}
                onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
                placeholder="Enter content..."
                rows={4}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Button onClick={handleEditNote} className="w-full bg-white text-black hover:bg-gray-200">
              Update Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
