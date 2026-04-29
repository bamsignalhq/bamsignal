import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  CalendarClock,
  ChevronDown,
  ClipboardCheck,
  CreditCard,
  Crown,
  Goal,
  Instagram,
  LockKeyhole,
  Menu,
  MessageCircle,
  Moon,
  Music2,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Trophy,
  Twitter,
  UserPlus,
  Users,
  X,
  Youtube
} from "lucide-react";
import "./styles.css";

type Theme = "dark" | "light";
type Page = { kind: "home" } | { kind: "market"; slug: string } | { kind: "league"; slug: string };

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

type Evidence = {
  match: string;
  pick: string;
  odds: string;
  result: string;
  status: "Won" | "Lost";
  tier: "Free" | "VIP";
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

const evidenceBoard: Evidence[] = [
  {
    match: "Arsenal vs Wolves",
    pick: "Arsenal over 1.5 team goals",
    odds: "1.62",
    result: "2-0",
    status: "Won",
    tier: "Free"
  },
  {
    match: "Inter Milan vs Torino",
    pick: "Inter win or draw + over 1.5",
    odds: "1.78",
    result: "3-1",
    status: "Won",
    tier: "VIP"
  },
  {
    match: "Real Sociedad vs Valencia",
    pick: "Under 3.5 goals",
    odds: "1.39",
    result: "1-1",
    status: "Won",
    tier: "Free"
  },
  {
    match: "Dortmund vs Freiburg",
    pick: "Both teams to score",
    odds: "1.71",
    result: "1-0",
    status: "Lost",
    tier: "VIP"
  },
  {
    match: "PSG vs Lille",
    pick: "PSG over 0.5 first half",
    odds: "1.55",
    result: "2-1",
    status: "Won",
    tier: "VIP"
  }
];

const freemiumGames = fixtures.slice(0, 2);
const premiumGames = [
  { match: "Man City vs Tottenham", pick: "Home win + over 1.5", odds: "2.18", confidence: 82 },
  { match: "Barcelona vs Villarreal", pick: "Barcelona team over 1.5", odds: "1.94", confidence: 79 },
  { match: "Bayer Leverkusen vs Mainz", pick: "Home win and BTTS", odds: "2.42", confidence: 76 }
];

const adminPlan = [
  "Publish Free Sure Game to app, Telegram channel, and WhatsApp channel",
  "Publish VIP high-odd games to premium app room and Telegram VIP group",
  "Schedule match reminders and result proof updates",
  "Track affiliate booking-code clicks and channel delivery status"
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

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const marketDetails = [
  {
    name: "Fulltime result",
    slug: "fulltime-result",
    intro: "Fulltime result predictions explain the classic 1X2 market: home win, draw, or away win after 90 minutes plus stoppage time.",
    sections: [
      "What it means: this is the simplest football market. If Arsenal play Chelsea, a fulltime result pick asks whether Arsenal win, Chelsea win, or the game ends level. It does not care about goals, corners, cards, or who scores first.",
      "How to read it: beginners should compare team quality, recent form, home advantage, injuries, motivation, and fixture pressure. A strong favorite with fresh players at home is different from a famous club rotating after a European night.",
      "How BamSignal applies it: the model weighs form, venue strength, table pressure, head-to-head context, scoring and conceding trends, and price movement. Use it when the match story is clear and the odds still offer reasonable value."
    ]
  },
  {
    name: "First half winner",
    slug: "first-half-winner",
    intro: "First half winner predictions focus only on which team leads at halftime, making early tempo and starting intensity more important than the final score.",
    sections: [
      "What it means: the bet is settled after the first 45 minutes plus first-half stoppage time. A team can win the first half and still fail to win the match, so this market needs a different mindset from fulltime result.",
      "How to read it: look for teams that start fast, press early, score many first-half goals, or face opponents that concede early. Also check whether a favorite may manage energy slowly before growing into the game.",
      "How BamSignal applies it: the signal studies first-half goal timing, early shot pressure, lineup strength, schedule fatigue, and home crowd effect. It is useful for aggressive teams, derby momentum, and mismatches where the favorite usually begins quickly."
    ]
  },
  {
    name: "Double chance",
    slug: "double-chance",
    intro: "Double chance predictions reduce risk by covering two of the three possible fulltime outcomes: home or draw, away or draw, or home or away.",
    sections: [
      "What it means: instead of needing one exact match result, you protect two outcomes. Home or draw means the home team must avoid defeat. Away or draw means the away team must avoid defeat. Home or away means there must be no draw.",
      "How to read it: beginners use double chance when a team has a strong chance not to lose but the win price feels risky. It is common for away favorites, evenly matched games, and fixtures where a draw is very possible.",
      "How BamSignal applies it: the model checks defensive reliability, match control, recent losses, travel context, injury news, and draw frequency. It is one of the safest educational markets because it teaches probability management instead of chasing high odds."
    ]
  },
  {
    name: "Correct score",
    slug: "correct-score",
    intro: "Correct score predictions estimate the exact final score, such as 1-0, 1-1, 2-1, or 3-0. It is high risk and should be treated carefully.",
    sections: [
      "What it means: the final score must match your pick exactly. If the prediction is 2-1 and the game ends 2-0 or 3-1, the pick loses even if the stronger team wins.",
      "How to read it: beginners should first understand likely goal range. Low-event games often point toward 0-0, 1-0, or 1-1. Open games with attacking teams may support 2-1, 2-2, or 3-1 scorelines.",
      "How BamSignal applies it: the model studies expected goal bands, finishing form, defensive gaps, goalkeeper reliability, tactical style, and match importance. Correct score is best used as a small-stake value angle, not as the main plan."
    ]
  },
  {
    name: "Both teams to score",
    slug: "both-teams-to-score",
    intro: "Both teams to score predictions ask whether each side will score at least one goal before fulltime.",
    sections: [
      "What it means: BTTS Yes wins if both teams score. BTTS No wins if one or both teams fail to score. The final winner does not matter; a 1-1, 2-1, or 4-2 all count as Yes.",
      "How to read it: beginners should check whether both teams create chances regularly and whether either defense is unreliable. A strong attack facing a weak defense helps, but you still need the other team to score too.",
      "How BamSignal applies it: the model compares goal frequency, clean sheets, away scoring, defensive injuries, tactical openness, and game state. BTTS is especially useful in leagues and matchups where both teams attack rather than sit deep."
    ]
  },
  {
    name: "Over/under goals",
    slug: "over-under-goals",
    intro: "Over/under goals predictions estimate whether a match finishes above or below a goal line such as 1.5, 2.5, or 3.5 goals.",
    sections: [
      "What it means: Over 2.5 needs at least three goals. Under 2.5 needs two goals or fewer. The winning team does not matter; only the total number of goals matters.",
      "How to read it: beginners should check attacking form, defensive weakness, pace, fixture importance, and whether either team is likely to protect a result. Cup ties, relegation pressure, and second-leg situations can change the goal pattern.",
      "How BamSignal applies it: the model studies recent total goals, expected scoring range, shot volume, conversion quality, and tactical pressure. Lower lines like over 1.5 are usually safer than over 3.5, but the odds will normally be smaller."
    ]
  },
  {
    name: "Team goals",
    slug: "team-goals",
    intro: "Team goals predictions focus on how many goals one specific team is likely to score, independent of the opponent's total.",
    sections: [
      "What it means: a team over 0.5 goal pick means that team must score at least once. Team over 1.5 means the team must score two or more. Team under 1.5 means the team scores zero or one.",
      "How to read it: beginners should ask whether the team creates chances, whether key attackers start, and whether the opponent regularly concedes. A dominant favorite at home may be better for team goals than fulltime result if the win price is too low.",
      "How BamSignal applies it: the model checks team shot volume, striker availability, home scoring, opponent clean sheets, set-piece threat, and tactical mismatch. It is useful when one team's attack is clear but the final result has draw risk."
    ]
  },
  {
    name: "Corners",
    slug: "corners",
    intro: "Corners predictions estimate corner volume, often based on attacking pressure, wide play, blocked shots, and how teams defend their box.",
    sections: [
      "What it means: corner markets can cover total corners, team corners, first-half corners, or corner handicap. A corner happens when the defending team last touches the ball before it crosses the goal line outside the goal.",
      "How to read it: beginners should look for teams that cross often, attack through wide players, force saves, or dominate territory. Underdogs can also win corners if they counter quickly or chase the game late.",
      "How BamSignal applies it: the model studies average corners for and against, wing usage, shot pressure, possession territory, game state, and opponent defensive style. Corners can be valuable because they are driven by pressure, not only goals."
    ]
  }
];

const leagueDetails = [
  {
    name: "Premier League",
    slug: "premier-league",
    intro: "Premier League predictions need context because England's top division is fast, physical, commercially powerful, and packed with clubs that carry major domestic and European history.",
    sections: [
      "What makes it unique: the Premier League is known for speed, pressing, deep squads, intense crowds, and a high level of week-to-week competition. Smaller clubs can still trouble title contenders because the league has strong money, strong coaching, and very little room for lazy performances.",
      "Major clubs and trophies: Manchester United, Liverpool, Arsenal, Chelsea, Manchester City, Tottenham Hotspur, Aston Villa, Everton, Newcastle United, and others shape the league's history. Liverpool and Manchester United are giants domestically and in Europe. Chelsea and Manchester City have lifted the Champions League. Arsenal are famous for league titles and cup tradition. Aston Villa and Nottingham Forest are historic European champions, which matters when reading club culture and pressure.",
      "How beginners should apply it: do not judge Premier League games only by name value. Check injuries, rotation after Europe, home and away form, manager style, and whether the underdog has a set-piece or counterattack route. For betting education, double chance, over/under goals, both teams to score, and team goals are often easier to understand than chasing a famous club at short odds.",
      "BamSignal angle: Premier League predictions work best when data and match context agree. A top club may dominate possession, but if it faces schedule fatigue or a compact defensive side, the smarter signal may be corners, team goals, or over 1.5 rather than a risky fulltime result."
    ]
  },
  {
    name: "La Liga",
    slug: "la-liga",
    intro: "La Liga predictions require patience because Spanish football often mixes elite technical quality, tactical control, strong defensive structure, and moments of individual brilliance.",
    sections: [
      "What makes it unique: La Liga is historically technical and tactical. Many teams are comfortable slowing the tempo, protecting space, and controlling possession. That means some matches can be lower scoring than casual bettors expect, especially when mid-table or relegation teams prioritize defensive shape.",
      "Major clubs and trophies: Real Madrid are the record Champions League force and one of football's biggest trophy machines. Barcelona are famous for La Liga dominance, Champions League wins, and a possession identity that shaped modern football. Atletico Madrid have built a powerful domestic and European reputation through organization, intensity, and defensive discipline. Sevilla are deeply associated with Europa League success, while Valencia, Villarreal, Athletic Club, and Real Sociedad bring major domestic and European history.",
      "How beginners should apply it: separate reputation from match rhythm. Real Madrid and Barcelona may have star power, but a tight away match after Europe can become tactical. Atletico matches often require reading defensive discipline and game state. For novices, under/over goals, double chance, and team goals can be clearer than correct score unless the goal pattern is very obvious.",
      "BamSignal angle: La Liga signals should respect tempo, venue, squad rotation, and defensive quality. If a team controls games but does not always score heavily, a safer team goal line or double chance may be more useful than forcing a big-margin prediction."
    ]
  },
  {
    name: "Serie A",
    slug: "serie-a",
    intro: "Serie A predictions are about tactical detail, defensive organization, coaching matchups, and understanding when Italian games open up or stay controlled.",
    sections: [
      "What makes it unique: Serie A has a reputation for tactical intelligence. Teams often adjust shape carefully, protect central areas, and use set pieces, wing-backs, and structured pressing. Modern Serie A can still be high scoring, but the best reads come from understanding the tactical matchup.",
      "Major clubs and trophies: Juventus, AC Milan, Inter Milan, Roma, Lazio, Napoli, Fiorentina, Atalanta, and others define the league's identity. AC Milan and Inter Milan are European giants with Champions League tradition. Juventus are historically dominant domestically. Napoli have become a modern force with league-title prestige. Roma, Lazio, Parma, Sampdoria, and Fiorentina also carry important domestic or European stories that influence expectation and pressure.",
      "How beginners should apply it: look beyond the table. A team may be lower in the standings but tactically difficult. Check whether a side uses three centre-backs, wing-backs, direct transitions, or heavy possession. Both teams to score and over/under goals require careful attention to match style, not just attacking names.",
      "BamSignal angle: Serie A predictions should combine numbers with tactical sense. If two teams are organized and cautious, under goals or double chance may be more sensible. If both sides use aggressive wing play or concede from transitions, corners and BTTS become more interesting."
    ]
  },
  {
    name: "Bundesliga",
    slug: "bundesliga",
    intro: "Bundesliga predictions often involve tempo, transitions, attacking football, pressing, and goal-friendly patterns that can create strong over-goals and BTTS signals.",
    sections: [
      "What makes it unique: Germany's Bundesliga is known for attacking intent, pressing, vertical passing, and quick transitions. Many teams are brave with the ball, which can create open games, quick swings, and late goals. This makes goal markets very important for beginners to understand.",
      "Major clubs and trophies: Bayern Munich are the dominant German powerhouse and Champions League winners. Borussia Dortmund are famous for elite talent development, league titles, and European prestige. Bayer Leverkusen, RB Leipzig, Werder Bremen, Stuttgart, Hamburg, Borussia Monchengladbach, Schalke, and Eintracht Frankfurt all carry important domestic or European history. Frankfurt and Leverkusen have major European moments, while Dortmund and Bayern are globally recognized.",
      "How beginners should apply it: do not assume every Bundesliga game is automatically over 2.5, but do respect the league's attacking patterns. Check whether both teams press high, concede chances, and have available forwards. If a favorite is too short to back directly, team goals, over 1.5, BTTS, or corners may explain the game better.",
      "BamSignal angle: Bundesliga predictions are strongest when tempo data supports the eye test. High shot volume, aggressive full-backs, defensive injuries, and transition-heavy matchups often produce useful goal and corner signals."
    ]
  },
  {
    name: "Champions League",
    slug: "champions-league",
    intro: "Champions League predictions must respect elite quality, two-leg strategy, travel, rotation, and the pressure of Europe's biggest club competition.",
    sections: [
      "What makes it unique: the Champions League brings together Europe's strongest clubs, but the market is not only about famous names. Group stage matches, knockout first legs, second legs, away goals context no longer applying, travel, and squad depth all change how teams approach risk.",
      "Major clubs and trophies: Real Madrid are the competition's defining dynasty. AC Milan, Liverpool, Bayern Munich, Barcelona, Ajax, Inter Milan, Manchester United, Chelsea, Manchester City, Juventus, Benfica, Porto, Nottingham Forest, Aston Villa, Borussia Dortmund, Marseille, and others are part of European Cup and Champions League history. These clubs carry different levels of pressure, experience, and expectation when the anthem plays.",
      "How beginners should apply it: check the tie situation before picking. In a first leg, a team may avoid risk. In a second leg, the team behind may attack early, which can affect goals, corners, cards, and BTTS. Domestic league schedule also matters because elite clubs manage minutes carefully.",
      "BamSignal angle: Champions League predictions should combine club strength with competition behavior. The best signals often come from identifying whether a match will be controlled, chaotic, rotated, or desperate. That context can point to safer picks like double chance, over 1.5, team goals, or corners."
    ]
  },
  {
    name: "Europa League",
    slug: "europa-league",
    intro: "Europa League predictions are rich for value because the competition includes strong clubs, ambitious underdogs, difficult travel, and different levels of motivation.",
    sections: [
      "What makes it unique: the Europa League sits below the Champions League but often creates more unpredictable betting conditions. Clubs from major leagues meet teams from smaller leagues, and motivation can vary depending on domestic priorities, squad depth, and knockout position.",
      "Major clubs and trophies: Sevilla are the competition's modern kings and deeply associated with Europa League success. Atletico Madrid, Chelsea, Manchester United, Villarreal, Porto, Inter Milan, Juventus, Liverpool, Tottenham Hotspur, Eintracht Frankfurt, Bayer Leverkusen, Shakhtar Donetsk, Zenit, Feyenoord, Ajax, and others have important UEFA Cup or Europa League history. Knowing which clubs value European nights helps a beginner read motivation.",
      "How beginners should apply it: always check travel distance, rotation, league schedule, and whether the club needs the Europa League as a route to Champions League qualification. A famous team may rest players, while a smaller club may treat the match as the biggest night of the season.",
      "BamSignal angle: Europa League predictions often reward patient research. Look at lineup strength, venue difficulty, and tactical mismatch. Markets like double chance, team goals, over/under goals, and corners can be more practical than trusting reputation alone."
    ]
  }
];

function getInitialPage(): Page {
  const [, section, slug] = window.location.pathname.split("/");
  if (section === "markets" && slug) return { kind: "market", slug };
  if (section === "leagues" && slug) return { kind: "league", slug };
  return { kind: "home" };
}

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
  const [isAuthed, setIsAuthed] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [page, setPage] = useState<Page>(() => getInitialPage());
  const logoSrc = theme === "dark" ? "/brand/compact-logo-dark.jpg" : "/brand/compact-logo-light.jpg";

  const navigate = (nextPage: Page, path = "/") => {
    window.history.pushState(null, "", path);
    setPage(nextPage);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  useEffect(() => {
    const syncRoute = () => setPage(getInitialPage());
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

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
          <button className="brand-button" onClick={() => navigate({ kind: "home" })}>
            <img className="brand-logo" src={logoSrc} alt="BamSignal" />
          </button>
        </div>
        <nav>
          <a href="/#predictions" onClick={(event) => { event.preventDefault(); navigate({ kind: "home" }, "/#predictions"); }}>
            <Goal size={18} /> Football Predictions
          </a>
          <a href="/#tips" onClick={(event) => { event.preventDefault(); navigate({ kind: "home" }, "/#tips"); }}>
            <Sparkles size={18} /> Betting Tips
          </a>
          <a href="/#leagues" onClick={(event) => { event.preventDefault(); navigate({ kind: "home" }, "/#leagues"); }}>
            <Trophy size={18} /> Leagues
          </a>
          <a href="/#markets" onClick={(event) => { event.preventDefault(); navigate({ kind: "home" }, "/#markets"); }}>
            <BarChart3 size={18} /> Markets
          </a>
          <a href="/#apps" onClick={(event) => { event.preventDefault(); navigate({ kind: "home" }, "/#apps"); }}>
            <Smartphone size={18} /> iOS & Android
          </a>
          <a href="/#faq" onClick={(event) => { event.preventDefault(); navigate({ kind: "home" }, "/#faq"); }}>
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
          <button className="topbar-brand" onClick={() => navigate({ kind: "home" })} aria-label="Go to BamSignal home">
            <img className="topbar-logo" src={logoSrc} alt="BamSignal" />
          </button>
          <button className="theme-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
        </header>

        {page.kind === "home" ? <HomePage
          activeStatus={activeStatus}
          filteredFixtures={filteredFixtures}
          isAuthed={isAuthed}
          isPremium={isPremium}
          topPick={topPick}
          setActiveStatus={setActiveStatus}
          setIsAuthed={setIsAuthed}
          setIsPremium={setIsPremium}
          navigate={navigate}
        /> : <DetailPage page={page} navigate={navigate} />}

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

function HomePage({
  activeStatus,
  filteredFixtures,
  isAuthed,
  isPremium,
  topPick,
  setActiveStatus,
  setIsAuthed,
  setIsPremium,
  navigate
}: {
  activeStatus: Fixture["status"] | "All";
  filteredFixtures: Fixture[];
  isAuthed: boolean;
  isPremium: boolean;
  topPick: Fixture;
  setActiveStatus: (status: Fixture["status"] | "All") => void;
  setIsAuthed: (value: boolean) => void;
  setIsPremium: (value: boolean) => void;
  navigate: (page: Page, path?: string) => void;
}) {
  return (
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
              {filteredFixtures.map((fixture, index) => (
                <FixtureCard key={fixture.id} fixture={fixture} locked={index > 0} />
              ))}
            </div>
          </section>

          <section className="insight-stack" id="tips">
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
            <EvidenceBoard />
            <div className="info-panel markets-panel" id="markets">
              <p className="eyebrow">Markets</p>
              <h2>Every fixture, multiple angles.</h2>
              <div className="chip-cloud">
                {marketDetails.map((market) => (
                  <a
                    key={market.slug}
                    href={`/markets/${market.slug}`}
                    onClick={(event) => {
                      event.preventDefault();
                      navigate({ kind: "market", slug: market.slug }, `/markets/${market.slug}`);
                    }}
                  >
                    {market.name}
                    <ArrowRight size={14} />
                  </a>
                ))}
              </div>
            </div>
          </section>

          <AppExperience
            isAuthed={isAuthed}
            isPremium={isPremium}
            setIsAuthed={setIsAuthed}
            setIsPremium={setIsPremium}
          />

          <section className="league-band" id="leagues">
            <div>
              <p className="eyebrow">League coverage</p>
              <h2>European football focus with room to expand.</h2>
            </div>
            <div className="league-grid">
              {leagueDetails.map((league) => (
                <a
                  key={league.slug}
                  href={`/leagues/${league.slug}`}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate({ kind: "league", slug: league.slug }, `/leagues/${league.slug}`);
                  }}
                >
                  {league.name}
                  <ArrowRight size={14} />
                </a>
              ))}
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
              <div className="social-grid" aria-label="BamSignal social links">
                <a href="https://www.tiktok.com/@bamsignal" target="_blank" rel="noreferrer">
                  <Music2 size={18} />
                  <span>TikTok</span>
                  <small>@bamsignal</small>
                </a>
                <a href="https://www.instagram.com/officialbamsignal/" target="_blank" rel="noreferrer">
                  <Instagram size={18} />
                  <span>Instagram</span>
                  <small>@officialbamsignal</small>
                </a>
                <a href="https://x.com/bamsignalhq" target="_blank" rel="noreferrer">
                  <Twitter size={18} />
                  <span>X</span>
                  <small>@bamsignalhq</small>
                </a>
                <a href="https://www.youtube.com/@officialbamsignal" target="_blank" rel="noreferrer">
                  <Youtube size={18} />
                  <span>YouTube</span>
                  <small>@officialbamsignal</small>
                </a>
                <a href="https://t.me/officialbamsignal" target="_blank" rel="noreferrer">
                  <Send size={18} />
                  <span>Telegram</span>
                  <small>official channel</small>
                </a>
                <a href="https://whatsapp.com/channel/0029Vb7wB96DZ4LdE2Nhlp3A" target="_blank" rel="noreferrer">
                  <MessageCircle size={18} />
                  <span>WhatsApp</span>
                  <small>official channel</small>
                </a>
              </div>
              <p className="responsible">
                Please gamble responsibly. BamSignal is an informational prediction tool and does not guarantee betting outcomes.
              </p>
            </div>
          </section>
    </main>
  );
}

function EvidenceBoard() {
  const wins = evidenceBoard.filter((item) => item.status === "Won").length;
  const hitRate = Math.round((wins / evidenceBoard.length) * 100);

  return (
    <section className="evidence-board" aria-label="BamSignal evidence board">
      <div className="evidence-head">
        <div>
          <p className="eyebrow">Evidence board</p>
          <h2>Past games, clean results.</h2>
          <p>Use this board to audit BamSignal picks. Wins and losses stay visible so users can judge consistency before joining VIP.</p>
        </div>
        <div className="evidence-score">
          <strong>{hitRate}%</strong>
          <span>recent hit rate</span>
        </div>
      </div>
      <div className="evidence-list">
        {evidenceBoard.map((item) => (
          <article className="evidence-row" key={item.match}>
            <div>
              <span className={`result-dot ${item.status.toLowerCase()}`}>{item.status}</span>
              <h3>{item.match}</h3>
              <p>{item.pick}</p>
            </div>
            <div className="evidence-meta">
              <span>{item.tier}</span>
              <strong>{item.odds}</strong>
              <small>{item.result}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AppExperience({
  isAuthed,
  isPremium,
  setIsAuthed,
  setIsPremium
}: {
  isAuthed: boolean;
  isPremium: boolean;
  setIsAuthed: (value: boolean) => void;
  setIsPremium: (value: boolean) => void;
}) {
  return (
    <section className="app-command" aria-label="BamSignal app and admin command center">
      <div className="app-flow-panel">
        <p className="eyebrow">App experience</p>
        <h2>Freemium users see two games. VIP users unlock high-odd rooms.</h2>
        <div className="auth-actions">
          <button className="primary-action" onClick={() => setIsAuthed(true)}>
            <UserPlus size={16} /> {isAuthed ? "Signed in" : "Login or Sign up"}
          </button>
          <button className="secondary-action" onClick={() => { setIsAuthed(true); setIsPremium(true); }}>
            <CreditCard size={16} /> Simulate Paystack VIP
          </button>
        </div>
        <div className="room-grid">
          <div className="room-card">
            <span className="room-label">Freemium room</span>
            <h3>Two public games</h3>
            {freemiumGames.map((game) => (
              <div className="room-pick" key={game.id}>
                <strong>{game.confidence}%</strong>
                <span>{game.home} vs {game.away}</span>
                <small>{game.pick}</small>
              </div>
            ))}
          </div>
          <div className={`room-card premium-room ${isPremium ? "open" : "locked"}`}>
            <span className="room-label">Premium VIP room</span>
            <h3>{isPremium ? "High-odd games unlocked" : "High-odd games locked"}</h3>
            {premiumGames.map((game) => (
              <div className="room-pick" key={game.match}>
                <strong>{game.confidence}%</strong>
                <span>{game.match}</span>
                <small className={!isPremium ? "blurred-tip" : ""}>{game.pick} at {game.odds}</small>
              </div>
            ))}
            <a className="vip-join" href="https://t.me/+U5i6lKAUDtZkODIx" target="_blank" rel="noreferrer">
              <Send size={16} /> Join VIP Telegram after payment
            </a>
          </div>
        </div>
      </div>

      <div className="admin-panel">
        <p className="eyebrow">Admin command center</p>
        <h2>Input once. Publish everywhere.</h2>
        <div className="admin-form">
          <label>Game of the day<input value="Man City vs Tottenham" readOnly /></label>
          <label>Prediction<input value="Home win + over 1.5" readOnly /></label>
          <label>Booking codes<input value="1xBet: BAM218 / BetKing: BK944" readOnly /></label>
          <label>Schedule<input value="Saturday 10:00 AM WAT" readOnly /></label>
        </div>
        <div className="automation-list">
          {adminPlan.map((item, index) => (
            <div key={item}>
              {index === 0 ? <Bell size={16} /> : index === 1 ? <Crown size={16} /> : index === 2 ? <CalendarClock size={16} /> : <ClipboardCheck size={16} />}
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DetailPage({ page, navigate }: { page: Exclude<Page, { kind: "home" }>; navigate: (page: Page, path?: string) => void }) {
  const detail = page.kind === "market"
    ? marketDetails.find((item) => item.slug === page.slug)
    : leagueDetails.find((item) => item.slug === page.slug);
  const titlePrefix = page.kind === "market" ? "Market guide" : "League guide";

  if (!detail) {
    return (
      <main>
        <section className="detail-hero">
          <button className="back-link" onClick={() => navigate({ kind: "home" })}>
            <ArrowLeft size={16} /> Back to BamSignal
          </button>
          <p className="eyebrow">Not found</p>
          <h2>This BamSignal page is not available yet.</h2>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="detail-hero">
        <button className="back-link" onClick={() => navigate({ kind: "home" })}>
          <ArrowLeft size={16} /> Back to BamSignal
        </button>
        <p className="eyebrow">{titlePrefix}</p>
        <h2>{detail.name} predictions explained</h2>
        <p>{detail.intro}</p>
      </section>
      <section className="detail-grid">
        {detail.sections.map((section, index) => (
          <article className="detail-card" key={section}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{section}</p>
          </article>
        ))}
      </section>
      <section className="seo-panel">
        <p className="eyebrow">BamSignal method</p>
        <h2>How beginners should read this page</h2>
        <p>
          Start with the market or league context, then compare the BamSignal percentage with the available odds.
          If the recommendation is locked, join the app or Telegram channel to see the full game, booking code,
          and risk notes before making any decision.
        </p>
      </section>
    </main>
  );
}

function FixtureCard({ fixture, locked }: { fixture: Fixture; locked?: boolean }) {
  return (
    <article className={`fixture-card ${locked ? "locked" : ""}`}>
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
        <strong className={locked ? "blurred-tip" : ""}>{fixture.pick}</strong>
      </div>
      {locked && (
        <div className="lock-strip">
          <LockKeyhole size={14} />
          <span>Unlock the game in the app or Telegram VIP</span>
        </div>
      )}
      <div className={`probability-grid ${locked ? "blurred-grid" : ""}`}>
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
