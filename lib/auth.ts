"use client"

import { btoa, atob } from "js-base64"

const AUTH_KEY = "snote-app-auth"
const PASSWORD_KEY = "snote-app-password"
const DEFAULT_APP_PASSWORD = "S20S09S2003S"

// Initialize default password if not set
if (typeof window !== "undefined" && !localStorage.getItem(PASSWORD_KEY)) {
  localStorage.setItem(PASSWORD_KEY, btoa(DEFAULT_APP_PASSWORD))
}

export function login(password: string): boolean {
  if (typeof window === "undefined") return false
  const storedHashedPassword = localStorage.getItem(PASSWORD_KEY)
  if (storedHashedPassword && atob(storedHashedPassword) === password) {
    localStorage.setItem(AUTH_KEY, "true")
    return true
  }
  return false
}

export function logout(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(AUTH_KEY)
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(AUTH_KEY) === "true"
}

export function changePassword(oldPassword: string, newPassword: string): boolean {
  if (typeof window === "undefined") return false
  const storedHashedPassword = localStorage.getItem(PASSWORD_KEY)

  if (storedHashedPassword && atob(storedHashedPassword) === oldPassword) {
    localStorage.setItem(PASSWORD_KEY, btoa(newPassword))
    return true
  }
  return false
}
