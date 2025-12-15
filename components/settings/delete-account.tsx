"use client"

import { useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function DeleteAccount({ userEmail }: { userEmail: string }) {
  const [confirmEmail, setConfirmEmail] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleDeleteAccount = async () => {
    if (confirmEmail !== userEmail) {
      setError("Email does not match your account email")
      return
    }

    setDeleting(true)
    setError("")

    try {
      const supabase = createBrowserClient()
      
      // Call API to delete user data
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to delete account")
        setDeleting(false)
        return
      }

      // Sign out the user
      await supabase.auth.signOut()
      
      // Redirect to home page
      router.push("/")
    } catch (err) {
      setError("An error occurred while deleting your account")
      setDeleting(false)
    }
  }

  return (
    <div className="glass-card p-6 space-y-4">
      <h2 className="text-xl font-semibold text-white">Danger Zone</h2>
      <p className="text-white/60 text-sm">
        Once you delete your account, there is no going back. This will permanently delete your account and all associated data.
      </p>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            className="bg-red-900/20 border border-red-500/50 text-red-400 hover:bg-red-900/40"
          >
            Delete Account
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-black/95 border-red-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="confirm-email" className="text-white">
                Type your email to confirm: <span className="font-mono text-sm">{userEmail}</span>
              </Label>
              <Input
                id="confirm-email"
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder={userEmail}
                className="bg-white/5 border-white/10 text-white mt-2"
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-transparent border-white/10 text-white hover:bg-white/10"
              disabled={deleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteAccount()
              }}
              disabled={deleting || confirmEmail !== userEmail}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
