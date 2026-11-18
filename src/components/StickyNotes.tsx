"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { deleteNote, listNotes, saveNote } from "@/app/unit-price/notes-actions";
import { NOTE_COLORS, type Note, type NoteColor } from "@/lib/sticky-notes";

const NOTE_W = 208;
const POLL_MS = 5000;
const SAVE_DELAY_MS = 600;
/** 예전(이 브라우저에만 저장하던) 메모. 처음 한 번 서버로 옮기고 지워요 */
const LEGACY_KEY = "herba.sticky-notes.v1";

const COLORS: Record<NoteColor, string> = {
  yellow: "bg-note-yellow",
  pink: "bg-note-pink",
  blue: "bg-note-blue",
  green: "bg-note-green",
};
const COLOR_NAMES: Record<NoteColor, string> = { yellow: "노랑", pink: "분홍", blue: "파랑", green: "초록" };

const newId = () => crypto.randomUUID();

/**
 * 포스트잇 메모. 페이지 위 아무 데나 붙여 두고 윗부분을 끌어서 옮겨요.
 * 서버(Supabase)에 저장돼서 다른 기기·팀원과 공유되고, 몇 초마다 다른 사람이 고친 내용을 가져와요.
 * 같은 메모를 동시에 고치면 나중에 저장한 쪽이 남아요.
 * 부모 요소는 `relative`여야 해요. 메모 위치는 부모 기준 px예요.
 */
