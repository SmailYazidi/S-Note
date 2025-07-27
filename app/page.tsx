"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, LayoutDashboard, FileText, Lock, Share, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { notesApi, authApi, type NoteItem } from "@/lib/api"
import { useTheme } from "next-themes"

export default function HomePage() {
  const [notes, setNotes] = useState<NoteItem[]>([])
  const [currentView, setCurrentView] = useState<"dashboard" | "all-items">("all-items")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "note" | "password">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newNote, setNewNote] = useState({ type: "note" as "note" | "password", title: "", content: "" })
  const router = useRouter()
  const { theme, setTheme } = useTheme()

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

      const notesResult = await notesApi.getAll()
      if (notesResult.success && notesResult.data) {
        setNotes(notesResult.data)
      }
      setIsLoading(false)
    }

    checkAuthAndLoadNotes()
  }, [router])

  const handleSignOut = async () => {
    await authApi.signout()
    router.push("/auth/signin")
  }

  const handleCreateNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return

    const result = await notesApi.create(newNote)
    if (result.success && result.data) {
      setNotes([result.data, ...notes])
      setNewNote({ type: "note", title: "", content: "" })
      setIsCreateDialogOpen(false)
    }
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">S-Note</h1>

            <nav className="space-y-2">
              <button
                onClick={() => setCurrentView("dashboard")}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  currentView === "dashboard"
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <LayoutDashboard className="mr-3 h-4 w-4" />
                Dashboard
              </button>

              <button
                onClick={() => setCurrentView("all-items")}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  currentView === "all-items"
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <FileText className="mr-3 h-4 w-4" />
                All Items
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentView === "dashboard" ? "Dashboard" : "All Items"}
              </h2>

              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>

                <Button variant="ghost" size="icon">
                  <Share className="h-4 w-4" />
                </Button>

                <Button variant="ghost" onClick={handleSignOut}>
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
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{notes.length}</div>
                      <p className="text-xs text-muted-foreground">All your notes and passwords</p>
                      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full mt-4 bg-black text-white hover:bg-gray-800">
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
                            <Button onClick={handleCreateNote} className="w-full">
                              Create Item
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{noteCount}</div>
                      <p className="text-xs text-muted-foreground">Your written notes</p>
                      <Button
                        variant="outline"
                        className="w-full mt-4 bg-transparent"
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
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Passwords</CardTitle>
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{passwordCount}</div>
                      <p className="text-xs text-muted-foreground">Your stored passwords</p>
                      <Button
                        variant="outline"
                        className="w-full mt-4 bg-transparent"
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
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-80"
                      />
                    </div>

                    <Select
                      value={filterType}
                      onValueChange={(value: "all" | "note" | "password") => setFilterType(value)}
                    >
                      <SelectTrigger className="w-32">
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
                      <Button className="bg-black text-white hover:bg-gray-800">
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
                        <Button onClick={handleCreateNote} className="w-full">
                          Create Item
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-4">
                  {filteredNotes.map((note) => (
                    <Card key={note._id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {note.type === "password" ? (
                              <Lock className="h-5 w-5 text-gray-400" />
                            ) : (
                              <FileText className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">{note.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{note.content}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              Last Updated: {new Date(note.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredNotes.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No items found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
