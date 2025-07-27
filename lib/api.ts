export interface NoteItem {
  _id: string
  userId: string
  type: "note" | "password"
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface CreateNoteData {
  type: "note" | "password"
  title: string
  content: string
}

export interface UpdateNoteData {
  type?: "note" | "password"
  title?: string
  content?: string
}

export interface AuthResponse {
  success: boolean
  message?: string
  sessionId?: string
}

// Notes API
export const notesApi = {
  async getAll(): Promise<NoteItem[]> {
    const sessionId = localStorage.getItem("sessionId")
    const response = await fetch("/api/notes", {
      headers: {
        Authorization: `Bearer ${sessionId}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch notes")
    }

    return response.json()
  },

  async create(data: CreateNoteData): Promise<NoteItem> {
    const sessionId = localStorage.getItem("sessionId")
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionId}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to create note")
    }

    return response.json()
  },

  async update(id: string, data: UpdateNoteData): Promise<NoteItem> {
    const sessionId = localStorage.getItem("sessionId")
    const response = await fetch(`/api/notes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionId}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to update note")
    }

    return response.json()
  },

  async delete(id: string): Promise<void> {
    const sessionId = localStorage.getItem("sessionId")
    const response = await fetch(`/api/notes/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${sessionId}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to delete note")
    }
  },
}

// Auth API
export const authApi = {
  async signUp(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (data.success && data.sessionId) {
      localStorage.setItem("sessionId", data.sessionId)
    }

    return data
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch("/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (data.success && data.sessionId) {
      localStorage.setItem("sessionId", data.sessionId)
    }

    return data
  },

  async signOut(): Promise<void> {
    const sessionId = localStorage.getItem("sessionId")
    if (sessionId) {
      await fetch("/api/auth/signout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      })
      localStorage.removeItem("sessionId")
    }
  },

  async checkAuth(): Promise<boolean> {
    const sessionId = localStorage.getItem("sessionId")
    if (!sessionId) return false

    try {
      const response = await fetch("/api/auth/session", {
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      })

      return response.ok
    } catch {
      return false
    }
  },
}
