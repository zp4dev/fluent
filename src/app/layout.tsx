import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from "next";
import { Nunito } from "next/font/google";

import ThemeToggle from "@/components/ThemeToggle";

import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Fluent",
  description: "Biến mọi video YouTube thành bài học tiếng Anh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      data-theme="light"
      className={`${nunito.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Applies a saved theme before first paint, so there's no flash of the
            wrong theme — see Next's flash-prevention guide. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("fluent.theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <ThemeToggle />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
