import { useCallback, useEffect, useRef, useState } from "react";
import { MemberToast, type MemberToastTone } from "../components/member/MemberToast";

type ToastOptions = {
  tone?: MemberToastTone;
  duration?: number;
};

export function useMemberToast(defaultDuration = 2800) {
  const [state, setState] = useState<{ message: string; tone: MemberToastTone } | null>(null);
  const timerRef = useRef<number>();

  const dismissToast = useCallback(() => {
    window.clearTimeout(timerRef.current);
    setState(null);
  }, []);

  const showToast = useCallback(
    (message: string, options?: ToastOptions) => {
      if (!message.trim()) return;
      window.clearTimeout(timerRef.current);
      const tone = options?.tone ?? "default";
      setState({ message: message.trim(), tone });
      timerRef.current = window.setTimeout(dismissToast, options?.duration ?? defaultDuration);
    },
    [defaultDuration, dismissToast]
  );

  useEffect(
    () => () => {
      window.clearTimeout(timerRef.current);
    },
    []
  );

  function ToastHost() {
    if (!state) return null;
    return <MemberToast message={state.message} tone={state.tone} onDismiss={dismissToast} />;
  }

  return { showToast, dismissToast, ToastHost, toastMessage: state?.message ?? null };
}
