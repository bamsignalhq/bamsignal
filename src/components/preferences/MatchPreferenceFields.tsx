import {
  MAX_SEARCH_CITIES,
  normalizeSearchCities,
  SEARCH_CITIES_LIMIT_MESSAGE
} from "../../utils/searchLocationPrefs";
import { AgeRangeTapSelect } from "../AgeRangeTapSelect";
import { TapSelectField } from "../TapSelectField";
import {
  FILTER_BODY_TYPES,
  FILTER_ETHNICITIES,
  FILTER_GENOTYPES,
  FILTER_LIFESTYLES,
  LIFESTYLE_TRAITS_LIMIT_MESSAGE,
  MAX_LIFESTYLE_TRAITS,
  normalizeLifestyleTraits,
  FILTER_OCCUPATIONS,
  FILTER_RELIGIONS,
  FILTER_VERIFICATION_PREFERENCES,
  HAS_KIDS_OPTIONS,
  NIGERIAN_STATES,
  RELATIONSHIP_INTENTIONS,
  RELIGIONS,
  WANTS_KIDS_OPTIONS,
  citiesForState,
  stateDisplayLabel
} from "../../constants/profileOptions";
import type {
  EthnicBackground,
  Genotype,
  HasKidsOption,
  LookingFor,
  Occupation,
  RelationshipIntention,
  Religion,
  SocialLifestyle,
  VerificationPreference,
  WantsKidsOption
} from "../../types";

const STATE_OPTIONS = NIGERIAN_STATES.map((s) => ({ value: s, label: stateDisplayLabel(s) }));

type MatchPreferenceFieldsProps = {
  /** Profile-level interested in (Men/Women) */
  lookingFor?: LookingFor;
  onLookingForChange?: (value: LookingFor | undefined) => void;
  /** Profile faith — single */
  faith?: Religion;
  onFaithChange?: (value: Religion | undefined) => void;
  /** Profile lifestyles — multi (max 3) */
  lifestyles?: SocialLifestyle[];
  onLifestylesChange?: (value: SocialLifestyle[]) => void;
  /** Match preference lifestyles — multi (max 3); use one handler, not both */
  prefLifestyles?: SocialLifestyle[];
  onPrefLifestylesChange?: (value: SocialLifestyle[]) => void;
  religions?: Religion[];
  onReligionsChange?: (value: Religion[]) => void;
  ethnicities?: EthnicBackground[];
  onEthnicitiesChange?: (value: EthnicBackground[]) => void;
  searchState?: string;
  onSearchStateChange?: (value: string | undefined) => void;
  searchCities?: string[];
  onSearchCitiesChange?: (value: string[]) => void;
  ageMin?: number;
  ageMax?: number;
  onAgeRangeChange?: (min: number, max: number) => void;
  occupations?: Occupation[];
  onOccupationsChange?: (value: Occupation[]) => void;
  /** Profile — single state of origin */
  stateOfOrigin?: string;
  onStateOfOriginChange?: (value: string | undefined) => void;
  statesOfOrigin?: string[];
  onStatesOfOriginChange?: (value: string[]) => void;
  relationshipIntentions?: RelationshipIntention[];
  onRelationshipIntentionsChange?: (value: RelationshipIntention[]) => void;
  genotypes?: Genotype[];
  onGenotypesChange?: (value: Genotype[]) => void;
  /** Profile — single has-kids answer */
  hasKidsOption?: HasKidsOption;
  onHasKidsOptionChange?: (value: HasKidsOption | undefined) => void;
  hasKids?: HasKidsOption[];
  onHasKidsChange?: (value: HasKidsOption[]) => void;
  /** Profile — single wants-kids answer */
  wantsKidsOption?: WantsKidsOption;
  onWantsKidsOptionChange?: (value: WantsKidsOption | undefined) => void;
  wantsKids?: WantsKidsOption[];
  onWantsKidsChange?: (value: WantsKidsOption[]) => void;
  /** Profile — single body type */
  bodyType?: import("../../types").BodyType;
  onBodyTypeChange?: (value: import("../../types").BodyType | undefined) => void;
  bodyTypes?: import("../../types").BodyType[];
  onBodyTypesChange?: (value: import("../../types").BodyType[]) => void;
  verificationPreferences?: VerificationPreference[];
  onVerificationPreferencesChange?: (value: VerificationPreference[]) => void;
  /** Profile details — single tribe */
  tribe?: EthnicBackground;
  onTribeChange?: (value: EthnicBackground | undefined) => void;
  ageLabel?: string;
  className?: string;
};

