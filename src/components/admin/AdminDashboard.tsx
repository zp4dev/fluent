"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { LOCALE_INFO } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/context";
import { fmt } from "@/lib/i18n/format";
import { formatVnd } from "@/lib/plans";

export interface PendingOrderRow {
  id: string;
  email: string;
  planName: string;
  amount: number;
  createdAt: string;
}

export default function AdminDashboard({
  email,
  orders,
}: {
  email: string;
  orders: PendingOrderRow[];
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dateFormat = new Intl.DateTimeFormat(LOCALE_INFO[locale].htmlLang, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  async function activate(order: PendingOrderRow) {
    // Granting Pro is not reversible from this screen, so it asks first.
    if (!window.confirm(fmt(t.admin.activateConfirm, { email: order.email }))) {
      return;
    }

    setBusyId(order.id);
    setNotice(null);
    setError(null);

    try {
      // No secret in the body: the admin session cookie authorises this.
      const response = await fetch("/api/admin/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: order.email }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        warning?: string;
        expiresAt?: string;
      };

      if (!response.ok || !data.ok) {
        setError(data.error ?? t.admin.activateFailed);
        return;
      }

      setNotice(
        data.warning ??
          fmt(t.admin.activated, {
            email: order.email,
            expiresAt: data.expiresAt ?? "?",
          }),
      );
      // Re-render the server component so the row leaves the pending list.
      router.refresh();
    } catch {
      setError(t.admin.activateFailed);
    } finally {
      setBusyId(null);
    }
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-[960px] flex-col gap-6 px-5 py-12 sm:px-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold leading-tight text-heading">
            {t.admin.title}
          </h1>
          <p className="mt-1 text-sm font-bold text-muted">
            {t.admin.signedInAs}{" "}
            <span className="text-translation">{email}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className="cursor-pointer rounded-full border-2 border-border bg-card px-4 py-2 text-sm font-bold text-primary shadow-sm transition ease-smooth hover:border-primary hover:bg-highlight"
          >
            {t.admin.backToApp}
          </Link>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="cursor-pointer rounded-full border-2 border-border bg-card px-4 py-2 text-sm font-bold text-primary shadow-sm transition ease-smooth hover:border-primary hover:bg-highlight"
          >
            {t.admin.refresh}
          </button>
          <button
            type="button"
            onClick={signOut}
            className="cursor-pointer rounded-full border-2 border-border bg-card px-4 py-2 text-sm font-bold text-muted shadow-sm transition ease-smooth hover:border-wrong hover:text-wrong"
          >
            {t.admin.signOut}
          </button>
        </div>
      </header>

      {notice ? (
        <p
          role="status"
          className="rounded-2xl border-2 border-correct bg-correct-light px-5 py-4 text-sm font-bold text-heading"
        >
          {notice}
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="rounded-2xl border-2 border-wrong bg-wrong-light px-5 py-4 text-sm font-bold text-wrong"
        >
          {error}
        </p>
      ) : null}

      <section className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-extrabold text-heading">
          {fmt(t.admin.pendingTitle, { count: orders.length })}
        </h2>

        {orders.length === 0 ? (
          <p className="mt-6 text-center text-base text-body">
            {t.admin.pendingEmpty}
          </p>
        ) : (
          // Wide table scrolls inside its own container so the page body
          // never scrolls sideways on a phone.
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-border">
                  {[
                    t.admin.colEmail,
                    t.admin.colPlan,
                    t.admin.colAmount,
                    t.admin.colCreated,
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="py-2.5 pr-4 text-xs font-extrabold uppercase tracking-wide text-muted"
                    >
                      {heading}
                    </th>
                  ))}
                  <th className="py-2.5" />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border">
                    <td className="py-3 pr-4 text-sm font-bold text-heading">
                      {order.email}
                    </td>
                    <td className="py-3 pr-4 text-sm text-body">
                      {order.planName}
                    </td>
                    <td className="py-3 pr-4 text-sm font-extrabold text-translation">
                      {formatVnd(order.amount)}
                    </td>
                    <td className="py-3 pr-4 text-sm text-muted">
                      {dateFormat.format(new Date(order.createdAt))}
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => activate(order)}
                        disabled={busyId !== null}
                        className="cursor-pointer whitespace-nowrap rounded-xl bg-primary px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-white transition ease-smooth hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busyId === order.id
                          ? t.admin.activating
                          : t.admin.activate}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
