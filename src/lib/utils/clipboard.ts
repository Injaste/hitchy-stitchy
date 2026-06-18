// Copy text to the clipboard, returning true only when it actually succeeded.
// Tries the async Clipboard API first, then falls back to a hidden-textarea +
// execCommand for contexts where the API is unavailable or blocked (insecure
// origin, some iframes, document not focused). Callers should gate their success
// feedback on the returned boolean — never claim "copied" unconditionally.
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
