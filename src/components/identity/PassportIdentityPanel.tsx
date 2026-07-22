import { WorkspaceSwitcher } from "../workspace/WorkspaceSwitcher";
import type { PersonaId } from "../../passport/personas/types";
import { isKnownPersonaId } from "../../passport/personas/registry";
import {
  buildPassportSummary,
  formatPassportId,
  getPassportIdentity,
  getPersonaDefinition,
  getSelectedPersonaId,
  getSelectedWorkspaceId,
  getWorkspaceDefinition,
  listReputationDimensions,
  listTrustDimensions,
  getReputationSnapshot,
  PASSPORT_PRODUCT_NAME
} from "../../passport";
import type { DatingProfile, UserProfile } from "../../types";
import { getVerificationTier } from "../../utils/verification";

type PassportIdentityPanelProps = {
  user: UserProfile;
  profile: DatingProfile;
  isPremium?: boolean;
};

function verificationLabel(status: string | undefined): string {
  if (status === "verified") return "Verified";
  if (status === "partial") return "Partially verified";
  return "Not verified";
}

function isKnownPersona(value: string): value is PersonaId {
  return isKnownPersonaId(value);
}

function confidenceLabel(level: string | undefined): string {
  if (level === "high") return "High confidence";
  if (level === "medium") return "Medium confidence";
  if (level === "low") return "Low confidence";
  return "Pending";
}

/**
 * Stankings Digital Trust Passport — BamSignal consumes Passport; product data stays separate.
 */
export function PassportIdentityPanel({ user, profile, isPremium }: PassportIdentityPanelProps) {
  const summary = buildPassportSummary();
  const identity = getPassportIdentity();
  const workspaceId = getSelectedWorkspaceId();
  const workspace = workspaceId ? getWorkspaceDefinition(workspaceId) : null;
  const personaId = getSelectedPersonaId();
  const persona = personaId && isKnownPersona(personaId) ? getPersonaDefinition(personaId) : null;
  const reputation = getReputationSnapshot();
  const trustedTier = getVerificationTier(profile, Boolean(isPremium), Boolean(user.phoneVerified)).label;
  const passportIdDisplay = formatPassportId(summary.passportId) ?? summary.passportId;

  return (
    <section className="card passport-identity-card" aria-labelledby="passport-identity-title">
      <header className="passport-identity-card__header">
        <p className="passport-identity-card__eyebrow">{PASSPORT_PRODUCT_NAME}</p>
        <h2 id="passport-identity-title" className="passport-identity-card__title">
          {PASSPORT_PRODUCT_NAME}
        </h2>
        <p className="passport-identity-card__passport-id-block">
          <span className="passport-identity-card__passport-id-label">Passport ID</span>
          <code className="passport-identity-card__passport-id">{passportIdDisplay}</code>
        </p>
        <p className="passport-identity-card__lede">
          One immutable passport across Stankings products. BamSignal contributes Social Trust — it does not own
          identity.
        </p>
      </header>

      <dl className="passport-identity-card__grid">
        <div>
          <dt>Display name</dt>
          <dd>{summary.identity.displayName}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{identity?.email || user.email || "—"}</dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>{identity?.phone || user.phone || "—"}</dd>
        </div>
        <div>
          <dt>Verification</dt>
          <dd>
            {verificationLabel(summary.identity.verificationStatus)} · {trustedTier}
          </dd>
        </div>
        <div>
          <dt>Identity confidence</dt>
          <dd>{confidenceLabel(summary.identity.identityConfidence)}</dd>
        </div>
        <div>
          <dt>Current workspace</dt>
          <dd>{workspace?.label ?? "Member"}</dd>
        </div>
        <div>
          <dt>Current persona</dt>
          <dd>{persona?.label ?? (isPremium ? "Premium Member" : "Dating Member")}</dd>
        </div>
        <div>
          <dt>Active products</dt>
          <dd>{summary.products.active.join(", ")}</dd>
        </div>
        <div>
          <dt>Member since</dt>
          <dd>{summary.timeline.memberSince ? new Date(summary.timeline.memberSince).toLocaleDateString() : "—"}</dd>
        </div>
      </dl>

      <div className="settings-workspace-switch passport-identity-card__switcher">
        <WorkspaceSwitcher currentWorkspaceId={workspaceId ?? "member"} variant="member" />
      </div>

      <details className="passport-identity-card__reputation">
        <summary>Trust dimensions (derived — not calculated yet)</summary>
        <ul>
          {listTrustDimensions().map((dimension) => {
            const row = summary.trust?.[dimension];
            return (
              <li key={dimension}>
                {row?.label ?? dimension}: {row?.confidence ?? "pending"}
                {row?.maturity ? ` · ${row.maturity}` : ""}
              </li>
            );
          })}
        </ul>
      </details>

      <details className="passport-identity-card__reputation">
        <summary>Behaviour reputation (prepared — products contribute signals)</summary>
        <ul>
          {listReputationDimensions().map((dimension) => (
            <li key={dimension}>
              {reputation.dimensions?.[dimension]?.label ?? dimension}: pending
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
