import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminLogin from "@/components/admin/AdminLogin";
import { isAdminEmail } from "@/lib/admin";
import { getServerDictionary } from "@/lib/i18n/server";
import { readSession } from "@/lib/authSession";
import { listPendingOrders } from "@/lib/orders";
import { listAdminUsers } from "@/lib/userAdmin";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();

  return {
    title: `${t.admin.title} — Fluent`,
    // An internal console has no business in a search index.
    robots: { index: false, follow: false },
  };
}

/**
 * The admin console.
 *
 * The gate is here, in a Server Component, rather than in proxy/middleware:
 * Next's own authentication guide calls a proxy check "optimistic" and puts
 * the real one next to the data. Nothing below the gate is sent to a browser
 * that has not proven it controls an allowlisted address — the pending orders
 * are fetched only after the check passes.
 */
export default async function AdminPage() {
  const session = await readSession();

  // Signed in as a customer: they are not getting a login form, because they
  // are already logged in — just not as anyone who belongs here.
  if (session && !isAdminEmail(session.email)) {
    redirect("/");
  }

  // Signed in on the main app with an admin address? Then there is nothing
  // left to prove and no code to email.
  if (!session) {
    return (
      <main className="min-h-full bg-background">
        <AdminLogin />
      </main>
    );
  }

  const [orders, users] = await Promise.all([
    listPendingOrders(),
    listAdminUsers(),
  ]);

  return (
    <main className="min-h-full bg-background">
      <AdminDashboard
        email={session.email}
        users={users}
        orders={orders.map((order) => ({
          id: order.id,
          email: order.email,
          planName: order.planName,
          amount: order.amount,
          createdAt: order.createdAt,
        }))}
      />
    </main>
  );
}
