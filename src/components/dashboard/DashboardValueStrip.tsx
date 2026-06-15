const MEMBER_BENEFITS = [
  { icon: "✨", text: "Discover people who share your interests" },
  { icon: "🛡️", text: "Verified members and safer conversations" },
  { icon: "📍", text: "Meet people in Lagos, Abuja, Port Harcourt and beyond" },
  { icon: "❤️", text: "Build real connections at your own pace" }
] as const;

export function DashboardValueStrip() {
  return (
    <section className="dash-value card dash-animate" aria-label="Why BamSignal">
      <ul className="dash-value__list">
        {MEMBER_BENEFITS.map((item) => (
          <li key={item.text}>
            <span className="dash-value__icon" aria-hidden>
              {item.icon}
            </span>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
