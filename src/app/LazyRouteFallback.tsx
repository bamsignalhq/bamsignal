import { Preloader } from "../components/Preloader";

type LazyRouteFallbackProps = {
  subtitle?: string;
};

/** Lightweight suspense shell for code-split routes — progress only, no marketing copy. */
export function LazyRouteFallback({ subtitle = "Loading…" }: LazyRouteFallbackProps) {
  return <Preloader exiting={false} variant="minimal" subtitle={subtitle} />;
}
