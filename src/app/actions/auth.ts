"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const secretKey = "secret"; // In Production: process.env.JWT_SECRET
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function login(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { success: false, message: "Ungültiger Benutzername oder Passwort." };
  }

  // Create the session
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId: user.id, username: user.username, expires });

  // Save the session in a cookie
  (await cookies()).set("session", session, { expires, httpOnly: true });

  return { success: true, message: "" };
}

export async function logout() {
  // Destroy the session
  (await cookies()).set("session", "", { expires: new Date(0) });
}

export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}
