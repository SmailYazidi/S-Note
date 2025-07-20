"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Lock, ListChecks, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardView() {
  // Example state - replace with your actual data fetching logic
  const [totalItems, setTotalItems] = useState(0)
  const [totalNotes, setTotalNotes] = useState(0)
  const [totalPasswords, setTotalPasswords] = useState(0)

  useEffect(() => {
    // Fetch data here or receive as props
    // For demo, setting some static numbers
    setTotalNotes(12)
    setTotalPasswords(8)
    setTotalItems(20)
  }, [])

  function handleNewItem() {
    // Handle adding new item - maybe open modal or navigate
    console.log("Add new item clicked")
  }

  function handleViewAll(type: "note" | "password") {
    // Handle view all notes or passwords - navigate or open modal
    console.log("View all", type)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          <ListChecks className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalItems}</div>
          <p className="text-xs text-muted-foreground">All your notes and passwords</p>
          <Button onClick={handleNewItem} className="mt-4 w-full">
            <Plus className="mr-2 h-4 w-4" /> Add New Item
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalNotes}</div>
          <p className="text-xs text-muted-foreground">Your written notes</p>
          <Button onClick={() => handleViewAll("note")} className="mt-4 w-full" variant="outline">
            View All Notes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Passwords</CardTitle>
          <Lock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPasswords}</div>
          <p className="text-xs text-muted-foreground">Your stored passwords</p>
          <Button onClick={() => handleViewAll("password")} className="mt-4 w-full" variant="outline">
            View All Passwords
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
