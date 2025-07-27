export interface NoteItem {
  _id: string
  userId: string
  title: string
  content: string
  type: "note" | "password"
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
}

export interface AuthResponse {
  message: string
  sessionId?: string
  user?: User
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

// Get session token from localStorage
function getSessionToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("sessionId")
}

// Set session token in localStorage
function setSessionToken(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem("sessionId", token)
}

// Remove session token from localStorage
function removeSessionToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("sessionId")
}

// API request helper with authentication
async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const sessionId = getSessionToken()

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (sessionId) {
    headers.Authorization = `Bearer ${sessionId}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "An error occurred",
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: "Network error occurred",
    }
  }
}

// Notes API
export const notesApi = {
  async getAll(): Promise<ApiResponse<NoteItem[]>> {
    return apiRequest<NoteItem[]>("/api/notes")
  },

  async create(note: Omit<NoteItem, "_id" | "userId" | "createdAt" | "updatedAt">): Promise<ApiResponse<NoteItem>> {
    return apiRequest<NoteItem>("/api/notes", {
      method: "POST",
      body: JSON.stringify(note),
    })
  },

  async update(
    id: string,
    note: Partial<Omit<NoteItem, "_id" | "userId" | "createdAt" | "updatedAt">>,
  ): Promise<ApiResponse<NoteItem>> {
    return apiRequest<NoteItem>(`/api/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(note),
    })
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/api/notes/${id}`, {
      method: "DELETE",
    })
  },
}

// Auth API
export const authApi = {
  async signup(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return apiRequest<AuthResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },

  async signin(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const result = await apiRequest<AuthResponse>("/api/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    if (result.success && result.data?.sessionId) {
      setSessionToken(result.data.sessionId)
    }

    return result
  },

  async signout(): Promise<ApiResponse<void>> {
    const result = await apiRequest<void>("/api/auth/signout", {
      method: "POST",
    })

    removeSessionToken()
    return result
  },

  async checkSession(): Promise<ApiResponse<{ userId: string }>> {
    return apiRequest<{ userId: string }>("/api/auth/session")
  },

  isAuthenticated(): boolean {
    return getSessionToken() !== null
  },
}
