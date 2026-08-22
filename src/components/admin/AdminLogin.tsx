"use client";

import { useRouter } from "next/navigation";

import EmailVerification from "@/components/EmailVerification";
import { useI18n } from "@/lib/i18n/context";

export default function AdminLogin() {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <div className="mx-auto flex w-full max-w-[440px] flex-col gap-6 px-5 py-16 sm:px-6">
      <header className="text-center">
        <p className="text-4xl">🔐</p>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-heading">
          {t.admin.title}
        </h1>
        <p className="mx-auto mt-3 text-base leading-7 text-body">
          {t.admin.subtitle}
        </p>
      </header>

      <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm sm:p-8">
        <EmailVerification
          submitLabel={t.admin.signInSubmit}
          // Refuses non-admin addresses before paying to send anything.
          sendCodeUrl="/api/admin/auth/send-code"
          // The page is a Server Component and the gate runs there, so a
          // refresh is what actually lets us in — re-rendering with the
          // session cookie the server just set.
          onVerified={() => router.refresh()}
        />
      </div>
    </div>
  );
}
