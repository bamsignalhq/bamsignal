import { useEffect, useMemo } from "react";
import { greetingForHour } from "../constants/copy";
import { DEFAULT_PREMIUM_PLANS } from "../constants/plans";
import { firstNameFromDisplayName } from "../constants/homeFilters";
import { HomeFeedFilters } from "../components/home/HomeFeedFilters";
import { HomeAdvancedFiltersSheet } from "../components/home/HomeAdvancedFiltersSheet";
import { HomeSignalLimitBar } from "../components/home/HomeSignalLimitBar";
import { HomeFeedCard } from "../components/home/HomeFeedCard";
import { ProfileCard } from "../components/ProfileCard";
import { ProfileCoverHeader } from "../components/ProfileCoverHeader";
import { ProfileInterestsPreview } from "../components/profile/ProfileInterestsPreview";
import { PremiumPage } from "../pages/PremiumPage";
import { SafetyCenterPage } from "../pages/SafetyCenterPage";
import { PhoneVerificationPanel } from "../components/PhoneVerificationPanel";
import { DiscoverHeader } from "../components/discover/DiscoverHeader";
import { ChatInput } from "../components/ChatInput";
import { ShowcaseImage } from "../components/ShowcaseImage";
import { DEFAULT_PROFILE_COVER } from "../constants/photos";
import {
  STORE_CAPTIONS,
  STORE_CHAT_MATCH,
  STORE_CHAT_MESSAGES,
  STORE_CHAT_THREADS,
  STORE_CITY_TABS,
  STORE_DISCOVER_PROFILE,
  STORE_FILTER_DEMO,
  STORE_HOME_PROFILES,
  STORE_VIEWER_PROFILE,
  STORE_VIEWER_USER,
  profilesForCity
} from "../data/storeScreenshotSeed";
import { getVerificationTier } from "../utils/verification";
import { profileIntentLabel } from "../constants/intents";
import "../styles/store-screenshots.css";

const SCENE_IDS = [
  "01-home",
  "02-discover",
  "03-chat",
  "04-profile",
  "05-filters",
  "06-city",
  "07-premium",
  "08-safety"
] as const;

type SceneId = (typeof SCENE_IDS)[number];
type Variant = "phone" | "tablet-7" | "tablet-10";

function parseScene(): SceneId {
  const raw = new URLSearchParams(window.location.search).get("scene") || "01-home";
  return SCENE_IDS.includes(raw as SceneId) ? (raw as SceneId) : "01-home";
}

function parseVariant(): Variant {
  const raw = new URLSearchParams(window.location.search).get("variant") || "phone";
  if (raw === "tablet-7" || raw === "tablet-10") return raw;
  return "phone";
}

function captionForScene(scene: SceneId): string {
  const index = SCENE_IDS.indexOf(scene);
  return STORE_CAPTIONS[index] ?? STORE_CAPTIONS[0];
}

