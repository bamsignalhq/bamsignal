import { ArrowLeft, Crown, Sparkles, Zap } from "lucide-react";
import type { PremiumPlan } from "../constants/plans";
import { PREMIUM_FEATURES } from "../constants/plans";

type PremiumPageProps = {
  isPremium: boolean;
  plans: PremiumPlan[];
  onBack: () => void;
  onSelectPlan: (plan: PremiumPlan) => void;
  loading?: boolean;
};

const BENEFITS = [
  { icon: "⚡", title: "Unlimited Signals", body: "Send as many signals as you want — no daily cap." },
  { icon: "👀", title: "Profile Visitors", body: "See exactly who viewed your profile and when." },
  { icon: "🎯", title: "Advanced Filters", body: "Religion, lifestyle, voice intro, compatibility % & more." },
  { icon: "📈", title: "Priority Placement", body: "Rank higher in Discover when profiles are matched." },
  { icon: "✓", title: "Read Receipts", body: "Know when your messages have been seen." },
  { icon: "🚀", title: "Priority Signals", body: "Your signal lands first in their inbox." },
  { icon: "✨", title: "Better Discover Ranking", body: "Intelligent sorting puts you in front of the right people." }
] as const;

export function PremiumPage({ isPremium, plans, onBack, onSelectPlan, loading }: PremiumPageProps) {
  const featured = plans.find((p) => p.id === "monthly") ?? plans[0];

  return (
    <div className="page premium-page">
      <header className="premium-page__head">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <div>
          <span className="premium-page__eyebrow">Signal Pass</span>
          <h1>Premium that feels intentional</h1>
          <p>Unlock visibility, intelligence, and control — built for real connections.</p>
        </div>
      </header>

      {isPremium ? (
        <section className="premium-page__active card">
          <Crown size={28} aria-hidden />
          <h2>You&apos;re on Signal Pass</h2>
          <p>All premium benefits are active on your account.</p>
        </section>
      ) : (
        <section className="premium-page__hero card">
          <Sparkles className="premium-page__hero-icon" size={32} aria-hidden />
          <h2>Upgrade your signal</h2>
          <p>Like the best fintech apps — simple cards, clear value, no clutter.</p>
          {featured && (
            <button
              type="button"
              className="btn-primary btn-full premium-page__cta"
              disabled={loading}
              onClick={() => onSelectPlan(featured)}
            >
              <Zap size={18} fill="currentColor" />
              Get {featured.name} · {featured.priceLabel}
            </button>
          )}
        </section>
      )}

      <section className="premium-page__benefits" aria-label="Signal Pass benefits">
        {BENEFITS.map((benefit) => (
          <article key={benefit.title} className="premium-benefit card">
            <span className="premium-benefit__icon" aria-hidden>
              {benefit.icon}
            </span>
            <div>
              <h3>{benefit.title}</h3>
              <p>{benefit.body}</p>
            </div>
          </article>
        ))}
      </section>

      {!isPremium && (
        <section className="premium-page__plans">
          <h2>Choose your pass</h2>
          <div className="premium-plan-cards">
            {plans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                className={`premium-plan-card card ${plan.highlight ? "premium-plan-card--featured" : ""}`}
                disabled={loading}
                onClick={() => onSelectPlan(plan)}
              >
                {plan.highlight && <span className="premium-plan-card__badge">Popular</span>}
                <strong>{plan.name}</strong>
                <span className="premium-plan-card__price">{plan.priceLabel}</span>
                <span className="premium-plan-card__days">{plan.days} days</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <ul className="premium-page__fineprint">
        {PREMIUM_FEATURES.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
