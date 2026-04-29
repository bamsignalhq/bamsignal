import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronDown,
  Goal,
  Instagram,
  Menu,
  Moon,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Trophy,
  Twitter,
  X
} from "lucide-react";
import "./styles.css";

type Theme = "dark" | "light";

type Fixture = {
  id: number;
  league: string;
  country: string;
  time: string;
  home: string;
  away: string;
  pick: string;
  confidence: number;
  result: string;
  btts: number;
  over25: number;
  corners: number;
  score: string;
  status: "Live" | "Today" | "Tomorrow";
};

const fixtures: Fixture[] = [
  {
    id: 1,
    league: "Champions League",
    country: "Europe",
    time: "19:00",
    home: "Paris SG",
    away: "Bayern Munich",
    pick: "Over 1.5 goals",
    confidence: 86,
    result: "Away or draw",
    btts: 65,
    over25: 61,
    corners: 88,
    score: "1-2",
    status: "Today"
  },
  {
    id: 2,
    league: "Championship",
    country: "England",
    time: "18:45",
    home: "Southampton",
    away: "Ipswich Town",
    pick: "Home over 0.5",
    confidence: 73,
    result: "Home win",
    btts: 54,
    over25: 49,
    corners: 95,
    score: "2-1",
    status: "Today"
  },
  {
    id: 3,
    league: "La Liga",
    country: "Spain",
    time: "20:00",
    home: "Espanyol",
    away: "Real Madrid",
    pick: "Away double chance",
    confidence: 77,
    result: "Away win",
    btts: 51,
    over25: 52,
    corners: 91,
    score: "1-2",
    status: "Tomorrow"
  },
  {
    id: 4,
    league: "Serie A",
    country: "Italy",
    time: "16:30",
    home: "Roma",
    away: "Atalanta",
    pick: "Both teams to score",
    confidence: 68,
    result: "Draw",
    btts: 71,
    over25: 58,
    corners: 79,
    score: "1-1",
    status: "Live"
  },
  {
    id: 5,
    league: "Bundesliga",
    country: "Germany",
    time: "14:30",
    home: "Dortmund",
    away: "Leipzig",
    pick: "Over 2.5 goals",
    confidence: 74,
    result: "Home or draw",
    btts: 69,
    over25: 76,
    corners: 83,
    score: "2-2",
    status: "Tomorrow"
  }
];

const markets = [
  "Fulltime result",
  "First half winner",
  "Double chance",
  "Correct score",
  "Both teams to score",
  "Over/under goals",
  "Team goals",
  "Corners"
];

const leagues = [
  "Premier League",
  "La Liga",
  "Serie A",
  "Bundesliga",
  "Champions League",
  "Europa League"
];

const faq = [
  {
    question: "How does BamSignal create football predictions?",
    answer:
      "BamSignal models team form, head-to-head history, league position, venue strength, scoring trends, and market movement to turn each fixture into clear probability ranges."
  },
  {
    question: "Which betting markets are covered?",
    answer:
      "The dashboard covers fulltime result, first-half result, double chance, correct score, both teams to score, over/under goals, team goals, and corners."
  },
  {
    question: "When are predictions posted?",
    answer:
      "Sample fixtures are shown for today and tomorrow. In production, BamSignal can refresh daily and update during live matches as new match context arrives."
  },
  {
    question: "Is BamSignal a bookmaker?",
    answer:
      "No. BamSignal is an analytics and prediction product. It does not place bets or guarantee outcomes."
  }
];

