"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "next-auth/react" // Import signIn from next-auth/react
import { Chrome } from "lucide-react" // Import Google icon

export default function LoginForm() {
  const [error, setError] = useState("")

  const handleGoogleLogin = async () => {
    setError("")
    try {
      await signIn("google", { callbackUrl: "/" }) // Redirect to home after successful login
    } catch (e) {
      setError("Failed to sign in with Google. Please try again.")
      console.error("Google sign-in error:", e)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">SNote App Login</CardTitle>
          <CardDescription>Sign in to access your notes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button onClick={handleGoogleLogin} className="w-full">
              <Chrome className="mr-2 h-4 w-4" /> Login with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
