/** Parse JSON response bodies without swallowing failures silently. */
export async function readResponseJson<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return null;
  }
  try {
    return (await response.json()) as T;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("[bamsignal] response JSON parse failed", error);
    }
    return null;
  }
}
