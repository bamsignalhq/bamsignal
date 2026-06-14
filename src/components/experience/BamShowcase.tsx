import { useEffect, useRef, useState } from "react";
import { AppLogo } from "../AppLogo";
import { BamEffect } from "../signals/BamEffect";

export function BamShowcase() {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [firing, setFiring] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let timeout: number;
    const loop = () => {
      setFiring(true);
      timeout = window.setTimeout(() => {
        setFiring(false);
        timeout = window.setTimeout(loop, 2400);
      }, 1100);
    };
    timeout = window.setTimeout(loop, 600);
    return () => window.clearTimeout(timeout);
  }, [inView]);

  return (
    <section className="world-bam" ref={ref}>
      <div className="world-bam-stage">
        <div className={`world-bam-logo ${firing ? "world-bam-logo--pulse" : ""}`}>
          <AppLogo size="lg" showText={false} />
        </div>
        <BamEffect active={firing} className="world-bam-effect" />
        <p className="world-bam-tag">The BAM effect</p>
        <p className="world-bam-line">When you send a signal, they feel it.</p>
      </div>
    </section>
  );
}
