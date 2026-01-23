"use server";

import { SessionPayload } from "@/types/inventory";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET;

if (!secretKey) {
  throw new Error("SESSION_SECRET is not set");
}
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession({
  userId,
  accessToken,
  refreshToken,
  expiresAt,
  role,
}: SessionPayload) {
  const session = await encrypt({
    userId,
    accessToken,
    refreshToken,
    expiresAt,
    role,
  });

  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  });
}

export async function deleteSession() {
  (await cookies()).delete("session");
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(payload.expiresAt)
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    if (payload.expiresAt && typeof payload.expiresAt === "string") {
      payload.expiresAt = new Date(payload.expiresAt);
    }
    return payload;
  } catch (error) {
    console.log(`Failed to verify session${error}`);
  }
}
