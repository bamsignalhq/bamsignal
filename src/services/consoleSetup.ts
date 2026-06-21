import { apiUrl } from "./supabase";
import { readResponseJson } from "../utils/httpJson";

type SetupStatus = { ok: boolean; needsSetup?: boolean; error?: string };
type SetupCreateResult = { ok: boolean; email?: string; created?: boolean; error?: string };

export async function fetchConsoleSetupStatus(): Promise<boolean> {
  try {
    const response = await fetch(apiUrl("/api/hard/setup?action=status"));
    const payload = await readResponseJson<SetupStatus>(response);
    return Boolean(response.ok && payload?.needsSetup);
  } catch {
    return false;
  }
}

export async function createConsoleAccess(input: {
  email: string;
  password: string;
  confirmPassword: string;
  setupSecret: string;
}): Promise<SetupCreateResult> {
  try {
    const { setupSecret, ...body } = input;
    const response = await fetch(apiUrl("/api/hard/setup?action=create"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-setup-secret": setupSecret
      },
      body: JSON.stringify(body)
    });
    const payload = await readResponseJson<SetupCreateResult>(response);
    if (!response.ok || !payload?.ok) {
      return { ok: false, error: payload?.error || "Setup failed." };
    }
    return payload;
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Setup failed." };
  }
}
