import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export function useAuthGate(): { isAuthenticated: boolean; userId: string | null } {
  const [authed, setAuthed] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session)
      setUserId(session?.user?.id ?? null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAuthed(!!session)
        setUserId(session?.user?.id ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { isAuthenticated: authed, userId }
}
