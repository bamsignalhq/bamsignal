import { useCallback, useEffect, useMemo, useState } from "react";
import { INTRODUCTION_ENGINE_TITLE } from "../../../constants/conciergeIntroduction";
import type { IntroductionRecord } from "../../../types/conciergeIntroduction";
import {
  createIntroductionCandidate,
  getIntroductionCooldownForMembers,
  listIntroductionHistory,
  listPendingIntroductions
} from "../../../utils/IntroductionEngine";
import { listConciergeMembers } from "../../../utils/conciergeConsultantStore";
import { IntroductionCard } from "./IntroductionCard";
import { IntroductionCompatibilityCard } from "./IntroductionCompatibilityCard";
import { IntroductionConfidenceCard } from "./IntroductionConfidenceCard";
import { IntroductionCooldownCard } from "./IntroductionCooldownCard";
import { IntroductionHistoryPage } from "./IntroductionHistoryPage";
import { IntroductionNotesCard } from "./IntroductionNotesCard";
import { IntroductionOutcomeCard } from "./IntroductionOutcomeCard";
import { IntroductionTimeline } from "./IntroductionTimeline";
import { PendingIntroductionsTable } from "./PendingIntroductionsTable";
import { PrivateIntroductionCard } from "./PrivateIntroductionCard";
import { WhyWeThinkYouWillConnectCard } from "./WhyWeThinkYouWillConnectCard";
import { useAdminToast } from "../AdminToast";

type IntroductionEngineView = "workspace" | "history";

export function IntroductionEnginePage() {
  const { pushToast } = useAdminToast();
  const [records, setRecords] = useState<IntroductionRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [memberAId, setMemberAId] = useState("");
  const [memberBId, setMemberBId] = useState("");
  const [view, setView] = useState<IntroductionEngineView>("workspace");

  const members = useMemo(() => listConciergeMembers(), [records]);

  const refresh = useCallback(() => {
    setRecords(listIntroductionHistory());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const pending = useMemo(() => listPendingIntroductions(), [records]);
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const createCooldown = useMemo(() => {
    if (!memberAId || !memberBId) return null;
    return getIntroductionCooldownForMembers(memberAId, memberBId);
  }, [memberAId, memberBId, records]);

  const handleCreate = () => {
    if (!memberAId || !memberBId) {
      pushToast("Select two members.");
      return;
    }
    if (createCooldown?.memberA.blocked || createCooldown?.memberB.blocked) {
      pushToast("Introduction cooldown — a member already has two active introductions.");
      return;
    }
    const created = createIntroductionCandidate({ memberAId, memberBId });
    if (!created) {
      pushToast("Could not create introduction — duplicate pair, cooldown, or invalid members.");
      return;
    }
    pushToast(`Thoughtful Introduction ${created.introductionId} created.`);
    setMemberAId("");
    setMemberBId("");
    setSelectedId(created.id);
    setView("workspace");
    refresh();
  };

  return (
    <div className="introduction-engine">
      <header className="introduction-engine__head">
        <div>
          <h2>{INTRODUCTION_ENGINE_TITLE}</h2>
          <p>Human, private, intentional introductions — never algorithmic.</p>
        </div>
        <div className="introduction-engine__tabs">
          <button
            type="button"
            className={`concierge-consultant-btn${view === "workspace" ? " is-active" : ""}`}
            onClick={() => setView("workspace")}
          >
            Workspace
          </button>
          <button
            type="button"
            className={`concierge-consultant-btn${view === "history" ? " is-active" : ""}`}
            onClick={() => setView("history")}
          >
            History
          </button>
        </div>
      </header>

      {view === "history" ? (
        <IntroductionHistoryPage
          records={records}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id);
            setView("workspace");
          }}
        />
      ) : (
        <>
          <PrivateIntroductionCard records={records} />

          <section className="introduction-engine__create concierge-consultant-card--glass">
            <h3>Create Thoughtful Introduction</h3>
            <div className="introduction-engine__create-grid">
              <label>
                Journey A
                <select value={memberAId} onChange={(event) => setMemberAId(event.target.value)}>
                  <option value="">Select member</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.aboutYou.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Journey B
                <select value={memberBId} onChange={(event) => setMemberBId(event.target.value)}>
                  <option value="">Select member</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.aboutYou.name}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className="concierge-consultant-btn" onClick={handleCreate}>
                Create candidate
              </button>
            </div>
            {memberAId && memberBId ? (
              <IntroductionCooldownCard memberAId={memberAId} memberBId={memberBId} />
            ) : null}
          </section>

          <section className="introduction-engine__pending concierge-consultant-card--glass">
            <h3>Pending introductions</h3>
            <PendingIntroductionsTable records={pending} selectedId={selectedId} onSelect={setSelectedId} />
          </section>

          {selected ? (
            <div className="introduction-engine__detail">
              <IntroductionCard record={selected} onUpdated={refresh} />
              <div className="introduction-engine__detail-grid">
                <IntroductionTimeline record={selected} />
                <IntroductionCompatibilityCard record={selected} />
                <IntroductionConfidenceCard record={selected} onUpdated={refresh} />
                <WhyWeThinkYouWillConnectCard record={selected} onUpdated={refresh} />
                <IntroductionOutcomeCard record={selected} onUpdated={refresh} />
                <IntroductionNotesCard record={selected} onUpdated={refresh} />
                <IntroductionCooldownCard record={selected} />
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
