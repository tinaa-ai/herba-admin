"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";

const tabs = [
  { href: "/competitors", label: "경쟁사 제품 비교" },
  { href: "/trade-shows", label: "박람회 일정" },
];

export function TabNav() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <>
      <nav className="flex flex-1 gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm transition-colors ${
                active
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <form action={logout}>
        <button type="submit" className="whitespace-nowrap text-sm text-muted hover:text-foreground">
          로그아웃
        </button>
      </form>
    </>
  );
}
