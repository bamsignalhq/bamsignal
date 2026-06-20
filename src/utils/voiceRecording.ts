export const MIN_VOICE_SECONDS = 3;
export const MAX_VOICE_SECONDS = 30;

const PREFERRED_AUDIO_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/aac",
  "audio/ogg;codecs=opus",
  "audio/wav"
] as const;

export function getSupportedVoiceMimeType(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  for (const type of PREFERRED_AUDIO_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return null;
}

export function isVoiceRecordingSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== "undefined" &&
    getSupportedVoiceMimeType() !== null
  );
}

export function audioBlobToDataUrl(blob: Blob, mimeType: string): Promise<string> {
  const typed = blob.type === mimeType ? blob : new Blob([blob], { type: mimeType });
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      if (result.startsWith("data:audio/")) {
        resolve(result);
        return;
      }
      const comma = result.indexOf(",");
      if (comma > 0) {
        resolve(`data:${mimeType};base64,${result.slice(comma + 1)}`);
        return;
      }
      reject(new Error("VOICE_ENCODE_FAILED"));
    };
    reader.onerror = () => reject(new Error("VOICE_ENCODE_FAILED"));
    reader.readAsDataURL(typed);
  });
}

export function micPermissionMessage(error: unknown): string | null {
  if (!(error instanceof DOMException)) return null;
  if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
    return "Microphone access is needed to record your voice intro.";
  }
  return null;
}
