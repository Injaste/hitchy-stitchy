import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { useAdminStore } from "@/pages/planner/store/useAdminStore"
import { deriveEventConfig } from "@/pages/planner/features/settings/utils"

export function useBootstrap() {
  const { slug } = useParams<{ slug: string }>()
  const { setContext, setBootstrapError } = useAdminStore()

  useEffect(() => {
    if (!slug) {
      setBootstrapError("No event slug found in URL.")
      return
    }

    supabase
      .from("events")
      .select("id, slug, name, date_start, date_end, settings")
      .eq("slug", slug)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setBootstrapError("Event not found.")
          return
        }
        setContext({
          slug: data.slug,
          eventId: data.id,
          eventConfig: deriveEventConfig(data),
        })
      })
  }, [slug])
}
