import { getLaunchConfig } from "../../utils/launchConfig";

/** Hidden until admin enables and real stories are added */
export function SocialProofSection() {
  const config = getLaunchConfig();
  if (!config.socialProofEnabled) return null;

  return (
    <section className="social-proof home-section" aria-label="Success stories">
      <p className="home-section__eyebrow">Real stories</p>
      <h2>Signal Stories</h2>
      <p className="home-section__lede">
        Success stories will appear here as members share their experiences. We never use fake
        testimonials.
      </p>
    </section>
  );
}
