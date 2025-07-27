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
  success: boolean
  data?: T
  error?: string
}

class ApiClient {
  private getSessionId(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("sessionId")
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const sessionId = this.getSessionId()

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(sessionId && { Authorization: `Bearer ${sessionId}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(endpoint, config)
      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP error! status: ${response.status}`,
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      }
    }
  }

  // Notes API
  async getAllNotes(): Promise<ApiResponse<NoteItem[]>> {
    return this.request<NoteItem[]>("/api/notes")
  }

  async createNote(note: Omit<NoteItem, "_id" | "userId" | "createdAt" | "updatedAt">): Promise<ApiResponse<NoteItem>> {
    return this.request<NoteItem>("/api/notes", {
      method: "POST",
      body: JSON.stringify(note),
    })
  }

  async updateNote(
    id: string,
    note: Partial<Omit<NoteItem, "_id" | "userId" | "createdAt" | "updatedAt">>,
  ): Promise<ApiResponse<NoteItem>> {
    return this.request<NoteItem>(`/api/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(note),
    })
  }

  async deleteNote(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/notes/${id}`, {
      method: "DELETE",
    })
  }

  // Auth API
  async signup(email: string, password: string): Promise<ApiResponse<{ sessionId: string }>> {
    const result = await this.request<{ sessionId: string }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    if (result.success && result.data?.sessionId) {
      localStorage.setItem("sessionId", result.data.sessionId)
    }

    return result
  }

  async signin(email: string, password: string): Promise<ApiResponse<{ sessionId: string }>> {
    const result = await this.request<{ sessionId: string }>("/api/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    if (result.success && result.data?.sessionId) {
      localStorage.setItem("sessionId", result.data.sessionId)
    }

    return result
  }

  async signout(): Promise<ApiResponse<void>> {
    const result = await this.request<void>("/api/auth/signout", {
      method: "POST",
    })

    localStorage.removeItem("sessionId")
    return result
  }

  async checkSession(): Promise<ApiResponse<{ valid: boolean }>> {
    return this.request<{ valid: boolean }>("/api/auth/session")
  }

  isAuthenticated(): boolean {
    return !!this.getSessionId()
  }
}

export const api = new ApiClient()

// Convenience exports
export const notesApi = {
  getAll: () => api.getAllNotes(),
  create: (note: Omit<NoteItem, "_id" | "userId" | "createdAt" | "updatedAt">) => api.createNote(note),
  update: (id: string, note: Partial<Omit<NoteItem, "_id" | "userId" | "createdAt" | "updatedAt">>) =>
    api.updateNote(id, note),
  delete: (id: string) => api.deleteNote(id),
}

export const authApi = {
  signup: (email: string, password: string) => api.signup(email, password),
  signin: (email: string, password: string) => api.signin(email, password),
  signout: () => api.signout(),
  checkSession: () => api.checkSession(),
  isAuthenticated: () => api.isAuthenticated(),
}
