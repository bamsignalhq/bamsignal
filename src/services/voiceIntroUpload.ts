import { USER_MESSAGES } from "../constants/userMessages";
import { apiUrl, supabase } from "./supabase";
import { audioBlobToDataUrl } from "../utils/voiceRecording";
import { readResponseJson } from "../utils/httpJson";

async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (!supabase) return headers;

  let session = (await supabase.auth.getSession()).data.session;
  if (!session?.access_token) {
    const refreshed = await supabase.auth.refreshSession();
    session = refreshed.data.session;
  }

  const token = session?.access_token;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export type VoiceIntroUploadResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

export async function uploadVoiceIntroBlob(blob: Blob, mimeType: string): Promise<VoiceIntroUploadResult> {
  try {
    const audioBase64 = await audioBlobToDataUrl(blob, mimeType);

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const response = await fetch(apiUrl("/api/member/voice?action=upload"), {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({ audioBase64 })
      });
      const payload = await readResponseJson<{
        ok?: boolean;
        url?: string;
        error?: string;
        storageUnavailable?: boolean;
      }>(response);

      if (response.status === 401 && attempt === 0 && supabase) {
        await supabase.auth.refreshSession();
        continue;
      }

      if (!response.ok || !payload?.ok || !payload.url) {
        return {
          ok: false,
          message: payload?.error || USER_MESSAGES.voiceIntroSaveFailed
        };
      }

      return { ok: true, url: payload.url };
    }

    return { ok: false, message: USER_MESSAGES.voiceIntroSaveFailed };
  } catch {
    return { ok: false, message: USER_MESSAGES.voiceIntroSaveFailed };
  }
}
