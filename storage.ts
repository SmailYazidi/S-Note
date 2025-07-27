export interface NoteItem {
  id: string
  type: "note" | "password"
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = "snote-app-items"

export function loadItems(): NoteItem[] {
  if (typeof window === "undefined") {
    return []
  }
  try {
    const serializedItems = localStorage.getItem(STORAGE_KEY)
    if (serializedItems === null) {
      return []
    }
    return JSON.parse(serializedItems)
  } catch (error) {
    console.error("Error loading items from localStorage:", error)
    return []
  }
}

export function saveItems(items: NoteItem[]): void {
  if (typeof window === "undefined") {
    return
  }
  try {
    const serializedItems = JSON.stringify(items)
    localStorage.setItem(STORAGE_KEY, serializedItems)
  } catch (error) {
    console.error("Error saving items to localStorage:", error)
  }
}
