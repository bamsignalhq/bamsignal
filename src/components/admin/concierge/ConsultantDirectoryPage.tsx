import { useCallback, useEffect, useState } from "react";
import {
  CONCIERGE_ANTI_POACHING_COPY,
  CONCIERGE_CONSULTANT_ROLES,
  CONCIERGE_DIRECTORY_SUBTITLE,
  CONCIERGE_DIRECTORY_TITLE
} from "../../../constants/conciergeConsultantRoles";
import {
  CONCIERGE_COMMUNICATION_POLICY_COPY,
  CONCIERGE_SPECIALIST_FUTURE_LANES
} from "../../../constants/conciergeConsultantCommunication";
import {
  assignAdminConciergeConsultantRoles,
  fetchAdminConciergeConsultantPortfolio,
  fetchAdminConciergeConsultants,
  inviteAdminConciergeConsultant,
  setAdminConciergeConsultantStatus
} from "../../../services/adminConcierge";
import type { ConciergeConsultantRecord } from "../../../types/conciergeConsultantDirectory";
import type { ConciergeConsultantRoleId } from "../../../constants/conciergeConsultantRoles";
import { computeConsultantMetrics } from "../../../utils/conciergeConsultantMetrics";
import { listMembersForConsultant } from "../../../utils/conciergeConsultantDirectoryStore";
import { ConsultantProfileCard } from "./ConsultantProfileCard";
import { ConsultantPortfolioPage } from "./ConsultantPortfolioPage";
import { useAdminToast } from "../AdminToast";

type ConsultantDirectoryPageProps = {
  onSelectConsultant?: (consultantId: string | null) => void;
  selectedConsultantId?: string | null;
};

export function ConsultantDirectoryPage({
  onSelectConsultant,
  selectedConsultantId = null
}: ConsultantDirectoryPageProps) {
  const { pushToast } = useAdminToast();
  const [consultants, setConsultants] = useState<ConciergeConsultantRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [roleEditorId, setRoleEditorId] = useState<string | null>(null);
  const [roleDraft, setRoleDraft] = useState<ConciergeConsultantRoleId[]>([]);
  const [primaryRoleDraft, setPrimaryRoleDraft] = useState<ConciergeConsultantRoleId | "">("");

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchAdminConciergeConsultants();
    setConsultants(result.consultants);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleInvite = async () => {
    const result = await inviteAdminConciergeConsultant({
      name: inviteName,
      email: inviteEmail
    });
    if (!result.ok) {
      pushToast("Could not invite consultant.");
      return;
    }
    pushToast("Consultant invited.");
    setInviteName("");
    setInviteEmail("");
    await load();
  };

  const handleStatus = async (
    consultantId: string,
    status: ConciergeConsultantRecord["status"]
  ) => {
    const result = await setAdminConciergeConsultantStatus(consultantId, status);
    if (!result.ok) {
      pushToast("Could not update consultant status.");
      return;
    }
    pushToast("Consultant status updated.");
    await load();
  };

  const handleSaveRoles = async (consultantId: string) => {
    if (!roleDraft.length) return;
    const result = await assignAdminConciergeConsultantRoles(
      consultantId,
      roleDraft,
      primaryRoleDraft || roleDraft[0]
    );
    if (!result.ok) {
      pushToast("Could not update roles.");
      return;
    }
    pushToast("Consultant roles updated.");
    setRoleEditorId(null);
    await load();
  };

  if (selectedConsultantId) {
    return (
      <ConsultantPortfolioPage
        consultantId={selectedConsultantId}
        mode="admin"
        onBack={() => onSelectConsultant?.(null)}
      />
    );
  }

  return (
    <div className="consultant-directory-page">
      <header className="consultant-directory-page__head">
        <div>
          <h2>{CONCIERGE_DIRECTORY_TITLE}</h2>
          <p>{CONCIERGE_DIRECTORY_SUBTITLE}</p>
        </div>
      </header>

      <section className="consultant-directory-page__policy concierge-consultant-card--glass cc-reveal">
        <p>{CONCIERGE_COMMUNICATION_POLICY_COPY}</p>
        <p>{CONCIERGE_ANTI_POACHING_COPY}</p>
      </section>

      <section className="consultant-directory-page__invite concierge-consultant-card--glass cc-reveal">
        <h3>Invite consultant</h3>
        <div className="consultant-directory-page__invite-grid">
          <label>
            Name
            <input value={inviteName} onChange={(event) => setInviteName(event.target.value)} />
          </label>
          <label>
            Email
            <input
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="concierge-consultant-btn"
            disabled={!inviteName.trim() || !inviteEmail.trim()}
            onClick={() => void handleInvite()}
          >
            Send invite
          </button>
        </div>
      </section>

      {loading ? <p className="concierge-consultant__empty">Loading consultants…</p> : null}

      <div className="consultant-directory-page__grid">
        {consultants.map((consultant) => {
          const members = listMembersForConsultant(consultant.id);
          const metrics = computeConsultantMetrics(members);
          return (
            <div key={consultant.id} className="consultant-directory-page__card-wrap">
              <ConsultantProfileCard
                consultant={consultant}
                metrics={metrics}
                memberCount={members.length}
                selected={selectedConsultantId === consultant.id}
                onSelect={() => onSelectConsultant?.(consultant.id)}
                onActivate={() => void handleStatus(consultant.id, "active")}
                onDeactivate={() => void handleStatus(consultant.id, "inactive")}
                onFreeze={() => void handleStatus(consultant.id, "frozen")}
              />
              <div className="consultant-directory-page__role-editor">
                <button
                  type="button"
                  className="concierge-consultant-btn"
                  onClick={() => {
                    setRoleEditorId(consultant.id);
                    setRoleDraft(consultant.roles);
                    setPrimaryRoleDraft(consultant.primaryRole);
                  }}
                >
                  Assign roles
                </button>
                {roleEditorId === consultant.id ? (
                  <div className="consultant-directory-page__role-form">
                    {CONCIERGE_CONSULTANT_ROLES.map((role) => {
                      const checked = roleDraft.includes(role.id);
                      return (
                        <label key={role.id} className="consultant-directory-page__role-check">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setRoleDraft((current) =>
                                checked
                                  ? current.filter((item) => item !== role.id)
                                  : [...current, role.id]
                              )
                            }
                          />
                          {role.label}
                        </label>
                      );
                    })}
                    <label>
                      Primary role
                      <select
                        value={primaryRoleDraft}
                        onChange={(event) =>
                          setPrimaryRoleDraft(event.target.value as ConciergeConsultantRoleId)
                        }
                      >
                        {roleDraft.map((roleId) => (
                          <option key={roleId} value={roleId}>
                            {CONCIERGE_CONSULTANT_ROLES.find((role) => role.id === roleId)?.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      className="concierge-consultant-btn"
                      onClick={() => void handleSaveRoles(consultant.id)}
                    >
                      Save roles
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <section className="consultant-directory-page__future concierge-consultant-card--glass cc-reveal">
        <h3>Future specialist lanes</h3>
        <p>Architecture reserved — not implemented.</p>
        <ul className="consultant-directory-page__future-list">
          {CONCIERGE_SPECIALIST_FUTURE_LANES.map((lane) => (
            <li key={lane.id}>{lane.label}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
