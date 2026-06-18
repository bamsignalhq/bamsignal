import { useMemo, useState } from "react";
import { ChevronDown, Search, Zap } from "lucide-react";
import { BRAND, ERROR_COPY, SUCCESS_COPY } from "../../constants/copy";
import { STORAGE_KEYS } from "../../constants/limits";
import { DEFAULT_PROFILE_COVER } from "../../constants/photos";
import { AgeRangeTapSelect } from "../AgeRangeTapSelect";
import { StateCitySelect } from "../StateCitySelect";
import { MatchPreferenceFields } from "../preferences/MatchPreferenceFields";
import { SignalLimitModal } from "../premium/SignalLimitModal";
import { ShowcaseImage } from "../ShowcaseImage";
import { VerificationBadge } from "../VerificationBadge";
import { searchMemberProfiles } from "../../services/discoverProfiles";
import { sendSignalRemote } from "../../services/memberData";
import type { DiscoverProfile, HomeAdvancedFilters, UserProfile } from "../../types";
import { getVerificationTier } from "../../utils/verification";
import { getMemberCity } from "../../utils/memberCity";
import {
  emptyHomeAdvancedFilters,
  homeAdvancedFilterCount,
  homeAdvancedToSearchFilters
} from "../../utils/homeFilters";
import { normalizeDatingProfile, normalizeMatchPreferences } from "../../utils/profile";
import {
  evaluateSignalGate,
  recordSignalUsage,
  signalsRemainingLabel
} from "../../utils/signalLimits";
import { readJson } from "../../utils/storage";
import { incrementSignalsSent } from "../../utils/streaks";
import { trackEvent } from "../../utils/analytics";

type HomeSearchSectionProps = {
  user: UserProfile;
  isPremium: boolean;
  onUpgrade: () => void;
  onOpenDiscover?: (profileId: string) => void;
};

