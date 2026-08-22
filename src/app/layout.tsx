import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from "next";
import { Nunito } from "next/font/google";

import HeaderControls from "@/components/HeaderControls";
import { LOCALE_INFO } from "@/lib/i18n/config";
import { I18nProvider } from "@/lib/i18n/context";
import { getServerDictionary, getServerLocale } from "@/lib/i18n/server";

import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();

  return {
    title: t.meta.homeTitle,
    description: t.meta.homeDescription,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The locale comes from a cookie, so the server already knows it — unlike the
  // theme, which lives in localStorage and needs the inline script below. That
  // is the whole reason language is stored in a cookie: no flash, no mismatch.
  const locale = await getServerLocale();

  return (
    <html
      lang={LOCALE_INFO[locale].htmlLang}
      data-theme="light"
      className={`${nunito.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Applies the saved theme (or, absent one, the browser's OS-level
            light/dark preference) before first paint, so there's no flash of
            the wrong theme — see Next's flash-prevention guide. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("fluent.theme");if(!t)t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <I18nProvider initialLocale={locale}>
          <HeaderControls />
          {children}
          <Analytics />
        </I18nProvider>
      </body>
    </html>
  );
}
