import type { Metadata } from "next";

import NotebookManager from "@/components/notebook/NotebookManager";
import { getServerDictionary } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();

  return {
    title: t.meta.notebookTitle,
    description: t.meta.notebookDescription,
  };
}

/**
 * The notebook lives on its own route rather than under the generator: it is a
 * place to study what has already been collected, not part of making a lesson,
 * and the home page has enough on it.
 */
export default function NotebookPage() {
  return (
    <main className="min-h-full bg-background">
      <NotebookManager />
    </main>
  );
}
