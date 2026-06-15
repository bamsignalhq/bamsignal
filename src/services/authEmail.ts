import { apiUrl } from "./supabase";

type SendCodeResponse = { ok: boolean; email?: string; error?: string };
type VerifyCodeResponse = { ok: boolean; email?: string; error?: string };

async function parseJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("network");
  }
  return response.json() as Promise<T>;
}

export async function sendSignupEmailCode(email: string, name: string): Promise<SendCodeResponse> {
  const response = await fetch(apiUrl("/api/auth/email-code"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "send", email, name })
  });
  const data = await parseJson<SendCodeResponse>(response);
  if (!response.ok || !data.ok) {
    throw new Error(data.error || "send_failed");
  }
  return data;
}

export async function verifySignupEmailCode(input: {
  email: string;
  code: string;
  password: string;
  name: string;
  username: string;
  phone: string;
}): Promise<VerifyCodeResponse> {
  const response = await fetch(apiUrl("/api/auth/email-code"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "verify", ...input })
  });
  const data = await parseJson<VerifyCodeResponse>(response);
  if (!response.ok || !data.ok) {
    throw new Error(data.error || "verify_failed");
  }
  return data;
}
