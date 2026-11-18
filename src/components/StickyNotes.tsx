"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "herba.sticky-notes.v1";
const NOTE_W = 208;

const COLORS = {
  yellow: "bg-note-yellow",
  pink: "bg-note-pink",
  blue: "bg-note-blue",
  green: "bg-note-green",
} as const;
type NoteColor = keyof typeof COLORS;
const COLOR_NAMES: Record<NoteColor, string> = { yellow: "노랑", pink: "분홍", blue: "파랑", green: "초록" };

type Note = { id: string; text: string; x: number; y: number; color: NoteColor };

const newId = () => Math.random().toString(36).slice(2, 9);

function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Note[]) : [];
    return Array.isArray(parsed) ? parsed.filter((n) => n && typeof n.id === "string") : [];
  } catch {
    return [];
  }
}

/**
 * 포스트잇 메모. 페이지 위 아무 데나 붙여 두고 윗부분을 끌어서 옮겨요.
 * 이 브라우저에만 저장돼요 (다른 기기·사람과 공유되지 않음).
 * 부모 요소는 `relative`여야 해요. 메모 위치는 부모 기준 px예요.
 */
export function StickyNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loaded, setLoaded] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardW, setBoardW] = useState(0);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);

  useEffect(() => {
    // 저장값은 브라우저에만 있어서 마운트 후에 읽어요 (서버 렌더와 어긋나지 않게)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotes(loadNotes());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      /* 저장이 막힌 브라우저에서도 메모는 화면에 남아요 */
    }
  }, [notes, loaded]);

  // 화면 폭이 줄면 메모가 밖으로 나가지 않게 x를 화면 안으로 당겨서 보여줘요 (저장값은 그대로)
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBoardW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const clampX = (x: number) => (boardW > 0 ? Math.max(0, Math.min(x, boardW - NOTE_W)) : x);

  const update = (id: string, patch: Partial<Note>) =>
    setNotes((ns) => ns.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  // 누른 메모를 맨 위로 (배열 끝이 위에 그려져요)
  const toFront = (id: string) =>
    setNotes((ns) => {
      const i = ns.findIndex((n) => n.id === id);
      return i < 0 || i === ns.length - 1 ? ns : [...ns.slice(0, i), ...ns.slice(i + 1), ns[i]];
    });

  const add = () => {
    const board = boardRef.current?.getBoundingClientRect();
    const top = board ? Math.max(0, -board.top) : 0; // 지금 보이는 화면 위쪽 근처에 붙여요
    const offset = (notes.length % 5) * 24;
    const x = Math.max(0, (board?.width ?? NOTE_W) - NOTE_W - 16 - offset);
    setNotes((ns) => [...ns, { id: newId(), text: "", x, y: top + 72 + offset, color: "yellow" }]);
  };

  const onPointerDown = (e: React.PointerEvent, n: Note) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: n.id, dx: e.clientX - clampX(n.x), dy: e.clientY - n.y };
    toFront(n.id);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    update(d.id, { x: clampX(e.clientX - d.dx), y: Math.max(0, e.clientY - d.dy) });
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  return (
    <>
      <button
        type="button"
        onClick={add}
        className="fixed bottom-5 right-5 z-20 rounded-full border border-line bg-note-yellow px-4 py-2.5 text-sm font-medium shadow-md hover:brightness-95"
      >
        + 메모
      </button>
      <div ref={boardRef} className="pointer-events-none absolute inset-0 z-[5]">
        {notes.map((n) => (
          <div
            key={n.id}
            style={{ left: clampX(n.x), top: n.y, width: NOTE_W }}
            className={`pointer-events-auto absolute rounded-sm shadow-lg ring-1 ring-black/5 ${COLORS[n.color]}`}
            onPointerDown={() => toFront(n.id)}
          >
            <div
              onPointerDown={(e) => onPointerDown(e, n)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className="flex cursor-grab touch-none items-center gap-1.5 px-2 py-1.5 active:cursor-grabbing"
              title="끌어서 옮기기"
            >
              {(Object.keys(COLORS) as NoteColor[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`${COLOR_NAMES[c]}으로 바꾸기`}
                  onClick={() => update(n.id, { color: c })}
                  className={`size-3.5 rounded-full border ${COLORS[c]} ${n.color === c ? "border-foreground" : "border-black/15"}`}
                />
              ))}
              <span className="flex-1" />
              <button
                type="button"
                aria-label="메모 삭제"
                onClick={() => {
                  if (!n.text.trim() || confirm("이 메모를 지울까요?"))
                    setNotes((ns) => ns.filter((x) => x.id !== n.id));
                }}
                className="px-1 text-base leading-none text-muted hover:text-sale"
              >
                ×
              </button>
            </div>
            <textarea
              aria-label="메모 내용"
              value={n.text}
              onChange={(e) => update(n.id, { text: e.target.value })}
              placeholder="메모를 적어 주세요"
              rows={6}
              className="block w-full resize-y bg-transparent px-3 pb-3 text-sm leading-relaxed outline-none placeholder:text-muted"
            />
          </div>
        ))}
      </div>
    </>
  );
}