const LOOKING_OPTIONS = ["Men", "Women"] as const;

export function MatchPreferenceFields({
  lookingFor,
  onLookingForChange,
  faith,
  onFaithChange,
  lifestyles,
  onLifestylesChange,
  religions,
  onReligionsChange,
  ethnicities,
  onEthnicitiesChange,
  prefLifestyles,
  onPrefLifestylesChange,
  searchState,
  onSearchStateChange,
  searchCities,
  onSearchCitiesChange,
  ageMin,
  ageMax,
  onAgeRangeChange,
  occupations,
  onOccupationsChange,
  stateOfOrigin,
  onStateOfOriginChange,
  statesOfOrigin,
  onStatesOfOriginChange,
  relationshipIntentions,
  onRelationshipIntentionsChange,
  genotypes,
  onGenotypesChange,
  hasKidsOption,
  onHasKidsOptionChange,
  hasKids,
  onHasKidsChange,
  wantsKidsOption,
  onWantsKidsOptionChange,
  wantsKids,
  onWantsKidsChange,
  bodyType,
  onBodyTypeChange,
  bodyTypes,
  onBodyTypesChange,
  verificationPreferences,
  onVerificationPreferencesChange,
  tribe,
  onTribeChange,
  ageLabel = "Preferred age range",
  className = ""
}: MatchPreferenceFieldsProps) {
  const cityOptions = searchState ? citiesForState(searchState) : [];
  const lifestyleValue = normalizeLifestyleTraits(lifestyles ?? prefLifestyles ?? []);
  const onLifestyleChange = onLifestylesChange ?? onPrefLifestylesChange;
  const showLifestyle = Boolean(onLifestyleChange);

  return (
    <div className={`match-pref-fields ${className}`.trim()}>
      {onLookingForChange ? (
        <TapSelectField
          label="Interested in"
          options={LOOKING_OPTIONS}
          value={lookingFor}
          onChange={(next) => onLookingForChange(next as LookingFor | undefined)}
        />
      ) : null}

      {onFaithChange ? (
        <TapSelectField
          label="Faith"
          optional
          options={RELIGIONS}
          value={faith}
          onChange={(next) => onFaithChange(next as Religion | undefined)}
        />
      ) : null}

      {showLifestyle ? (
        <TapSelectField
          label="Lifestyle"
          optional
          multiple
          maxSelections={MAX_LIFESTYLE_TRAITS}
          limitMessage={LIFESTYLE_TRAITS_LIMIT_MESSAGE}
          options={FILTER_LIFESTYLES}
          value={lifestyleValue}
          onChange={(next) => {
            const normalized = normalizeLifestyleTraits((next as SocialLifestyle[]) ?? []);
            onLifestyleChange?.(normalized);
          }}
        />
      ) : null}

      {onReligionsChange ? (
        <TapSelectField
          label="Faith"
          optional
          multiple
          options={FILTER_RELIGIONS}
          value={religions ?? []}
          onChange={(next) => onReligionsChange((next as Religion[]) ?? [])}
        />
      ) : null}

      {onEthnicitiesChange ? (
        <TapSelectField
          label="Tribe"
          optional
          multiple
          options={FILTER_ETHNICITIES}
          value={ethnicities ?? []}
          onChange={(next) => onEthnicitiesChange((next as EthnicBackground[]) ?? [])}
        />
      ) : null}

      {onTribeChange ? (
        <TapSelectField
          label="Tribe"
          optional
          options={FILTER_ETHNICITIES}
          value={tribe}
          onChange={(next) => onTribeChange(next as EthnicBackground | undefined)}
        />
      ) : null}

      {onSearchStateChange ? (
        <TapSelectField
          label="Search State"
          options={STATE_OPTIONS}
          value={searchState}
          formatValue={stateDisplayLabel}
          onChange={(next) => onSearchStateChange(next as string | undefined)}
        />
      ) : null}

      {onSearchCitiesChange ? (
        <TapSelectField
          label="Search Cities"
          multiple
          maxSelections={MAX_SEARCH_CITIES}
          limitMessage={SEARCH_CITIES_LIMIT_MESSAGE}
          disabled={!searchState}
          options={cityOptions}
          value={normalizeSearchCities(searchCities ?? [], searchState)}
          onChange={(next) =>
            onSearchCitiesChange(normalizeSearchCities((next as string[]) ?? [], searchState))
          }
        />
      ) : null}

      {onAgeRangeChange && ageMin != null && ageMax != null ? (
        <AgeRangeTapSelect ageMin={ageMin} ageMax={ageMax} onChange={onAgeRangeChange} label={ageLabel} />
      ) : null}

      {onOccupationsChange ? (
        <TapSelectField
          label="Occupation"
          optional
          multiple
          options={FILTER_OCCUPATIONS}
          value={occupations ?? []}
          onChange={(next) => onOccupationsChange((next as Occupation[]) ?? [])}
        />
      ) : null}

      {onStateOfOriginChange ? (
        <TapSelectField
          label="State of origin"
          optional
          options={STATE_OPTIONS}
          value={stateOfOrigin}
          formatValue={stateDisplayLabel}
          onChange={(next) => onStateOfOriginChange(next as string | undefined)}
        />
      ) : onStatesOfOriginChange ? (
        <TapSelectField
          label="State of origin"
          optional
          multiple
          maxSelections={1}
          limitMessage="Choose one state of origin."
          options={STATE_OPTIONS}
          value={(statesOfOrigin ?? []).slice(0, 1)}
          formatValue={stateDisplayLabel}
          onChange={(next) => onStatesOfOriginChange((next as string[]) ?? [])}
        />
      ) : null}

      {onRelationshipIntentionsChange ? (
        <TapSelectField
          label="Relationship intention"
          optional
          multiple
          options={RELATIONSHIP_INTENTIONS}
          value={relationshipIntentions ?? []}
          onChange={(next) =>
            onRelationshipIntentionsChange((next as RelationshipIntention[]) ?? [])
          }
        />
      ) : null}

      {onGenotypesChange ? (
        <TapSelectField
          label="Genotype"
          optional
          multiple
          options={FILTER_GENOTYPES}
          value={genotypes ?? []}
          onChange={(next) => onGenotypesChange((next as Genotype[]) ?? [])}
        />
      ) : null}

      {onHasKidsOptionChange ? (
        <TapSelectField
          label="Has kids"
          optional
          options={HAS_KIDS_OPTIONS}
          value={hasKidsOption}
          onChange={(next) => onHasKidsOptionChange(next as HasKidsOption | undefined)}
        />
      ) : onHasKidsChange ? (
        <TapSelectField
          label="Has kids"
          optional
          multiple
          maxSelections={1}
          limitMessage="Choose one option."
          options={HAS_KIDS_OPTIONS}
          value={(hasKids ?? []).slice(0, 1)}
          onChange={(next) => onHasKidsChange((next as HasKidsOption[]) ?? [])}
        />
      ) : null}

      {onWantsKidsOptionChange ? (
        <TapSelectField
          label="Wants kids"
          optional
          options={WANTS_KIDS_OPTIONS}
          value={wantsKidsOption}
          onChange={(next) => onWantsKidsOptionChange(next as WantsKidsOption | undefined)}
        />
      ) : onWantsKidsChange ? (
        <TapSelectField
          label="Wants kids"
          optional
          multiple
          maxSelections={1}
          limitMessage="Choose one option."
          options={WANTS_KIDS_OPTIONS}
          value={(wantsKids ?? []).slice(0, 1)}
          onChange={(next) => onWantsKidsChange((next as WantsKidsOption[]) ?? [])}
        />
      ) : null}

      {onBodyTypeChange ? (
        <TapSelectField
          label="Body type"
          optional
          options={FILTER_BODY_TYPES}
          value={bodyType}
          onChange={(next) => onBodyTypeChange(next as import("../../types").BodyType | undefined)}
        />
      ) : onBodyTypesChange ? (
        <TapSelectField
          label="Body type"
          optional
          multiple
          maxSelections={1}
          limitMessage="Choose one body type."
          options={FILTER_BODY_TYPES}
          value={(bodyTypes ?? []).slice(0, 1)}
          onChange={(next) => onBodyTypesChange((next as import("../../types").BodyType[]) ?? [])}
        />
      ) : null}

      {onVerificationPreferencesChange ? (
        <TapSelectField
          label="Verification preference"
          optional
          multiple
          options={FILTER_VERIFICATION_PREFERENCES}
          value={verificationPreferences ?? []}
          onChange={(next) =>
            onVerificationPreferencesChange((next as VerificationPreference[]) ?? [])
          }
        />
      ) : null}
    </div>
  );
}
