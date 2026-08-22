import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from "next";
import { Nunito } from "next/font/google";

import HeaderControls from "@/components/HeaderControls";
import { LOCALE_INFO } from "@/lib/i18n/config";
import { I18nProvider } from "@/lib/i18n/context";
import { getServerDictionary, getServerLocale } from "@/lib/i18n/server";
import { DEFAULT_THEME, themeBootstrapScript } from "@/lib/theme/config";
import { getServerTheme } from "@/lib/theme/server";

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
  // Both preferences are cookies, so the server renders the first paint in the
  // right language AND the right theme — no flash, and nothing for the client
  // to correct. A null theme means this browser has not told us yet.
  const [locale, theme] = await Promise.all([
    getServerLocale(),
    getServerTheme(),
  ]);

  const resolvedTheme = theme ?? DEFAULT_THEME;

  return (
    <html
      lang={LOCALE_INFO[locale].htmlLang}
      data-theme={resolvedTheme}
      className={`${nunito.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Only emitted on a first visit, when no theme cookie exists yet: the
            OS-level light/dark preference is knowable only in the browser, so
            it has to be applied before first paint. The script writes the
            cookie, so from the next request on the markup above is already
            correct and this script is gone. */}
        {theme === null ? (
          <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript() }} />
        ) : null}
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <I18nProvider initialLocale={locale}>
          <HeaderControls initialTheme={resolvedTheme} />
          {children}
          <Analytics />
        </I18nProvider>
      </body>
    </html>
  );
}
