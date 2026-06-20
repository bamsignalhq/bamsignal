import {
  MAX_SEARCH_CITIES,
  normalizeSearchCities,
  SEARCH_CITIES_LIMIT_MESSAGE
} from "../../utils/searchLocationPrefs";
import { AgeRangeTapSelect } from "../AgeRangeTapSelect";
import { TapSelectField } from "../TapSelectField";
import {
  FAITH_OPTIONS,
  FILTER_BODY_TYPES,
  FILTER_GENOTYPES,
  FILTER_LIFESTYLES,
  FILTER_OCCUPATIONS,
  FILTER_TRIBE_OPTIONS,
  FILTER_VERIFICATION_PREFERENCES,
  HAS_KIDS_OPTIONS,
  LIFESTYLE_TRAITS_LIMIT_MESSAGE,
  MAX_LIFESTYLE_TRAITS,
  MAX_TRIBE_SELECTIONS,
  MAX_OPTIONAL_PREFERENCE_SELECTIONS,
  OPTIONAL_PREFERENCE_LIMIT_MESSAGE,
  normalizeBodyTypes,
  normalizeEthnicities,
  normalizeGenotypes,
  normalizeHasKidsOptions,
  normalizeOccupations,
  normalizeStatesOfOrigin,
  normalizeWantsKidsOptions,
  NIGERIAN_STATES,
  normalizeFaithList,
  normalizeLifestyleTraits,
  RELATIONSHIP_INTENTIONS,
  MAX_RELATIONSHIP_INTENTION_SELECTIONS,
  RELATIONSHIP_INTENTION_LIMIT_MESSAGE,
  TRIBE_GROUP_SECTIONS,
  TRIBE_SELECTION_LIMIT_MESSAGE,
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
  /** Profile — single genotype */
  genotype?: Genotype;
  onGenotypeChange?: (value: Genotype | undefined) => void;
  /** Profile — single occupation */
  occupation?: Occupation;
  onOccupationChange?: (value: Occupation | undefined) => void;
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
  /** Profile tribes — multi (max 3) */
  tribes?: EthnicBackground[];
  onTribesChange?: (value: EthnicBackground[]) => void;
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
  genotype,
  onGenotypeChange,
  occupation,
  onOccupationChange,
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
  tribes,
  onTribesChange,
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
          options={FAITH_OPTIONS}
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
          options={FAITH_OPTIONS}
          value={normalizeFaithList(religions ?? [])[0]}
          onChange={(next) => onReligionsChange(normalizeFaithList(next))}
        />
      ) : null}

      {onEthnicitiesChange ? (
        <TapSelectField
          label="Tribe"
          optional
          multiple
          maxSelections={MAX_TRIBE_SELECTIONS}
          limitMessage={TRIBE_SELECTION_LIMIT_MESSAGE}
          options={FILTER_TRIBE_OPTIONS}
          groupedOptions={TRIBE_GROUP_SECTIONS}
          value={normalizeEthnicities(ethnicities ?? [])}
          onChange={(next) =>
            onEthnicitiesChange(normalizeEthnicities((next as EthnicBackground[]) ?? []))
          }
        />
      ) : null}

      {onTribesChange ? (
        <TapSelectField
          label="Tribe"
          optional
          multiple
          maxSelections={MAX_TRIBE_SELECTIONS}
          limitMessage={TRIBE_SELECTION_LIMIT_MESSAGE}
          options={FILTER_TRIBE_OPTIONS}
          groupedOptions={TRIBE_GROUP_SECTIONS}
          value={normalizeEthnicities(tribes ?? [])}
          onChange={(next) =>
            onTribesChange(normalizeEthnicities((next as EthnicBackground[]) ?? []))
          }
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
          maxSelections={MAX_OPTIONAL_PREFERENCE_SELECTIONS}
          limitMessage={OPTIONAL_PREFERENCE_LIMIT_MESSAGE}
          options={FILTER_OCCUPATIONS}
          value={normalizeOccupations(occupations ?? [])}
          onChange={(next) =>
            onOccupationsChange(normalizeOccupations((next as Occupation[]) ?? []))
          }
        />
      ) : null}

      {onStatesOfOriginChange ? (
        <TapSelectField
          label="State of origin"
          optional
          multiple
          maxSelections={MAX_OPTIONAL_PREFERENCE_SELECTIONS}
          limitMessage={OPTIONAL_PREFERENCE_LIMIT_MESSAGE}
          options={STATE_OPTIONS}
          value={normalizeStatesOfOrigin(statesOfOrigin ?? [])}
          formatValue={stateDisplayLabel}
          onChange={(next) =>
            onStatesOfOriginChange(normalizeStatesOfOrigin((next as string[]) ?? []))
          }
        />
      ) : null}

      {onRelationshipIntentionsChange ? (
        <TapSelectField
          label="Relationship intention"
          optional
          multiple
          maxSelections={MAX_RELATIONSHIP_INTENTION_SELECTIONS}
          limitMessage={RELATIONSHIP_INTENTION_LIMIT_MESSAGE}
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
          maxSelections={MAX_OPTIONAL_PREFERENCE_SELECTIONS}
          limitMessage={OPTIONAL_PREFERENCE_LIMIT_MESSAGE}
          options={FILTER_GENOTYPES}
          value={normalizeGenotypes(genotypes ?? [])}
          onChange={(next) =>
            onGenotypesChange(normalizeGenotypes((next as Genotype[]) ?? []))
          }
        />
      ) : null}

      {onHasKidsChange ? (
        <TapSelectField
          label="Has kids"
          optional
          multiple
          maxSelections={MAX_OPTIONAL_PREFERENCE_SELECTIONS}
          limitMessage={OPTIONAL_PREFERENCE_LIMIT_MESSAGE}
          options={HAS_KIDS_OPTIONS}
          value={normalizeHasKidsOptions(hasKids ?? [])}
          onChange={(next) =>
            onHasKidsChange(normalizeHasKidsOptions((next as HasKidsOption[]) ?? []))
          }
        />
      ) : null}

      {onWantsKidsChange ? (
        <TapSelectField
          label="Wants kids"
          optional
          multiple
          maxSelections={MAX_OPTIONAL_PREFERENCE_SELECTIONS}
          limitMessage={OPTIONAL_PREFERENCE_LIMIT_MESSAGE}
          options={WANTS_KIDS_OPTIONS}
          value={normalizeWantsKidsOptions(wantsKids ?? [])}
          onChange={(next) =>
            onWantsKidsChange(normalizeWantsKidsOptions((next as WantsKidsOption[]) ?? []))
          }
        />
      ) : null}

      {onBodyTypesChange ? (
        <TapSelectField
          label="Body type"
          optional
          multiple
          maxSelections={MAX_OPTIONAL_PREFERENCE_SELECTIONS}
          limitMessage={OPTIONAL_PREFERENCE_LIMIT_MESSAGE}
          options={FILTER_BODY_TYPES}
          value={normalizeBodyTypes(bodyTypes ?? [])}
          onChange={(next) =>
            onBodyTypesChange(normalizeBodyTypes((next as import("../../types").BodyType[]) ?? []))
          }
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
