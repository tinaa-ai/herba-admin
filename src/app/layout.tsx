import type { Metadata } from "next";
import { TabNav } from "@/components/TabNav";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "HERBA | Admin",
    template: "HERBA | %s",
  },
  description: "레우비스 내부 관리 도구",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-10 border-b border-line bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
            {/* 좁은 화면에서는 탭이 넘치지 않게 이름을 숨겨요 */}
            <span className="hidden py-3 text-sm font-semibold tracking-tight sm:inline">Herba Admin</span>
            <TabNav />
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
