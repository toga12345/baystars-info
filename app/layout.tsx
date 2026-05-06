import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "ベイスターズINFO | 横浜DeNAベイスターズ情報",
  description: "横浜DeNAベイスターズのリアルタイム情報・成績・AI展望を提供するファンサイト",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col" style={{ backgroundColor: "var(--color-surface-elevated)" }}>
        <NavBar />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
          {children}
        </main>
        <footer className="text-center py-4 text-sm" style={{ color: "var(--color-text-secondary)", borderTop: "1px solid var(--color-border-default)" }}>
          <p>ベイスターズINFO — データはスポーツナビ・NPBより取得 / 非公式ファンサイト</p>
        </footer>
      </body>
    </html>
  );
}
