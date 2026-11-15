"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/login/actions";

type TabLink = { href: string; label: string };
type TabGroup = { label: string; items: TabLink[] };

/** 위쪽 탭. 그룹은 마우스를 올리면(터치는 누르면) 아래로 펼쳐지는 메뉴에서 하위 페이지를 골라요 */
const tabs: (TabLink | TabGroup)[] = [
  {
    label: "가격 분석",
    items: [
      { href: "/unit-price", label: "제품단가금액" },
      { href: "/competitors", label: "경쟁사 제품 금액 비교" },
      { href: "/packaging", label: "부자재 용어" },
    ],
  },
  { href: "/trade-shows", label: "박람회 일정" },
];

const tabClass = (active: boolean) =>
  `whitespace-nowrap border-b-2 px-3 py-3 text-sm transition-colors ${
    active
      ? "border-foreground font-medium text-foreground"
      : "border-transparent text-muted hover:text-foreground"
  }`;

function GroupTab({ group, pathname }: { group: TabGroup; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const current = group.items.find((it) => pathname.startsWith(it.href));
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPointer = useRef<string>("mouse");

  // 마우스를 올리면 바로 열고, 벗어나면 잠깐 기다렸다 닫아요(메뉴로 옮겨 가는 사이 닫히지 않게)
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const onPointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    cancelClose();
    setOpen(true);
  };
  const onPointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };
  useEffect(() => cancelClose, []);

  // 다른 탭에 있을 때 누르면 첫 하위 페이지로 이동해 밑줄이 옮겨 와요.
  // 이미 이 그룹에 있으면 터치는 메뉴를 열고 닫고, 마우스는 이미 열려 있으니 그대로 둬요
  const onClick = () => {
    if (!current && group.items[0]) {
      setOpen(false);
      router.push(group.items[0].href);
    } else if (lastPointer.current === "mouse") {
      setOpen(true);
    } else {
      setOpen((o) => !o);
    }
  };

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (
        e instanceof KeyboardEvent
          ? e.key === "Escape"
          : !ref.current?.contains(e.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onPointerDown={(e) => (lastPointer.current = e.pointerType)}
        onClick={onClick}
        className={`flex items-center gap-1 ${tabClass(!!current)}`}
      >
        {group.label}
        <svg
          aria-hidden
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`ml-0.5 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M2.5 4.5 6 8l3.5-3.5" />
        </svg>
      </button>
      {open && (
        // 바깥 pt-1은 탭과 메뉴 사이 틈을 메워 마우스가 지나가도 닫히지 않게 해요
        <div className="absolute left-0 top-full z-20 min-w-48 pt-1">
          <div className="rounded-lg border border-line bg-surface py-1 shadow-lg">
            {group.items.map((it) => {
              const active = pathname.startsWith(it.href);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`block whitespace-nowrap px-3 py-2 text-sm ${
                    active
                      ? "bg-subtle font-medium text-foreground"
                      : "text-muted hover:bg-subtle hover:text-foreground"
                  }`}
                >
                  {it.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function TabNav() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <>
      <nav className="flex min-w-0 flex-1 flex-wrap gap-x-1">
        {tabs.map((tab) =>
          "items" in tab ? (
            <GroupTab key={tab.label} group={tab} pathname={pathname} />
          ) : (
            <Link
              key={tab.href}
              href={tab.href}
              className={tabClass(pathname.startsWith(tab.href))}
            >
              {tab.label}
            </Link>
          ),
        )}
      </nav>
      <form action={logout}>
        <button
          type="submit"
          className="whitespace-nowrap text-sm text-muted hover:text-foreground"
        >
          로그아웃
        </button>
      </form>
    </>
  );
}
