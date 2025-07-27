"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { notesApi, authApi, type NoteItem } from "@/lib/api"
import DesktopSidebar from "@/components/desktop-sidebar"
import MobileSidebar from "@/components/mobile-sidebar"
import { Save, Trash2, FileText, Lock } from "lucide-react"

export default function HomePage() {
  const [notes, setNotes] = useState<NoteItem[]>([])
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [type, setType] = useState<"note" | "password">("note")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!authApi.isAuthenticated()) {
        router.push("/auth/signin")
        return
      }

      const result = await authApi.checkSession()
      if (!result.success) {
        router.push("/auth/signin")
        return
      }

      loadNotes()
    }

    checkAuth()
  }, [router])

  const loadNotes = async () => {
    setIsLoading(true)
    try {
      const result = await notesApi.getAll()
      if (result.success && result.data) {
        setNotes(result.data)
      } else {
        setError(result.error || "Failed to load notes")
      }
    } catch (error) {
      setError("Failed to load notes")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectNote = (note: NoteItem) => {
    setSelectedNote(note)
    setTitle(note.title)
    setContent(note.content)
    setType(note.type)
    setError("")
    setSuccess("")
  }

  const handleCreateNote = () => {
    setSelectedNote(null)
    setTitle("")
    setContent("")
    setType("note")
    setError("")
    setSuccess("")
  }

  const handleSaveNote = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required")
      return
    }

    setIsSaving(true)
    setError("")

    try {
      if (selectedNote) {
        // Update existing note
        const result = await notesApi.update(selectedNote._id, { title, content, type })
        if (result.success && result.data) {
          setNotes(notes.map((note) => (note._id === selectedNote._id ? result.data! : note)))
          setSelectedNote(result.data)
          setSuccess("Note updated successfully")
        } else {
          setError(result.error || "Failed to update note")
        }
      } else {
        // Create new note
        const result = await notesApi.create({ title, content, type })
        if (result.success && result.data) {
          setNotes([result.data, ...notes])
          setSelectedNote(result.data)
          setSuccess("Note created successfully")
        } else {
          setError(result.error || "Failed to create note")
        }
      }
    } catch (error) {
      setError("Failed to save note")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteNote = async () => {
    if (!selectedNote) return

    if (!confirm("Are you sure you want to delete this note?")) return

    try {
      const result = await notesApi.delete(selectedNote._id)
      if (result.success) {
        setNotes(notes.filter((note) => note._id !== selectedNote._id))
        handleCreateNote()
        setSuccess("Note deleted successfully")
      } else {
        setError(result.error || "Failed to delete note")
      }
    } catch (error) {
      setError("Failed to delete note")
    }
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DesktopSidebar
        notes={notes}
        selectedNote={selectedNote}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filteredNotes={filteredNotes}
      />

      <MobileSidebar
        notes={notes}
        selectedNote={selectedNote}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filteredNotes={filteredNotes}
      />

      <div className="md:pl-80">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedNote ? "Edit Note" : "New Note"}
            </h2>
            {selectedNote && (
              <Badge variant={selectedNote.type === "password" ? "destructive" : "secondary"}>
                {selectedNote.type === "password" ? (
                  <>
                    <Lock className="h-3 w-3 mr-1" />
                    Password
                  </>
                ) : (
                  <>
                    <FileText className="h-3 w-3 mr-1" />
                    Note
                  </>
                )}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            {selectedNote && (
              <Button variant="destructive" size="sm" onClick={handleDeleteNote}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button onClick={handleSaveNote} disabled={isSaving} size="sm">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        <div className="p-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter note title..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={type} onValueChange={(value: "note" | "password") => setType(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="note">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          Note
                        </div>
                      </SelectItem>
                      <SelectItem value="password">
                        <div className="flex items-center">
                          <Lock className="h-4 w-4 mr-2" />
                          Password
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter your note content..."
                  className="mt-1 min-h-[400px] resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
