import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { deriveEventConfig } from "@/pages/admin/features/settings/utils"

export function useBootstrap() {
  const { slug } = useParams<{ slug: string }>()
  const { setContext, setBootstrapError } = useAdminStore()

  useEffect(() => {
    if (!slug) {
      setBootstrapError("No event slug found in URL.")
      return
    }

    console.log(slug);


    supabase
      .from("events")
      .select("id, slug, name, date_start, date_end")
      .eq("slug", slug)
      .single()
      .then(({ data, error }) => {

        console.log(data);

        return;

        if (error || !data) {
          setBootstrapError("Event not found.")
          return
        }
        setContext({
          slug: data.slug,
          eventId: data.id,

        })
      })
  }, [slug])
}