export function StickyNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardW, setBoardW] = useState(0);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  // 아직 서버에 안 보낸(또는 보내는 중인) 메모: 서버에서 가져온 값으로 덮어쓰지 않아요
  const dirty = useRef(new Map<string, ReturnType<typeof setTimeout> | null>());
  const deleted = useRef(new Set<string>());
  const latest = useRef<Note[]>([]);
  useEffect(() => {
    latest.current = notes;
  }, [notes]);

  const fail = (e: unknown) => setError(e instanceof Error ? e.message : "메모를 저장하지 못했어요");

  const pull = useCallback(async () => {
    try {
      const server = (await listNotes()).filter((n) => !deleted.current.has(n.id));
      setError(null);
      setNotes((local) => {
        const keep = local.filter((n) => dirty.current.has(n.id));
        const keepIds = new Set(keep.map((n) => n.id));
        return [...server.filter((n) => !keepIds.has(n.id)), ...keep].sort((a, b) => a.z - b.z);
      });
    } catch (e) {
      fail(e);
    }
  }, []);

  const flush = useCallback(async (id: string) => {
    const note = latest.current.find((n) => n.id === id);
    dirty.current.set(id, null);
    try {
      if (note) await saveNote(note);
      setError(null);
    } catch (e) {
      fail(e);
    } finally {
      // 저장하는 사이에 또 고쳤으면(새 타이머가 있으면) 그대로 둬요
      if (dirty.current.get(id) === null) dirty.current.delete(id);
    }
  }, []);

  const schedule = (id: string, delay = SAVE_DELAY_MS) => {
    const t = dirty.current.get(id);
    if (t) clearTimeout(t);
    dirty.current.set(
      id,
      setTimeout(() => void flush(id), delay),
    );
  };

  useEffect(() => {
    (async () => {
      // 예전에 이 브라우저에만 저장한 메모가 있으면 서버로 옮겨요
      try {
        const raw = localStorage.getItem(LEGACY_KEY);
        const old = raw ? (JSON.parse(raw) as Omit<Note, "z">[]) : [];
        if (Array.isArray(old) && old.length) {
          let z = Date.now();
          for (const n of old) await saveNote({ ...n, id: newId(), z: z++ });
        }
        localStorage.removeItem(LEGACY_KEY);
      } catch {
        /* 옮기지 못하면 다음에 다시 시도해요 */
      }
      await pull();
    })();
    const t = setInterval(() => {
      if (document.visibilityState === "visible") void pull();
    }, POLL_MS);
    const onFocus = () => void pull();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
    };
  }, [pull]);

  // 화면 폭이 줄면 메모가 밖으로 나가지 않게 x를 화면 안으로 당겨서 보여줘요 (저장값은 그대로)
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBoardW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const clampX = (x: number) => (boardW > 0 ? Math.max(0, Math.min(x, boardW - NOTE_W)) : x);

  // 저장 타이머가 렌더보다 먼저 돌 수 있어서 latest도 바로 맞춰 둬요
  const apply = (fn: (ns: Note[]) => Note[]) => {
    latest.current = fn(latest.current);
    setNotes(fn);
  };
  const update = (id: string, patch: Partial<Note>, delay?: number) => {
    apply((ns) => ns.map((n) => (n.id === id ? { ...n, ...patch } : n)));
    schedule(id, delay);
  };
  // 누른 메모를 맨 위로 (z가 크면 위에 그려져요)
  const toFront = (id: string) => {
    const top = Math.max(0, ...latest.current.map((n) => n.z));
    const me = latest.current.find((n) => n.id === id);
    if (!me || (me.z === top && latest.current.filter((n) => n.z === top).length === 1)) return;
    apply((ns) => ns.map((n) => (n.id === id ? { ...n, z: top + 1 } : n)).sort((a, b) => a.z - b.z));
    schedule(id);
  };

  const add = () => {
    const board = boardRef.current?.getBoundingClientRect();
    const top = board ? Math.max(0, -board.top) : 0; // 지금 보이는 화면 위쪽 근처에 붙여요
    const offset = (notes.length % 5) * 24;
    const x = Math.max(0, (board?.width ?? NOTE_W) - NOTE_W - 16 - offset);
    const z = Math.max(0, ...notes.map((n) => n.z)) + 1;
    const note: Note = { id: newId(), text: "", x, y: top + 72 + offset, color: "yellow", z };
    apply((ns) => [...ns, note]);
    schedule(note.id, 0);
  };

  const remove = (n: Note) => {
    if (n.text.trim() && !confirm("이 메모를 지울까요? 다른 사람 화면에서도 지워져요.")) return;
    const t = dirty.current.get(n.id);
    if (t) clearTimeout(t);
    dirty.current.delete(n.id);
    deleted.current.add(n.id);
    setNotes((ns) => ns.filter((x) => x.id !== n.id));
    deleteNote(n.id).then(() => setError(null), fail);
  };

  const onPointerDown = (e: React.PointerEvent, n: Note) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: n.id, dx: e.clientX - clampX(n.x), dy: e.clientY - n.y };
    // 끄는 동안 서버 값으로 되돌아가지 않게 미리 표시해요
    dirty.current.set(n.id, dirty.current.get(n.id) ?? null);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    update(d.id, { x: clampX(e.clientX - d.dx), y: Math.max(0, e.clientY - d.dy) });
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d) schedule(d.id, 0);
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 z-20 flex flex-col items-end gap-2">
        {error && (
          <p role="alert" className="max-w-60 rounded-md bg-warn-soft px-3 py-1.5 text-xs text-warn shadow">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={add}
          className="rounded-full border border-line bg-note-yellow px-4 py-2.5 text-sm font-medium shadow-md hover:brightness-95"
        >
          + 메모
        </button>
      </div>
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
              {NOTE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`${COLOR_NAMES[c]}으로 바꾸기`}
                  onClick={() => update(n.id, { color: c }, 0)}
                  className={`size-3.5 rounded-full border ${COLORS[c]} ${n.color === c ? "border-foreground" : "border-black/15"}`}
                />
              ))}
              <span className="flex-1" />
              <button
                type="button"
                aria-label="메모 삭제"
                onClick={() => remove(n)}
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
              maxLength={5000}
              rows={6}
              className="block w-full resize-y bg-transparent px-3 pb-3 text-sm leading-relaxed outline-none placeholder:text-muted"
            />
          </div>
        ))}
      </div>
    </>
  );
}
