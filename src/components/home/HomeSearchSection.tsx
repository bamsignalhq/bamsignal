import { useMemo, useState } from "react";
import { ChevronDown, Search, Zap } from "lucide-react";
import { BRAND, ERROR_COPY, MONETIZATION_COPY, SUCCESS_COPY } from "../../constants/copy";
import { INTENT_OPTIONS } from "../../constants/intents";
import { STORAGE_KEYS } from "../../constants/limits";
import {
  FILTER_ETHNICITIES,
  FILTER_GENOTYPES,
  FILTER_KIDS_PREFERENCES,
  FILTER_OCCUPATIONS,
  FILTER_RELIGIONS,
  NIGERIAN_STATES
} from "../../constants/profileOptions";
import { DEFAULT_PROFILE_COVER } from "../../constants/photos";
import { StateCitySelect } from "../StateCitySelect";
import { ShowcaseImage } from "../ShowcaseImage";
import { VerificationBadge } from "../VerificationBadge";
import { searchMemberProfiles } from "../../services/discoverProfiles";
import { sendSignalRemote } from "../../services/memberData";
import type {
  DiscoverProfile,
  EthnicBackground,
  Genotype,
  IntentTag,
  KidsPreference,
  Occupation,
  Religion,
  UserProfile
} from "../../types";
import { getVerificationTier } from "../../utils/verification";
import { getMemberCity } from "../../utils/memberCity";
import { normalizeDatingProfile, normalizeMatchPreferences } from "../../utils/profile";
import {
  evaluateSignalGate,
  isAtFreeSignalLimit,
  recordSignalUsage,
  signalLimitReachedMessage,
  signalLimitReachedHint,
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

type AdvancedFilters = {
  tribes: EthnicBackground[];
  religions: Religion[];
  occupations: Occupation[];
  statesOfOrigin: string[];
  relationshipIntentions: IntentTag[];
  genotypes: Genotype[];
  kidsPreferences: KidsPreference[];
};

const emptyAdvanced = (): AdvancedFilters => ({
  tribes: [],
  religions: [],
  occupations: [],
  statesOfOrigin: [],
  relationshipIntentions: [],
  genotypes: [],
  kidsPreferences: []
});

function toggleList<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function advancedFilterCount(filters: AdvancedFilters): number {
  return (
    filters.tribes.length +
    filters.religions.length +
    filters.occupations.length +
    filters.statesOfOrigin.length +
    filters.relationshipIntentions.length +
    filters.genotypes.length +
    filters.kidsPreferences.length
  );
}

export function HomeSearchSection({ user, isPremium, onUpgrade, onOpenDiscover }: HomeSearchSectionProps) {
  const viewer = normalizeDatingProfile(readJson(STORAGE_KEYS.datingProfile, {}));
  const prefs = normalizeMatchPreferences(readJson(STORAGE_KEYS.matchPreferences, {}));
  const blocked = readJson<string[]>(STORAGE_KEYS.blocked, []);

  const [state, setState] = useState(viewer.state || "");
  const [city, setCity] = useState(viewer.city || getMemberCity() || "");
  const [ageMin, setAgeMin] = useState<number>(prefs.ageMin ?? 22);
  const [ageMax, setAgeMax] = useState<number>(prefs.ageMax ?? 35);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advanced, setAdvanced] = useState<AdvancedFilters>(emptyAdvanced);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DiscoverProfile[]>([]);
  const [searched, setSearched] = useState(false);
  const [toast, setToast] = useState("");
  const [signalingId, setSignalingId] = useState<string | null>(null);

  const remainingLabel = signalsRemainingLabel(isPremium);
  const advancedCount = advancedFilterCount(advanced);

  const toggleAdvanced = <K extends keyof AdvancedFilters>(key: K, value: AdvancedFilters[K][number]) => {
    setAdvanced((current) => ({
      ...current,
      [key]: toggleList(current[key] as string[], value as string) as AdvancedFilters[K]
    }));
  };

  const clearAdvanced = () => setAdvanced(emptyAdvanced());

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
        ...advanced
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
      onUpgrade();
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

        <div className="home-search__ages">
          <label>
            Min age
            <input
              type="number"
              min={18}
              max={99}
              value={ageMin}
              onChange={(e) => setAgeMin(Number(e.target.value) || 18)}
            />
          </label>
          <label>
            Max age
            <input
              type="number"
              min={18}
              max={99}
              value={ageMax}
              onChange={(e) => setAgeMax(Number(e.target.value) || 99)}
            />
          </label>
        </div>

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
            <fieldset className="intent-fieldset">
              <legend>Tribe</legend>
              <div className="intent-tags selectable home-search__tag-scroll">
                {FILTER_ETHNICITIES.map((tribe) => (
                  <button
                    key={tribe}
                    type="button"
                    className={`intent-tag ${advanced.tribes.includes(tribe) ? "selected" : ""}`}
                    onClick={() => toggleAdvanced("tribes", tribe)}
                  >
                    {tribe}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="intent-fieldset">
              <legend>Religion</legend>
              <div className="intent-tags selectable">
                {FILTER_RELIGIONS.map((religion) => (
                  <button
                    key={religion}
                    type="button"
                    className={`intent-tag ${advanced.religions.includes(religion) ? "selected" : ""}`}
                    onClick={() => toggleAdvanced("religions", religion)}
                  >
                    {religion}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="intent-fieldset">
              <legend>Occupation</legend>
              <div className="intent-tags selectable home-search__tag-scroll">
                {FILTER_OCCUPATIONS.map((occupation) => (
                  <button
                    key={occupation}
                    type="button"
                    className={`intent-tag ${advanced.occupations.includes(occupation) ? "selected" : ""}`}
                    onClick={() => toggleAdvanced("occupations", occupation)}
                  >
                    {occupation}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="intent-fieldset">
              <legend>State of origin</legend>
              <div className="intent-tags selectable home-search__tag-scroll">
                {NIGERIAN_STATES.map((origin) => (
                  <button
                    key={origin}
                    type="button"
                    className={`intent-tag ${advanced.statesOfOrigin.includes(origin) ? "selected" : ""}`}
                    onClick={() => toggleAdvanced("statesOfOrigin", origin)}
                  >
                    {origin === "FCT" ? "Abuja" : origin}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="intent-fieldset">
              <legend>Relationship intention</legend>
              <div className="intent-tags selectable">
                {INTENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`intent-tag ${advanced.relationshipIntentions.includes(opt.id) ? "selected" : ""}`}
                    onClick={() => toggleAdvanced("relationshipIntentions", opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="intent-fieldset">
              <legend>Genotype</legend>
              <div className="intent-tags selectable">
                {FILTER_GENOTYPES.map((genotype) => (
                  <button
                    key={genotype}
                    type="button"
                    className={`intent-tag ${advanced.genotypes.includes(genotype) ? "selected" : ""}`}
                    onClick={() => toggleAdvanced("genotypes", genotype)}
                  >
                    {genotype}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="intent-fieldset">
              <legend>Kids preference</legend>
              <div className="intent-tags selectable">
                {FILTER_KIDS_PREFERENCES.map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    className={`intent-tag ${advanced.kidsPreferences.includes(pref) ? "selected" : ""}`}
                    onClick={() => toggleAdvanced("kidsPreferences", pref)}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </fieldset>
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

      {!isPremium && isAtFreeSignalLimit(isPremium) ? (
        <div className="home-search__limit-banner card">
          <p>{signalLimitReachedMessage()}</p>
          <p className="home-search__limit-hint">{signalLimitReachedHint()}</p>
          <div className="home-search__limit-actions">
            <button type="button" className="btn-primary btn-sm" onClick={onUpgrade}>
              {MONETIZATION_COPY.getSignalPass}
            </button>
          </div>
        </div>
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
    </section>
  );
}
