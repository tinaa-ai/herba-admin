"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  expectedSessionToken,
  safeEqual,
  safeNextPath,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/auth";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return { error: "서버에 비밀번호(ADMIN_PASSWORD)가 설정되지 않았어요." };
  }

  const input = formData.get("password");
  if (typeof input !== "string" || !(await safeEqual(input, password))) {
    return { error: "비밀번호가 맞지 않아요." };
  }

  const token = await expectedSessionToken();
  (await cookies()).set(SESSION_COOKIE, token!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  redirect(safeNextPath(formData.get("next")));
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
