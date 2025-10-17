import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import { clsx } from "clsx";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

const noto = Noto_Sans_JP({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-noto-sans-jp"
});

export const metadata: Metadata = {
  title: "年収の壁シミュレーター",
  description: "月収と条件から年収・手取りと到達する壁を即時計算します。",
  metadataBase: new URL("https://example.com")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body
        className={clsx(
          inter.variable,
          noto.variable,
          "font-japanese text-[var(--color-text-primary)] antialiased"
        )}
        style={{ backgroundColor: "var(--page-bg)" }}
      >
        {children}
      </body>
    </html>
  );
}
