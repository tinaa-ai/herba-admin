// 관리자 비밀번호 로그인
// 비밀번호는 환경 변수 ADMIN_PASSWORD 하나로 관리한다.
// 로그인하면 비밀번호에서 만든 서명값을 쿠키에 넣고, 요청마다 이 값을 비교한다.
// 비밀번호를 바꾸면 기존 로그인은 모두 풀린다.

export const SESSION_COOKIE = "herba_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30일

const encoder = new TextEncoder();

function toHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** 비밀번호가 맞을 때 쿠키에 넣을 값. 비밀번호가 설정되지 않았으면 null */
export async function expectedSessionToken(): Promise<string | null> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode("herba-admin-session-v1")));
}

/** 길이와 상관없이 일정한 시간에 비교 */
export async function safeEqual(a: string, b: string) {
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ]);
  const va = new Uint8Array(ha);
  const vb = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < va.length; i++) diff |= va[i] ^ vb[i];
  return diff === 0;
}

export async function isValidSession(token: string | undefined) {
  const expected = await expectedSessionToken();
  if (!expected || !token) return false;
  return safeEqual(token, expected);
}

/** 로그인 후 돌아갈 주소. 외부 주소로 보내지 않도록 내부 경로만 허용 */
export function safeNextPath(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}
