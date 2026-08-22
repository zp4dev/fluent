"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { LOCALE_INFO } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/context";
import { fmt } from "@/lib/i18n/format";
import { PLAN_ORDER, type PlanId } from "@/lib/plans";
import type { AdminUser } from "@/lib/userAdmin";

interface Props {
  users: AdminUser[];
  /** Bubbles up so the dashboard shows one notice/error strip, not three. */
  onNotice: (message: string | null) => void;
  onError: (message: string | null) => void;
}

export default function UserManager({ users, onNotice, onError }: Props) {
  const { t, locale } = useI18n();
  const router = useRouter();

  const [newEmail, setNewEmail] = useState("");
  const [newPlan, setNewPlan] = useState<PlanId>("annual");
  const [creating, setCreating] = useState(false);
  const [revokingEmail, setRevokingEmail] = useState<string | null>(null);

  const dateFormat = new Intl.DateTimeFormat(LOCALE_INFO[locale].htmlLang, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const planLabel = (plan: PlanId) =>
    plan === "annual" ? t.plans.annualName : t.plans.monthlyName;

  async function post(body: Record<string, string>) {
    // The admin session cookie authorises this — no secret in the body.
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return {
      response,
      data: (await response.json()) as {
        ok?: boolean;
        error?: string;
        expiresAt?: string;
      },
    };
  }

  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const email = newEmail.trim();
    if (!email) {
      return;
    }

    // No verification code is sent, so a typo silently grants Pro to a
    // stranger. This confirmation is the only thing standing in for that.
    if (
      !window.confirm(
        fmt(t.admin.createConfirm, { email, plan: planLabel(newPlan) }),
      )
    ) {
      return;
    }

    setCreating(true);
    onNotice(null);
    onError(null);

    try {
      const { response, data } = await post({
        action: "grant",
        email,
        plan: newPlan,
      });

      if (!response.ok || !data.ok) {
        onError(data.error ?? t.admin.createFailed);
        return;
      }

      onNotice(
        fmt(t.admin.created, { email, expiresAt: data.expiresAt ?? "?" }),
      );
      setNewEmail("");
      router.refresh();
    } catch {
      onError(t.admin.createFailed);
    } finally {
      setCreating(false);
    }
  }

  async function revoke(user: AdminUser) {
    if (!window.confirm(fmt(t.admin.revokeConfirm, { email: user.email }))) {
      return;
    }

    setRevokingEmail(user.email);
    onNotice(null);
    onError(null);

    try {
      const { response, data } = await post({
        action: "revoke",
        email: user.email,
      });

      if (!response.ok || !data.ok) {
        onError(data.error ?? t.admin.revokeFailed);
        return;
      }

      onNotice(fmt(t.admin.revoked, { email: user.email }));
      router.refresh();
    } catch {
      onError(t.admin.revokeFailed);
    } finally {
      setRevokingEmail(null);
    }
  }

  function statusOf(user: AdminUser) {
    if (user.revokedAt) {
      return { label: t.admin.statusRevoked, tone: "text-wrong" };
    }
    return user.isActive
      ? { label: t.admin.statusActive, tone: "text-translation" }
      : { label: t.admin.statusExpired, tone: "text-muted" };
  }

  return (
    <>
      <section className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-extrabold text-heading">
          {t.admin.createTitle}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          {t.admin.createHint}
        </p>

        <form
          onSubmit={createUser}
          className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <label className="flex-1">
            <span className="block text-xs font-extrabold uppercase tracking-wide text-muted">
              {t.admin.createEmailLabel}
            </span>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              placeholder={t.auth.emailPlaceholder}
              className="mt-2 w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base font-semibold text-heading outline-none transition ease-smooth placeholder:text-muted focus:border-primary"
            />
          </label>

          <label className="sm:w-48">
            <span className="block text-xs font-extrabold uppercase tracking-wide text-muted">
              {t.admin.createPlanLabel}
            </span>
            <select
              value={newPlan}
              onChange={(event) => setNewPlan(event.target.value as PlanId)}
              className="mt-2 w-full cursor-pointer rounded-2xl border-2 border-border bg-background px-4 py-3 text-base font-semibold text-heading outline-none transition ease-smooth focus:border-primary"
            >
              {PLAN_ORDER.map((id) => (
                <option key={id} value={id}>
                  {planLabel(id)}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={creating || !newEmail.trim()}
            className="cursor-pointer whitespace-nowrap rounded-2xl bg-primary px-6 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white transition ease-smooth hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating ? t.admin.creating : t.admin.createSubmit}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-extrabold text-heading">
          {fmt(t.admin.usersTitle, { count: users.length })}
        </h2>
        <p className="mt-2 text-xs leading-5 text-muted">
          {t.admin.trackedSince}
        </p>

        {users.length === 0 ? (
          <p className="mt-6 text-center text-base text-body">
            {t.admin.usersEmpty}
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-border">
                  {[
                    t.admin.colEmail,
                    t.admin.colPlan,
                    t.admin.colStatus,
                    t.admin.colRemaining,
                    t.admin.colLessons,
                    t.admin.colLastLogin,
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
                {users.map((user) => {
                  const status = statusOf(user);

                  return (
                    <tr key={user.email} className="border-b border-border">
                      <td className="py-3 pr-4 text-sm font-bold text-heading">
                        {user.email}
                      </td>
                      <td className="py-3 pr-4 text-sm text-body">
                        {planLabel(user.plan)}
                      </td>
                      <td
                        className={`py-3 pr-4 text-sm font-extrabold ${status.tone}`}
                      >
                        {status.label}
                      </td>
                      <td className="py-3 pr-4 text-sm text-body">
                        {user.isActive
                          ? fmt(t.admin.daysLeft, { days: user.daysLeft })
                          : "—"}
                      </td>
                      <td className="py-3 pr-4 text-sm font-bold text-heading">
                        {user.lessonCount}
                      </td>
                      <td className="py-3 pr-4 text-xs text-muted">
                        {user.lastLogin ? (
                          <>
                            <span className="font-bold text-body">
                              {user.lastLogin.ip}
                            </span>
                            <br />
                            {dateFormat.format(new Date(user.lastLogin.at))}
                          </>
                        ) : (
                          t.admin.neverLoggedIn
                        )}
                      </td>
                      <td className="py-3">
                        {user.isActive ? (
                          <button
                            type="button"
                            onClick={() => revoke(user)}
                            disabled={revokingEmail !== null}
                            className="cursor-pointer whitespace-nowrap rounded-xl border-2 border-border px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-wrong transition ease-smooth hover:border-wrong hover:bg-wrong-light disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {revokingEmail === user.email
                              ? t.admin.revoking
                              : t.admin.revoke}
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
