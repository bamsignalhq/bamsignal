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
  statesOfOrigin?: string[];
  onStatesOfOriginChange?: (value: string[]) => void;
  relationshipIntentions?: RelationshipIntention[];
  onRelationshipIntentionsChange?: (value: RelationshipIntention[]) => void;
  genotypes?: Genotype[];
  onGenotypesChange?: (value: Genotype[]) => void;
  hasKids?: HasKidsOption[];
  onHasKidsChange?: (value: HasKidsOption[]) => void;
  wantsKids?: WantsKidsOption[];
  onWantsKidsChange?: (value: WantsKidsOption[]) => void;
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
  statesOfOrigin,
  onStatesOfOriginChange,
  relationshipIntentions,
  onRelationshipIntentionsChange,
  genotypes,
  onGenotypesChange,
  hasKids,
  onHasKidsChange,
  wantsKids,
  onWantsKidsChange,
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
          disabled={!searchState}
          options={cityOptions}
          value={searchCities ?? []}
          onChange={(next) => onSearchCitiesChange((next as string[]) ?? [])}
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

      {onStatesOfOriginChange ? (
        <TapSelectField
          label="State of origin"
          optional
          multiple
          options={STATE_OPTIONS}
          value={statesOfOrigin ?? []}
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

      {onHasKidsChange ? (
        <TapSelectField
          label="Has kids"
          optional
          multiple
          options={HAS_KIDS_OPTIONS}
          value={hasKids ?? []}
          onChange={(next) => onHasKidsChange((next as HasKidsOption[]) ?? [])}
        />
      ) : null}

      {onWantsKidsChange ? (
        <TapSelectField
          label="Wants kids"
          optional
          multiple
          options={WANTS_KIDS_OPTIONS}
          value={wantsKids ?? []}
          onChange={(next) => onWantsKidsChange((next as WantsKidsOption[]) ?? [])}
        />
      ) : null}

      {onBodyTypesChange ? (
        <TapSelectField
          label="Body type"
          optional
          multiple
          options={FILTER_BODY_TYPES}
          value={bodyTypes ?? []}
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
