import { Preloader } from "../components/Preloader";

type LazyRouteFallbackProps = {
  subtitle?: string;
};

/** Lightweight suspense shell for code-split routes — no member UI redesign. */
export function LazyRouteFallback({ subtitle = "Loading…" }: LazyRouteFallbackProps) {
  return <Preloader exiting={false} subtitle={subtitle} />;
}
