import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";

/**
 * Conditionally renders Sanity VisualEditing overlay.
 *
 * Only renders when Next.js draft mode is enabled so the editing UI is never
 * shipped to public visitors. The draft-mode check runs server-side; tokens
 * stay server-only and are never exposed to the browser.
 */
export async function VisualEditingWrapper() {
  const draft = await draftMode();

  if (!draft.isEnabled) {
    return null;
  }

  return <VisualEditing />;
}
