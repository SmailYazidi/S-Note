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
  user?: {
    id: string
    email: string
  }
}

// Helper function to get session ID from localStorage
const getSessionId = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("sessionId")
}

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const sessionId = getSessionId()

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(sessionId && { Authorization: `Bearer ${sessionId}` }),
      ...options.headers,
    },
  })

  if (response.status === 401) {
    // Session expired, redirect to login
    localStorage.removeItem("sessionId")
    window.location.href = "/auth/signin"
    throw new Error("Session expired")
  }

  return response
}

// Notes API
export const notesApi = {
  async getAll(): Promise<NoteItem[]> {
    const response = await makeAuthenticatedRequest("/api/notes")
    if (!response.ok) {
      throw new Error("Failed to fetch notes")
    }
    return response.json()
  },

  async getById(id: string): Promise<NoteItem> {
    const response = await makeAuthenticatedRequest(`/api/notes/${id}`)
    if (!response.ok) {
      throw new Error("Failed to fetch note")
    }
    return response.json()
  },

  async create(data: CreateNoteData): Promise<NoteItem> {
    const response = await makeAuthenticatedRequest("/api/notes", {
      method: "POST",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error("Failed to create note")
    }
    return response.json()
  },

  async update(id: string, data: UpdateNoteData): Promise<NoteItem> {
    const response = await makeAuthenticatedRequest(`/api/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error("Failed to update note")
    }
    return response.json()
  },

  async delete(id: string): Promise<void> {
    const response = await makeAuthenticatedRequest(`/api/notes/${id}`, {
      method: "DELETE",
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
    const sessionId = getSessionId()
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
    try {
      const response = await makeAuthenticatedRequest("/api/auth/session")
      return response.ok
    } catch {
      return false
    }
  },
}

// Helper function for checking session (used in components)
export const checkSession = async (): Promise<boolean> => {
  return authApi.checkAuth()
}
