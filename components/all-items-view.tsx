"use client"

import { useState } from "react"
import { Plus, FileText, Lock, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createNote, updateNote, deleteNote, type NoteItem } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface AllItemsViewProps {
  notes: NoteItem[]
  onNotesChange: () => void
  loading: boolean
}

export function AllItemsView({ notes, onNotesChange, loading }: AllItemsViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "note" | "password">("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null)
  const [formData, setFormData] = useState({
    type: "note" as "note" | "password",
    title: "",
    content: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Filter notes based on search term and type filter
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || note.type === filterType
    return matchesSearch && matchesType
  })

  const handleCreateNote = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      await createNote(formData)
      toast({
        title: "Success",
        description: "Note created successfully!",
      })
      setIsCreateDialogOpen(false)
      setFormData({ type: "note", title: "", content: "" })
      onNotesChange()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create note. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditNote = async () => {
    if (!editingNote || !formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      await updateNote(editingNote._id, formData)
      toast({
        title: "Success",
        description: "Note updated successfully!",
      })
      setEditingNote(null)
      setFormData({ type: "note", title: "", content: "" })
      onNotesChange()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update note. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) {
      return
    }

    try {
      await deleteNote(noteId)
      toast({
        title: "Success",
        description: "Note deleted successfully!",
      })
      onNotesChange()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (note: NoteItem) => {
    setEditingNote(note)
    setFormData({
      type: note.type,
      title: note.title,
      content: note.content,
    })
  }

  const closeEditDialog = () => {
    setEditingNote(null)
    setFormData({ type: "note", title: "", content: "" })
  }

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading notes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">All Items</h1>
          <p className="text-gray-600">Manage all your notes and passwords.</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select
                value={formData.type}
                onValueChange={(value: "note" | "password") => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select note type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="password">Password</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Note title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Textarea
                placeholder="Note content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
              />
              <Button onClick={handleCreateNote} disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Creating..." : "Create Note"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={(value: "all" | "note" | "password") => setFilterType(value)}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="note">Notes Only</SelectItem>
            <SelectItem value="password">Passwords Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredNotes.length} of {notes.length} items
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600 mb-2">No items found</p>
              <p className="text-sm text-gray-400 mb-4">
                {searchTerm || filterType !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first note to get started"}
              </p>
              {!searchTerm && filterType === "all" && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Note
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredNotes.map((note) => (
            <Card key={note._id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium truncate">{note.title}</CardTitle>
                  <Badge variant={note.type === "password" ? "destructive" : "default"}>
                    {note.type === "password" ? <Lock className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-3 mb-3">{note.content}</p>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-400">{new Date(note.updatedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEditDialog(note)} className="flex-1">
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteNote(note._id)} className="flex-1">
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingNote} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select
              value={formData.type}
              onValueChange={(value: "note" | "password") => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select note type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="password">Password</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Note title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Textarea
              placeholder="Note content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
            />
            <Button onClick={handleEditNote} disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Updating..." : "Update Note"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
