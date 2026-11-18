// 포스트잇 메모 공유 저장소 (Supabase `landing-page` 프로젝트의 herba_sticky_notes 테이블)
// 테이블은 RLS로 막혀 있고, NOTES_TOKEN을 아는 서버만 herba_notes_* 함수로 읽고 써요.
// 아래 URL과 publishable 키는 원래 공개용이라 코드에 둬도 괜찮아요 (토큰 없이는 아무것도 못 해요).

export const NOTE_COLORS = ["yellow", "pink", "blue", "green"] as const;
export type NoteColor = (typeof NOTE_COLORS)[number];
export type Note = { id: string; text: string; x: number; y: number; color: NoteColor; z: number };

export const SUPABASE_URL = "https://zvuveiotaedwpbxieikj.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_0PGMR2cZOm8jjDHO7KUYdw_ZMKFWmTq";

export function isNote(v: unknown): v is Note {
  if (!v || typeof v !== "object") return false;
  const n = v as Record<string, unknown>;
  return (
    typeof n.id === "string" &&
    n.id.length > 0 &&
    n.id.length <= 64 &&
    typeof n.text === "string" &&
    n.text.length <= 5000 &&
    Number.isFinite(n.x) &&
    Number.isFinite(n.y) &&
    Number.isFinite(n.z) &&
    NOTE_COLORS.includes(n.color as NoteColor)
  );
}
