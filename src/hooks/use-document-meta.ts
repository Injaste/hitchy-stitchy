import { useEffect } from "react"

export interface DocumentMeta {
  title?: string | null
  description?: string | null
  image?: string | null
  url?: string | null
}

const upsertMeta = (selector: string, attr: "name" | "property", key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement("meta")
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute("content", content)
}

const upsertCanonical = (href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement("link")
    el.setAttribute("rel", "canonical")
    document.head.appendChild(el)
  }
  el.setAttribute("href", href)
}

export const useDocumentMeta = ({ title, description, image, url }: DocumentMeta) => {
  useEffect(() => {
    if (title) {
      document.title = title
      upsertMeta('meta[name="title"]', "name", "title", title)
      upsertMeta('meta[property="og:title"]', "property", "og:title", title)
    }

    if (description) {
      upsertMeta('meta[name="description"]', "name", "description", description)
      upsertMeta('meta[property="og:description"]', "property", "og:description", description)
    }

    if (image) {
      upsertMeta('meta[property="og:image"]', "property", "og:image", image)
    }

    if (url) {
      upsertMeta('meta[property="og:url"]', "property", "og:url", url)
      upsertCanonical(url)
    }
  }, [title, description, image, url])
}
