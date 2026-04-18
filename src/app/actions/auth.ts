// STUBBED FOR ANDROID BUILD (Client-side Firebase only)
import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET || "default_development_secret_key_123";
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

export async function createSession(userData: { id: string; username: string }) {
  // Cookies are not supported in static export / native app environment.
  // Auth state is handled by Firebase on the client.
  return { success: true };
}

export async function login(formData: FormData) {
  // Legacy login stubbed out.
  return { success: true };
}

export async function logout() {
  // Legacy logout stubbed out.
}

export async function getSession() {
  return null;
}
