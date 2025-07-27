"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, FileText, Lock, LogOut } from "lucide-react"
import { authApi, type NoteItem } from "@/lib/api"
import { useRouter } from "next/navigation"

interface DesktopSidebarProps {
  notes: NoteItem[]
  selectedNote: NoteItem | null
  onSelectNote: (note: NoteItem) => void
  onCreateNote: () => void
  searchTerm: string
  onSearchChange: (term: string) => void
  filteredNotes: NoteItem[]
}

export default function DesktopSidebar({
  notes,
  selectedNote,
  onSelectNote,
  onCreateNote,
  searchTerm,
  onSearchChange,
  filteredNotes,
}: DesktopSidebarProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await authApi.signout()
      router.push("/auth/signin")
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="hidden md:flex md:w-80 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 bg-white dark:bg-gray-900 overflow-hidden border-r border-gray-200 dark:border-gray-700">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">S-Note</h1>
        </div>

        <div className="mt-5 flex-1 flex flex-col">
          <div className="px-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button onClick={onCreateNote} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </div>

          <div className="mt-4 flex-1">
            <ScrollArea className="h-full">
              <div className="px-4 space-y-2">
                {filteredNotes.map((note) => (
                  <div
                    key={note._id}
                    onClick={() => onSelectNote(note)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedNote?._id === note._id
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">{note.title}</h3>
                      <div className="flex items-center space-x-1">
                        {note.type === "password" && <Lock className="h-3 w-3 text-gray-400" />}
                        <Badge variant={note.type === "password" ? "destructive" : "secondary"} className="text-xs">
                          {note.type}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{note.content}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}

                {filteredNotes.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">{searchTerm ? "No notes found" : "No notes yet"}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={handleSignOut} disabled={isLoading} className="w-full bg-transparent">
              <LogOut className="h-4 w-4 mr-2" />
              {isLoading ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