export function HomeSearchSection({ user, isPremium, onUpgrade, onOpenDiscover }: HomeSearchSectionProps) {
  const viewer = normalizeDatingProfile(readJson(STORAGE_KEYS.datingProfile, {}));
  const prefs = normalizeMatchPreferences(readJson(STORAGE_KEYS.matchPreferences, {}));
  const blocked = readJson<string[]>(STORAGE_KEYS.blocked, []);

  const [state, setState] = useState(viewer.state || "");
  const [city, setCity] = useState(viewer.city || getMemberCity() || "");
  const [ageMin, setAgeMin] = useState<number>(prefs.ageMin ?? 22);
  const [ageMax, setAgeMax] = useState<number>(prefs.ageMax ?? 35);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advanced, setAdvanced] = useState<HomeAdvancedFilters>(emptyHomeAdvancedFilters);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DiscoverProfile[]>([]);
  const [searched, setSearched] = useState(false);
  const [toast, setToast] = useState("");
  const [signalingId, setSignalingId] = useState<string | null>(null);
  const [signalLimitOpen, setSignalLimitOpen] = useState(false);

  const remainingLabel = signalsRemainingLabel(isPremium);
  const advancedCount = homeAdvancedFilterCount(advanced);

  const clearAdvanced = () => setAdvanced(emptyHomeAdvancedFilters());

  const runSearch = async () => {
    if (!city.trim() && !state.trim()) {
      setToast("Choose a state or city to search.");
      window.setTimeout(() => setToast(""), 3000);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const profiles = await searchMemberProfiles(user, {
        state,
        city,
        ageMin,
        ageMax,
        excludeProfileIds: blocked,
        ...homeAdvancedToSearchFilters(advanced)
      });
      setResults(profiles);
      trackEvent("home_search", {
        city,
        state,
        count: String(profiles.length),
        advanced: String(advancedCount)
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignal = async (profile: DiscoverProfile) => {
    const gate = evaluateSignalGate(isPremium, user);
    if (!gate.allowed) {
      localStorage.setItem(STORAGE_KEYS.pendingSignalProfileId, profile.id);
      setSignalLimitOpen(true);
      return;
    }

    setSignalingId(profile.id);
    const sent = await sendSignalRemote(user, profile.id, "signal");
    setSignalingId(null);

    if (!sent.ok) {
      setToast(sent.error || ERROR_COPY.signalFailed);
      window.setTimeout(() => setToast(""), 3500);
      return;
    }

    recordSignalUsage(isPremium, gate.usesDailySlot);
    incrementSignalsSent();
    trackEvent("signal_sent", { profileId: profile.id, source: "home_search" });
    setToast(`${BRAND.signalSent} ${BRAND.signalSentSub}`);
    window.setTimeout(() => setToast(""), 3000);
  };

  const emptyMessage = useMemo(() => {
    if (!searched) return null;
    if (loading) return null;
    return { title: SUCCESS_COPY.searchEmpty, hint: SUCCESS_COPY.searchEmptyHint };
  }, [searched, loading]);

  return (
    <section className="home-search" aria-label="Search members">
      <div className="home-search__head">
        {remainingLabel ? <p className="home-search__limit">{remainingLabel}</p> : null}
      </div>

      <div className="home-search__form card">
        <p className="home-search__section-label">Basic</p>

        <AgeRangeTapSelect
          ageMin={ageMin}
          ageMax={ageMax}
          label="Age"
          onChange={(min, max) => {
            setAgeMin(min);
            setAgeMax(max);
          }}
        />

        <StateCitySelect
          state={state}
          city={city}
          onLocationChange={(nextState, nextCity) => {
            setState(nextState);
            setCity(nextCity);
          }}
          stateLabel="State"
          cityLabel="City"
        />

        <div className="home-search__advanced-toggle">
          <button
            type="button"
            className={`home-search__advanced-btn ${advancedOpen ? "open" : ""}`}
            onClick={() => setAdvancedOpen((open) => !open)}
            aria-expanded={advancedOpen}
          >
            <span>
              Advanced
              {advancedCount > 0 ? <em className="home-search__advanced-count">{advancedCount}</em> : null}
            </span>
            <ChevronDown size={18} aria-hidden />
          </button>
          {advancedCount > 0 ? (
            <button type="button" className="home-search__clear-advanced" onClick={clearAdvanced}>
              Clear
            </button>
          ) : null}
        </div>

        {advancedOpen ? (
          <div className="home-search__advanced">
            <MatchPreferenceFields
              ethnicities={advanced.tribes}
              onEthnicitiesChange={(tribes) => setAdvanced((current) => ({ ...current, tribes }))}
              religions={advanced.religions}
              onReligionsChange={(religions) => setAdvanced((current) => ({ ...current, religions }))}
              occupations={advanced.occupations}
              onOccupationsChange={(occupations) => setAdvanced((current) => ({ ...current, occupations }))}
              statesOfOrigin={advanced.statesOfOrigin}
              onStatesOfOriginChange={(statesOfOrigin) =>
                setAdvanced((current) => ({ ...current, statesOfOrigin }))
              }
              relationshipIntentions={advanced.relationshipIntentions}
              onRelationshipIntentionsChange={(relationshipIntentions) =>
                setAdvanced((current) => ({ ...current, relationshipIntentions }))
              }
              genotypes={advanced.genotypes}
              onGenotypesChange={(genotypes) => setAdvanced((current) => ({ ...current, genotypes }))}
              hasKids={advanced.hasKids}
              onHasKidsChange={(hasKids) => setAdvanced((current) => ({ ...current, hasKids }))}
              wantsKids={advanced.wantsKids}
              onWantsKidsChange={(wantsKids) => setAdvanced((current) => ({ ...current, wantsKids }))}
              bodyTypes={advanced.bodyTypes}
              onBodyTypesChange={(bodyTypes) => setAdvanced((current) => ({ ...current, bodyTypes }))}
              verificationPreferences={advanced.verificationPreferences}
              onVerificationPreferencesChange={(verificationPreferences) =>
                setAdvanced((current) => ({ ...current, verificationPreferences, verifiedOnly: false }))
              }
            />
          </div>
        ) : null}

        <button type="button" className="btn-primary btn-full" disabled={loading} onClick={() => void runSearch()}>
          <Search size={18} aria-hidden />
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {toast ? (
        <p className="home-search__toast" role="status">
          {toast}
        </p>
      ) : null}

      {emptyMessage ? (
        <div className="home-search__empty">
          <p>{emptyMessage.title}</p>
          <p className="home-search__empty-hint">{emptyMessage.hint}</p>
        </div>
      ) : null}

      {results.length > 0 ? (
        <ul className="home-search__results">
          {results.map((profile) => {
            const verification = getVerificationTier(
              {
                verified: Boolean(profile.verified),
                premium: Boolean(profile.premium),
                photos: [],
                age: profile.age,
                gender: profile.gender ?? "Man",
                city: profile.city,
                bio: profile.bio,
                lookingFor: profile.lookingFor ?? "Women",
                intents: profile.intents,
                interests: profile.interests ?? []
              },
              Boolean(profile.premium),
              Boolean(profile.verified)
            );
            return (
              <li key={profile.id} className="home-search-card">
                <button
                  type="button"
                  className="home-search-card__photo-hit"
                  onClick={() => onOpenDiscover?.(profile.id)}
                  aria-label={`View ${profile.name}'s profile`}
                >
                  <ShowcaseImage
                    src={profile.photo || DEFAULT_PROFILE_COVER}
                    alt=""
                    fallbackSrc={DEFAULT_PROFILE_COVER}
                    className="home-search-card__photo"
                    loading="lazy"
                  />
                </button>
                <div className="home-search-card__body">
                  <h3>
                    {profile.name}
                    <span>, {profile.age}</span>
                  </h3>
                  <p className="home-search-card__city">{profile.city}</p>
                  {verification.tier ? (
                    <div className="home-search-card__badge">
                      <VerificationBadge info={verification} />
                    </div>
                  ) : null}
                  <button
                    type="button"
                    className="btn-primary btn-sm home-search-card__signal"
                    disabled={signalingId === profile.id}
                    onClick={() => void handleSignal(profile)}
                  >
                    <Zap size={16} fill="currentColor" aria-hidden />
                    {BRAND.sendSignal}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      <SignalLimitModal
        open={signalLimitOpen}
        onClose={() => setSignalLimitOpen(false)}
        onGetSignalPass={() => {
          setSignalLimitOpen(false);
          onUpgrade();
        }}
      />
    </section>
  );
}