function SceneHome() {
  const firstName = firstNameFromDisplayName(STORE_VIEWER_USER.name);
  const verification = (profile: (typeof STORE_HOME_PROFILES)[number]) =>
    getVerificationTier(
      {
        photos: [profile.photo],
        age: profile.age,
        gender: profile.gender ?? "Woman",
        city: profile.city,
        bio: profile.bio,
        lookingFor: profile.lookingFor ?? "Men",
        intents: profile.intents,
        interests: profile.interests ?? [],
        verified: Boolean(profile.verified),
        premium: Boolean(profile.premium)
      },
      Boolean(profile.premium),
      Boolean(profile.verified)
    );

  return (
    <div className="page home-page home-page--compact member-content-pad">
      <header className="home-top home-top--compact home-top--row">
        <h1 className="home-top__greeting">
          {greetingForHour()}, {firstName} 👋
        </h1>
        <HomeSignalLimitBar isPremium={false} onUpgrade={() => undefined} refreshKey={0} />
      </header>
      <section className="home-discovery home-discovery--compact" aria-label="Filters">
        <HomeFeedFilters
          nameQuery=""
          onNameQueryChange={() => undefined}
          ageMin={24}
          ageMax={34}
          city="Lagos"
          state="Lagos"
          distanceKm={25}
          hasCustomFilters={false}
          onOpenQuickFilters={() => undefined}
          onOpenAdvanced={() => undefined}
          onReset={() => undefined}
        />
      </section>
      <section className="home-signals-feed" aria-label="Signals near you">
        <header className="home-signals-feed__head home-signals-feed__head--minimal">
          <h2>People near you</h2>
        </header>
        <div className="store-shot__home-grid discover-feed-grid">
          {STORE_HOME_PROFILES.map((profile) => (
            <HomeFeedCard
              key={profile.id}
              profile={profile}
              verification={verification(profile)}
              onOpen={() => undefined}
              onSignal={() => undefined}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function SceneDiscover() {
  const verification = getVerificationTier(
    {
      photos: [STORE_DISCOVER_PROFILE.photo],
      age: STORE_DISCOVER_PROFILE.age,
      gender: STORE_DISCOVER_PROFILE.gender ?? "Woman",
      city: STORE_DISCOVER_PROFILE.city,
      bio: STORE_DISCOVER_PROFILE.bio,
      lookingFor: STORE_DISCOVER_PROFILE.lookingFor ?? "Men",
      intents: STORE_DISCOVER_PROFILE.intents,
      interests: STORE_DISCOVER_PROFILE.interests ?? [],
      verified: Boolean(STORE_DISCOVER_PROFILE.verified),
      premium: Boolean(STORE_DISCOVER_PROFILE.premium)
    },
    Boolean(STORE_DISCOVER_PROFILE.premium),
    Boolean(STORE_DISCOVER_PROFILE.verified)
  );

  return (
    <div className="page discover-page discover-v2 member-content-pad">
      <DiscoverHeader cityLabel="Lagos, Nigeria" />
      <p className="store-shot__activity" aria-hidden>
        ✓ 12 new signals in Lagos today · Abuja · Port Harcourt
      </p>
      <ProfileCard
        profile={STORE_DISCOVER_PROFILE}
        verification={verification}
        compatibilityPercent={88}
        matchReasons={["Shared interests", "Same city", "Verified profile"]}
        onSendSignal={() => undefined}
        onIgnore={() => undefined}
        onViewProfile={() => undefined}
        isPremium={false}
        showActions
      />
    </div>
  );
}

function SceneChat() {
  return (
    <div className="store-shot__chat-layout">
      <aside className="store-shot__chat-list">
        <div className="store-shot__chat-list-head">
          <h2>Messages</h2>
        </div>
        {STORE_CHAT_THREADS.map((thread) => (
          <button
            key={thread.id}
            type="button"
            className={`store-shot__chat-row${thread.id === STORE_CHAT_MATCH.id ? " store-shot__chat-row--active" : ""}`}
          >
            <img src={thread.photo || DEFAULT_PROFILE_COVER} alt="" />
            <div>
              <strong>{thread.name}</strong>
              <span>{thread.city}</span>
            </div>
          </button>
        ))}
      </aside>
      <div className="store-shot__chat-detail chat-detail-page">
        <header className="chat-detail-header">
          <button type="button" className="icon-btn" aria-label="Back">
            ←
          </button>
          <div className="chat-detail-header__meta">
            <strong>{STORE_CHAT_MATCH.name}</strong>
            <span>{STORE_CHAT_MATCH.city}</span>
          </div>
        </header>
        <div className="chat-messages chat-messages--fintech">
          {STORE_CHAT_MESSAGES.map((message) => (
            <div key={message.id} className={`chat-bubble ${message.from}`}>
              {message.text}
            </div>
          ))}
          <p className="chat-read-receipt">Seen</p>
        </div>
        <ChatInput onSend={() => undefined} placeholder={`Message ${STORE_CHAT_MATCH.name}…`} disabled />
      </div>
    </div>
  );
}

function SceneProfile() {
  const verification = getVerificationTier(
    STORE_VIEWER_PROFILE,
    Boolean(STORE_VIEWER_PROFILE.premium),
    Boolean(STORE_VIEWER_PROFILE.verified)
  );

  return (
    <div className="page profile-page member-content-pad">
      <ProfileCoverHeader user={STORE_VIEWER_USER} profile={STORE_VIEWER_PROFILE} verification={verification} />
      <div className="profile-overview-sections profile-overview-sections--clean">
        <section className="profile-overview-block">
          <h3 className="profile-overview__label">About</h3>
          <p className="profile-overview-bio">{STORE_VIEWER_PROFILE.bio}</p>
        </section>
        <section className="profile-overview-block">
          <h3 className="profile-overview__label">Interests</h3>
          <ProfileInterestsPreview interests={STORE_VIEWER_PROFILE.interests} />
        </section>
        <section className="profile-overview-block">
          <h3 className="profile-overview__label">Looking for</h3>
          <div className="profile-read-chips profile-read-chips--compact">
            {STORE_VIEWER_PROFILE.intents.map((intent) => (
              <span key={intent} className="profile-read-chip profile-read-chip--intent">
                {profileIntentLabel(intent)}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SceneFilters() {
  return (
    <div className="page home-page home-page--compact member-content-pad">
      <header className="home-top home-top--compact home-top--row">
        <h1 className="home-top__greeting">Good afternoon, Chioma 👋</h1>
        <HomeSignalLimitBar isPremium={false} onUpgrade={() => undefined} refreshKey={0} />
      </header>
      <section className="home-discovery home-discovery--compact">
        <HomeFeedFilters
          nameQuery=""
          onNameQueryChange={() => undefined}
          ageMin={26}
          ageMax={32}
          city="Lagos"
          state="Lagos"
          distanceKm={30}
          hasCustomFilters
          onOpenQuickFilters={() => undefined}
          onOpenAdvanced={() => undefined}
          onReset={() => undefined}
        />
      </section>
      <HomeAdvancedFiltersSheet
        open
        filters={STORE_FILTER_DEMO}
        onChange={() => undefined}
        onClose={() => undefined}
        onClear={() => undefined}
        onApply={() => undefined}
      />
    </div>
  );
}

function SceneCity() {
  const city = "Lagos";
  const cards = useMemo(() => profilesForCity(city), [city]);

  return (
    <div className="page member-content-pad">
      <header className="home-section__head" style={{ padding: "16px 16px 8px" }}>
        <p className="home-section__eyebrow">Nigerian cities</p>
        <h2 className="home-section__title">Signals across Nigeria</h2>
        <p className="home-section__lede">Lagos, Abuja, Port Harcourt and more.</p>
      </header>
      <div className="store-shot__city-tabs" role="tablist">
        {STORE_CITY_TABS.map((name) => (
          <span
            key={name}
            className={`store-shot__city-tab${name === city ? " store-shot__city-tab--active" : ""}`}
            role="tab"
            aria-selected={name === city}
          >
            {name}
          </span>
        ))}
      </div>
      <p className="store-shot__activity">✓ Live activity in {city} · 24 profiles active now</p>
      <div className="store-shot__city-grid">
        {cards.map((profile) => (
          <article key={profile.id} className="discover-feed-card">
            <div className="discover-feed-card__media">
              <ShowcaseImage
                src={profile.photo || DEFAULT_PROFILE_COVER}
                alt=""
                fallbackSrc={DEFAULT_PROFILE_COVER}
                className="discover-feed-card__photo"
              />
              <div className="discover-feed-card__overlay">
                <h3 className="discover-feed-card__name">
                  {profile.name}
                  <span>, {profile.age}</span>
                </h3>
                <p className="discover-feed-card__city">{profile.city}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ScenePremium() {
  return (
    <PremiumPage
      isPremium={false}
      plans={DEFAULT_PREMIUM_PLANS}
      onBack={() => undefined}
      onSelectPlan={() => undefined}
    />
  );
}

function SceneSafety() {
  return (
    <div className="store-shot__screen-inner--scroll">
      <SafetyCenterPage onBack={() => undefined} onOpenProfile={() => undefined} />
      <section className="store-shot__safety-stack">
        <PhoneVerificationPanel
          user={STORE_VIEWER_USER}
          phoneVerified
          profilePhoto={STORE_VIEWER_PROFILE.photos[0]}
          verificationStatus="approved"
          onPhoneVerified={() => undefined}
          onSelfieSubmitted={() => undefined}
        />
      </section>
    </div>
  );
}

function renderScene(scene: SceneId) {
  switch (scene) {
    case "01-home":
      return <SceneHome />;
    case "02-discover":
      return <SceneDiscover />;
    case "03-chat":
      return <SceneChat />;
    case "04-profile":
      return <SceneProfile />;
    case "05-filters":
      return <SceneFilters />;
    case "06-city":
      return <SceneCity />;
    case "07-premium":
      return <ScenePremium />;
    case "08-safety":
      return <SceneSafety />;
    default:
      return <SceneHome />;
  }
}

export function StoreScreenshotsPage() {
  const scene = parseScene();
  const variant = parseVariant();
  const caption = captionForScene(scene);

  useEffect(() => {
    document.documentElement.classList.add("light");
    document.body.classList.add("store-screenshots-root");
    return () => {
      document.body.classList.remove("store-screenshots-root");
    };
  }, []);

  return (
    <div className={`app light store-shot store-shot--${variant}`} data-store-shot-ready="true" data-scene={scene}>
      <div className="store-shot__brand">
        <img src="/brand/logo.webp" alt="" />
        <span>BamSignal</span>
      </div>
      <h1 className="store-shot__caption">{caption}</h1>
      <span className="store-shot__accent" aria-hidden />
      <div className="store-shot__device">
        <div className="store-shot__notch" aria-hidden />
        <div className="store-shot__screen">
          <div className="store-shot__screen-inner">{renderScene(scene)}</div>
        </div>
      </div>
    </div>
  );
}
