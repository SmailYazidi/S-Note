// API utility functions for making requests to the backend

export interface NoteItem {
  _id: string
  userId: string
  type: "note" | "password"
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T = any> {
  message?: string
  error?: string
  notes?: T[]
  note?: T
}

// Get session ID from localStorage
function getSessionId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("sessionId")
}

// Create headers with authorization
function createHeaders(): HeadersInit {
  const sessionId = getSessionId()
  return {
    "Content-Type": "application/json",
    ...(sessionId && { Authorization: `Bearer ${sessionId}` }),
  }
}

// Fetch all notes
export async function fetchNotes(): Promise<NoteItem[]> {
  try {
    const response = await fetch("/api/notes", {
      method: "GET",
      headers: createHeaders(),
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Session expired, redirect to login
        localStorage.removeItem("sessionId")
        window.location.href = "/auth/signin"
        return []
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: ApiResponse<NoteItem> = await response.json()
    return data.notes || []
  } catch (error) {
    console.error("Error fetching notes:", error)
    throw error
  }
}

// Create a new note
export async function createNote(noteData: {
  type: "note" | "password"
  title: string
  content: string
}): Promise<NoteItem> {
  try {
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify(noteData),
    })

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("sessionId")
        window.location.href = "/auth/signin"
        throw new Error("Session expired")
      }
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data: ApiResponse<NoteItem> = await response.json()
    if (!data.note) {
      throw new Error("No note returned from server")
    }
    return data.note
  } catch (error) {
    console.error("Error creating note:", error)
    throw error
  }
}

// Update a note
export async function updateNote(
  id: string,
  noteData: {
    type: "note" | "password"
    title: string
    content: string
  },
): Promise<NoteItem> {
  try {
    const response = await fetch(`/api/notes/${id}`, {
      method: "PUT",
      headers: createHeaders(),
      body: JSON.stringify(noteData),
    })

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("sessionId")
        window.location.href = "/auth/signin"
        throw new Error("Session expired")
      }
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data: ApiResponse<NoteItem> = await response.json()
    if (!data.note) {
      throw new Error("No note returned from server")
    }
    return data.note
  } catch (error) {
    console.error("Error updating note:", error)
    throw error
  }
}

// Delete a note
export async function deleteNote(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/notes/${id}`, {
      method: "DELETE",
      headers: createHeaders(),
    })

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("sessionId")
        window.location.href = "/auth/signin"
        throw new Error("Session expired")
      }
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    console.error("Error deleting note:", error)
    throw error
  }
}

// Get a specific note
export async function fetchNote(id: string): Promise<NoteItem> {
  try {
    const response = await fetch(`/api/notes/${id}`, {
      method: "GET",
      headers: createHeaders(),
    })

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("sessionId")
        window.location.href = "/auth/signin"
        throw new Error("Session expired")
      }
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data: ApiResponse<NoteItem> = await response.json()
    if (!data.note) {
      throw new Error("No note returned from server")
    }
    return data.note
  } catch (error) {
    console.error("Error fetching note:", error)
    throw error
  }
}

// Check session validity
export async function checkSession(): Promise<boolean> {
  try {
    const sessionId = getSessionId()
    if (!sessionId) return false

    const response = await fetch("/api/auth/session", {
      method: "GET",
      headers: createHeaders(),
    })

    return response.ok
  } catch (error) {
    console.error("Error checking session:", error)
    return false
  }
}

// Sign out
export async function signOut(): Promise<void> {
  try {
    const response = await fetch("/api/auth/signout", {
      method: "POST",
      headers: createHeaders(),
    })

    // Always remove session from localStorage, even if request fails
    localStorage.removeItem("sessionId")

    if (!response.ok) {
      console.warn("Sign out request failed, but local session cleared")
    }
  } catch (error) {
    console.error("Error signing out:", error)
    // Still remove local session
    localStorage.removeItem("sessionId")
  }
}
