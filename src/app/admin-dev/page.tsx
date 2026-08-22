import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AdminLogin from "@/components/admin/AdminLogin";
import DebugConsole from "@/components/admin/DebugConsole";
import { isAdminEmail } from "@/lib/admin";
import { readSession } from "@/lib/authSession";
import { getServerDictionary } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();

  return {
    title: `${t.adminDev.title} — Fluent`,
    robots: { index: false, follow: false },
  };
}

/**
 * Raw pipeline debugger. Same gate as /admin, for a stronger reason: the
 * responses here carry provider errors and prompts verbatim, so this must
 * never render for anyone but an allowlisted address.
 */
export default async function AdminDevPage() {
  const session = await readSession();

  if (session && !isAdminEmail(session.email)) {
    redirect("/");
  }

  return (
    <main className="min-h-full bg-background">
      {session ? <DebugConsole /> : <AdminLogin />}
    </main>
  );
}
