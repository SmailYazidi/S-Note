"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { changePassword } from "@/lib/auth"

interface ChangePasswordDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChangePasswordDialog({ isOpen, onClose }: ChangePasswordDialogProps) {
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isError] = useState(false)

  const handleSave = () => {
    setMessage("")

    if (newPassword !== confirmNewPassword) {
      setMessage("New password and confirmation do not match.")
      return
    }

    if (newPassword.length < 6) {
      setMessage("New password must be at least 6 characters long.")
      return
    }

    if (changePassword(oldPassword, newPassword)) {
      setMessage("Password changed successfully!")
      setOldPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
      setTimeout(onClose, 1500)
    } else {
      setMessage("Incorrect old password.")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>Update your SNote app password.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="old-password" className="text-right">
              Old Password
            </Label>
            <Input
              id="old-password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-password" className="text-right">
              New Password
            </Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="confirm-new-password" className="text-right">
              Confirm New Password
            </Label>
            <Input
              id="confirm-new-password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="col-span-3"
            />
          </div>
          {message && <p className={`text-sm text-center ${isError ? "text-red-500" : "text-green-500"}`}>{message}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Password</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
