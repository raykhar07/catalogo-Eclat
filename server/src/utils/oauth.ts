import crypto from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export type OAuthProvider = "google" | "github";

export interface OAuthProfile {
  provider: OAuthProvider;
  providerAccountId: string;
  email: string;
  emailVerified: boolean;
  name: string;
  avatarUrl?: string | null;
}

interface OAuthStatePayload {
  type: "oauth_state";
  provider: OAuthProvider;
  state: string;
  codeVerifier?: string;
  redirectTo: string;
}

interface PendingLinkPayload {
  type: "oauth_link";
  provider: OAuthProvider;
  providerAccountId: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  redirectTo: string;
}

const PROVIDERS: OAuthProvider[] = ["google", "github"];

export function isOAuthProvider(value: string): value is OAuthProvider {
  return PROVIDERS.includes(value as OAuthProvider);
}

export function getClientUrl() {
  return process.env.CLIENT_URL || "http://localhost:5173";
}

export function getProviderConfig(provider: OAuthProvider) {
  if (provider === "google") {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackUrl =
      process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback";
    if (!clientId || !clientSecret) return null;
    return { clientId, clientSecret, callbackUrl };
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const callbackUrl =
    process.env.GITHUB_CALLBACK_URL || "http://localhost:3000/api/auth/github/callback";
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret, callbackUrl };
}

export function createOAuthState(provider: OAuthProvider, redirectTo: string) {
  const nonce = crypto.randomBytes(16).toString("hex");
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const payload: OAuthStatePayload = {
    type: "oauth_state",
    provider,
    state: nonce,
    codeVerifier,
    redirectTo: sanitizeRedirect(redirectTo),
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "10m" });
  return { stateToken: token, codeVerifier };
}

export function verifyOAuthState(token: string) {
  const payload = jwt.verify(token, JWT_SECRET) as OAuthStatePayload;
  if (payload.type !== "oauth_state" || !isOAuthProvider(payload.provider) || !payload.state) {
    throw new Error("Estado OAuth inválido");
  }
  return payload;
}

export function createPendingLink(profile: OAuthProfile, redirectTo: string) {
  const payload: PendingLinkPayload = {
    type: "oauth_link",
    provider: profile.provider,
    providerAccountId: profile.providerAccountId,
    email: profile.email.toLowerCase(),
    name: profile.name,
    avatarUrl: profile.avatarUrl ?? null,
    redirectTo: sanitizeRedirect(redirectTo),
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "10m" });
}

export function verifyPendingLink(token: string) {
  const payload = jwt.verify(token, JWT_SECRET) as PendingLinkPayload;
  if (payload.type !== "oauth_link" || !isOAuthProvider(payload.provider)) {
    throw new Error("Token de vinculación inválido");
  }
  return payload;
}

export function sanitizeRedirect(value?: string | null) {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export function buildAuthorizationUrl(provider: OAuthProvider, stateToken: string, codeVerifier: string) {
  const config = getProviderConfig(provider);
  if (!config) throw new Error(`Proveedor ${provider} no configurado`);

  if (provider === "google") {
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", config.clientId);
    url.searchParams.set("redirect_uri", config.callbackUrl);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", stateToken);
    url.searchParams.set("code_challenge", pkceChallenge(codeVerifier));
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("access_type", "online");
    url.searchParams.set("prompt", "select_account");
    return url.toString();
  }

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.callbackUrl);
  url.searchParams.set("scope", "read:user user:email");
  url.searchParams.set("state", stateToken);
  return url.toString();
}

function pkceChallenge(verifier: string) {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

async function fetchJson<T>(url: string, init: RequestInit) {
  const res = await fetch(url, init);
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const message =
      (data && (data.error_description || data.error || data.message)) ||
      `HTTP ${res.status}`;
    throw new Error(String(message));
  }
  return data as T;
}

export async function exchangeCodeForProfile(
  provider: OAuthProvider,
  code: string,
  codeVerifier?: string
): Promise<OAuthProfile> {
  if (provider === "google") return exchangeGoogle(code, codeVerifier);
  return exchangeGitHub(code);
}

async function exchangeGoogle(code: string, codeVerifier?: string): Promise<OAuthProfile> {
  const config = getProviderConfig("google");
  if (!config) throw new Error("Google no configurado");

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: config.callbackUrl,
    code_verifier: codeVerifier || "",
  });

  const token = await fetchJson<{ access_token: string }>("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body,
  });

  const profile = await fetchJson<{
    sub: string;
    email: string;
    email_verified: boolean;
    name?: string;
    picture?: string;
  }>("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}`, Accept: "application/json" },
  });

  if (!profile.email || !profile.email_verified) {
    throw new Error("El correo de Google no está verificado");
  }

  return {
    provider: "google",
    providerAccountId: String(profile.sub),
    email: profile.email.toLowerCase(),
    emailVerified: true,
    name: profile.name?.trim() || profile.email.split("@")[0],
    avatarUrl: profile.picture ?? null,
  };
}

async function exchangeGitHub(code: string): Promise<OAuthProfile> {
  const config = getProviderConfig("github");
  if (!config) throw new Error("GitHub no configurado");

  const token = await fetchJson<{ access_token: string }>(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.callbackUrl,
      }),
    }
  );

  const headers = {
    Authorization: `Bearer ${token.access_token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "estante-app",
  };

  const profile = await fetchJson<{
    id: number;
    login: string;
    name?: string | null;
    avatar_url?: string | null;
  }>("https://api.github.com/user", { headers });

  const emails = await fetchJson<
    Array<{ email: string; primary: boolean; verified: boolean; visibility: string | null }>
  >("https://api.github.com/user/emails", { headers });

  const primary = emails.find((e) => e.primary && e.verified) || emails.find((e) => e.verified);
  if (!primary?.email) {
    throw new Error("No se encontró un correo verificado en GitHub");
  }

  return {
    provider: "github",
    providerAccountId: String(profile.id),
    email: primary.email.toLowerCase(),
    emailVerified: true,
    name: (profile.name || profile.login || primary.email.split("@")[0]).trim(),
    avatarUrl: profile.avatar_url ?? null,
  };
}
