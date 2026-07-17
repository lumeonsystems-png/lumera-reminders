import crypto from "crypto";

const COOKIE_NAME = "lumera_auth";

function expectedToken() {
  const password = process.env.ADMIN_PASSWORD || "";
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function checkPassword(password) {
  return password === process.env.ADMIN_PASSWORD;
}

export function authCookie() {
  const token = expectedToken();
  // httpOnly + sameSite=lax pakanka vieno vartotojo vidiniam įrankiui.
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=2592000`;
}

export function clearAuthCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
}

export function isAuthed(cookieHeader) {
  if (!cookieHeader) return false;
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return false;
  const value = match.split("=")[1];
  return value === expectedToken();
}

export const COOKIE_KEY = COOKIE_NAME;
