"use server";

import { cookies } from "next/headers";
import { isValidSession, SESSION_COOKIE } from "@/lib/auth";
import { isNote, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, type Note } from "@/lib/sticky-notes";

// 서버 액션은 proxy에서도 로그인을 확인하지만, 여기서 한 번 더 확인해요
async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  if (!(await isValidSession((await cookies()).get(SESSION_COOKIE)?.value))) throw new Error("로그인이 필요해요");
  const token = process.env.NOTES_TOKEN;
  if (!token) throw new Error("서버에 NOTES_TOKEN이 설정되지 않았어요");
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_token: token, ...args }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`메모 저장소 오류 (${res.status})`);
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

export async function listNotes(): Promise<Note[]> {
  const rows = await rpc<unknown[]>("herba_notes_list", {});
  return (rows ?? []).filter(isNote);
}

export async function saveNote(note: Note): Promise<void> {
  if (!isNote(note)) throw new Error("메모 형식이 맞지 않아요");
  await rpc("herba_notes_upsert", {
    p_id: note.id,
    p_text: note.text,
    p_x: Math.round(note.x),
    p_y: Math.round(note.y),
    p_color: note.color,
    p_z: Math.round(note.z),
  });
}

export async function deleteNote(id: string): Promise<void> {
  if (typeof id !== "string" || !id) return;
  await rpc("herba_notes_delete", { p_id: id });
}