function App() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState<Fixture["status"] | "All">("All");
  const logoSrc = theme === "dark" ? "/brand/logo-dark.jpg" : "/brand/logo-light.jpg";

  useEffect(() => {
    const favicon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (favicon) {
      favicon.href = theme === "dark" ? "/favicon-dark.png" : "/favicon-light.png";
    }
    document.querySelector("meta[name='theme-color']")?.setAttribute(
      "content",
      theme === "dark" ? "#101923" : "#f5f7fb"
    );
  }, [theme]);

  const filteredFixtures = useMemo(() => {
    if (activeStatus === "All") return fixtures;
    return fixtures.filter((fixture) => fixture.status === activeStatus);
  }, [activeStatus]);

  const topPick = fixtures.reduce((best, fixture) =>
    fixture.confidence > best.confidence ? fixture : best
  );

  return (
    <div className={`app ${theme}`}>
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="brand">
          <img className="brand-logo" src={logoSrc} alt="BamSignal logo" />
          <div>
            <strong>BamSignal</strong>
            <span>AI football edge</span>
          </div>
        </div>
        <nav>
          <a href="#predictions">
            <Goal size={18} /> Football Predictions
          </a>
          <a href="#tips">
            <Sparkles size={18} /> Betting Tips
          </a>
          <a href="#leagues">
            <Trophy size={18} /> Leagues
          </a>
          <a href="#markets">
            <BarChart3 size={18} /> Markets
          </a>
          <a href="#apps">
            <Smartphone size={18} /> iOS & Android
          </a>
          <a href="#faq">
            <ShieldCheck size={18} /> FAQs
          </a>
        </nav>
        <div className="sidebar-card">
          <span>Sure Signal</span>
          <strong>{topPick.confidence}%</strong>
          <p>
            {topPick.home} vs {topPick.away}: {topPick.pick}
          </p>
        </div>
      </aside>

      <div className="shell">
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div>
            <p className="eyebrow">Daily AI football predictions</p>
            <h1><img className="topbar-logo" src={logoSrc} alt="" /> BamSignal</h1>
          </div>
          <button className="theme-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </header>

        <main>
          <section className="hero">
            <div className="hero-copy">
              <p className="eyebrow">Football predictions</p>
              <h2>AI predictions for today's matches</h2>
              <p>
                BamSignal scans fixtures, team form, goals, corners, and market strength to show compact probability picks for each match.
              </p>
              <div className="hero-actions">
                <a className="primary-action" href="#predictions">View Predictions</a>
                <a className="secondary-action" href="#apps">Get the Apps</a>
              </div>
            </div>
            <div className="signal-panel" aria-label="Top prediction">
              <div className="panel-topline">
                <span>{topPick.league}</span>
                <strong>{topPick.time}</strong>
              </div>
              <div className="teams">
                <span>{topPick.home}</span>
                <small>vs</small>
                <span>{topPick.away}</span>
              </div>
              <div className="compact-pick">
                <strong>{topPick.confidence}%</strong>
                <span>{topPick.pick}</span>
              </div>
              <div className="mini-grid">
                <span>BTTS <strong>{topPick.btts}%</strong></span>
                <span>O2.5 <strong>{topPick.over25}%</strong></span>
                <span>Corners <strong>{topPick.corners}%</strong></span>
              </div>
            </div>
          </section>

          <section className="stats-strip">
            <Stat icon={<Activity size={20} />} label="Average model hit rate" value="75%" />
            <Stat icon={<CalendarDays size={20} />} label="Prediction horizon" value="14 days" />
            <Stat icon={<BarChart3 size={20} />} label="Tracked markets" value="8+" />
            <Stat icon={<Trophy size={20} />} label="Covered competitions" value="25+" />
          </section>

          <section className="content-grid" id="predictions">
            <div className="section-head">
              <div>
                <p className="eyebrow">Football predictions</p>
                <h2>Today's BamSignal picks</h2>
              </div>
              <div className="segmented">
                {["All", "Live", "Today", "Tomorrow"].map((status) => (
                  <button
                    key={status}
                    className={activeStatus === status ? "active" : ""}
                    onClick={() => setActiveStatus(status as Fixture["status"] | "All")}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <div className="fixture-list">
              {filteredFixtures.map((fixture) => (
                <FixtureCard key={fixture.id} fixture={fixture} />
              ))}
            </div>
          </section>

          <section className="two-column" id="tips">
            <div className="info-panel">
              <p className="eyebrow">Betting tips</p>
              <h2>Find the green edge faster.</h2>
              <p>
                BamSignal highlights the strongest probability differences, so a clear favorite or safer total-goals angle is easier to spot without opening every match.
              </p>
              <div className="tip-row"><strong>Best pick</strong><span>{topPick.pick}</span></div>
              <div className="tip-row"><strong>Correct score lean</strong><span>{topPick.score}</span></div>
              <div className="tip-row"><strong>Safer market</strong><span>Double chance and over 1.5</span></div>
            </div>
            <div className="info-panel" id="markets">
              <p className="eyebrow">Markets</p>
              <h2>Every fixture, multiple angles.</h2>
              <div className="chip-cloud">
                {markets.map((market) => <span key={market}>{market}</span>)}
              </div>
            </div>
          </section>

          <section className="league-band" id="leagues">
            <div>
              <p className="eyebrow">League coverage</p>
              <h2>European football focus with room to expand.</h2>
            </div>
            <div className="league-grid">
              {leagues.map((league) => <span key={league}>{league}</span>)}
            </div>
          </section>

          <section className="apps-band" id="apps">
            <div>
              <p className="eyebrow">Mobile apps</p>
              <h2>BamSignal for iOS and Android</h2>
              <p>
                This project includes Capacitor configuration so the same prediction dashboard can be synced into native iOS and Android projects.
              </p>
            </div>
            <div className="app-buttons">
              <button aria-label="Download on the App Store">
                <img src="/app-store-badge.svg" alt="Download on the App Store" />
              </button>
              <button aria-label="Get it on Google Play">
                <img src="/google-play-badge.svg" alt="Get it on Google Play" />
              </button>
            </div>
          </section>

          <section className="two-column" id="faq">
            <div className="info-panel">
              <p className="eyebrow">FAQs</p>
              <h2>Common questions</h2>
              <div className="accordion-list">
                {faq.map((item) => <FaqItem key={item.question} {...item} />)}
              </div>
            </div>
            <div className="info-panel contact-panel">
              <p className="eyebrow">Contact</p>
              <h2>Talk to BamSignal</h2>
              <a href="https://twitter.com/bamsignal"><Twitter size={18} /> @bamsignal</a>
              <a href="https://instagram.com/bamsignal"><Instagram size={18} /> @bamsignal</a>
              <p className="responsible">
                Please gamble responsibly. BamSignal is an informational prediction tool and does not guarantee betting outcomes.
              </p>
            </div>
          </section>
        </main>

        <footer>
          <strong>BamSignal</strong>
          <span>Responsible analytics for football fans. Copyright 2026 BamSignal</span>
        </footer>
      </div>

      {menuOpen && (
        <>
          <button className="scrim" onClick={() => setMenuOpen(false)} aria-label="Dismiss menu backdrop" />
          <button className="close-menu" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X size={22} />
          </button>
        </>
      )}
    </div>
  );
}

function FixtureCard({ fixture }: { fixture: Fixture }) {
  return (
    <article className="fixture-card">
      <div className="fixture-main">
        <div>
          <span className={`status ${fixture.status.toLowerCase()}`}>{fixture.status}</span>
          <p className="league">{fixture.league} / {fixture.country} / {fixture.time}</p>
          <h3>{fixture.home} <small>vs</small> {fixture.away}</h3>
        </div>
        <div className="confidence-pill">{fixture.confidence}%</div>
      </div>
      <div className="prediction-row">
        <span>Primary pick</span>
        <strong>{fixture.pick}</strong>
      </div>
      <div className="probability-grid">
        <Probability label="Result" value={fixture.result} percent={fixture.confidence} />
        <Probability label="BTTS" value="Yes" percent={fixture.btts} />
        <Probability label="Over 2.5" value="Yes" percent={fixture.over25} />
        <Probability label="Corners 4+" value="Yes" percent={fixture.corners} />
      </div>
    </article>
  );
}

function Probability({ label, value, percent }: { label: string; value: string; percent: number }) {
  return (
    <div className="probability">
      <span>{label}</span>
      <strong>{value}</strong>
      <div className="bar"><i style={{ width: `${percent}%` }} /></div>
      <small>{percent}%</small>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="stat">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button className={`faq-item ${open ? "open" : ""}`} onClick={() => setOpen(!open)}>
      <span>{question}<ChevronDown size={18} /></span>
      {open && <p>{answer}</p>}
    </button>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
