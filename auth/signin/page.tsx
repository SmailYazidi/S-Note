"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Film, Tv, Play, BookOpen, Book } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import bcrypt from "bcryptjs";
export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { toast } = useToast();



const handleSignIn = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");

  try {
    const trimmedPassword = password.trim();

    // Hash the password before sending
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
    console.log("Hashed Password:", hashedPassword); // 👈 log it

    const response = await fetch("/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        password: hashedPassword, // 👈 send the hash instead
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Sign in failed");
    }

    localStorage.setItem("sessionId", data.sessionId);

    toast({
      title: "Welcome back!",
      description: "You have successfully signed in.",
    });

    router.push("/");
  } catch (err) {
    setError(err instanceof Error ? err.message : "An unexpected error occurred.");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative">
      {/* Background Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 text-white/5">
          <Film className="h-32 w-32" />
        </div>
        <div className="absolute top-40 right-32 text-white/5">
          <Tv className="h-24 w-24" />
        </div>
        <div className="absolute bottom-32 left-32 text-white/5">
          <Play className="h-28 w-28" />
        </div>
        <div className="absolute bottom-20 right-20 text-white/5">
          <BookOpen className="h-20 w-20" />
        </div>
        <div className="absolute top-1/2 left-1/4 text-white/5">
          <Book className="h-16 w-16" />
        </div>
      </div>

      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 relative z-10">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Play className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">AniMov</h1>
          </div>
          <CardTitle className="text-2xl text-white">Welcome Back</CardTitle>
          <CardDescription className="text-gray-300">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSignIn}>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="bg-red-500/10 border-red-500/20 text-red-300">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white/20 text-white placeholder:text-white/50 focus:ring-purple-400"
              />
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white/20 text-white placeholder:text-white/50 focus:ring-purple-400 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-white/70 hover:text-white focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col items-center gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-white/80 text-sm">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-purple-400 hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
