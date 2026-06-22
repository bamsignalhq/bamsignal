import { useCallback, useEffect, useMemo, useState } from "react";
import {
  INTRODUCTION_ENGINE_TITLE,
  MATCH_NOTE_EXAMPLES
} from "../../../constants/conciergeIntroduction";
import type { IntroductionRecord } from "../../../types/conciergeIntroduction";
import {
  createIntroductionCandidate,
  listIntroductionHistory,
  listPendingIntroductions,
  updateIntroductionMatchNotes
} from "../../../utils/IntroductionEngine";
import { listConciergeMembers } from "../../../utils/conciergeConsultantStore";
import { IntroductionCard } from "./IntroductionCard";
import { IntroductionCompatibilityCard } from "./IntroductionCompatibilityCard";
import { IntroductionHistoryPage } from "./IntroductionHistoryPage";
import { IntroductionOutcomeCard } from "./IntroductionOutcomeCard";
import { IntroductionTimeline } from "./IntroductionTimeline";
import { PendingIntroductionsTable } from "./PendingIntroductionsTable";
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

  const handleCreate = () => {
    if (!memberAId || !memberBId) {
      pushToast("Select two members.");
      return;
    }
    const created = createIntroductionCandidate({ memberAId, memberBId });
    if (!created) {
      pushToast("Could not create introduction — duplicate pair or invalid members.");
      return;
    }
    pushToast(`Introduction ${created.introductionId} created.`);
    setMemberAId("");
    setMemberBId("");
    setSelectedId(created.id);
    setView("workspace");
    refresh();
  };

  const handleAddMatchNote = (note: string) => {
    if (!selected) return;
    const next = [...selected.matchNotes, note];
    updateIntroductionMatchNotes(selected.id, next);
    refresh();
  };

  return (
    <div className="introduction-engine">
      <header className="introduction-engine__head">
        <div>
          <h2>{INTRODUCTION_ENGINE_TITLE}</h2>
          <p>Consultant-guided introductions with mutual consent at every step.</p>
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
          <section className="introduction-engine__create concierge-consultant-card--glass">
            <h3>Create Introduction</h3>
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
          </section>

          <section className="introduction-engine__pending concierge-consultant-card--glass">
            <h3>Pending introductions</h3>
            <PendingIntroductionsTable
              records={pending}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </section>

          {selected ? (
            <div className="introduction-engine__detail">
              <IntroductionCard record={selected} onUpdated={refresh} />
              <div className="introduction-engine__detail-grid">
                <IntroductionTimeline record={selected} />
                <IntroductionCompatibilityCard record={selected} />
                <IntroductionOutcomeCard record={selected} onUpdated={refresh} />
              </div>
              <section className="introduction-engine__match-notes concierge-consultant-card--glass">
                <h3>Match notes</h3>
                <p className="introduction-compatibility__private">Private — consultants only.</p>
                <div className="concierge-private-notes__examples">
                  {MATCH_NOTE_EXAMPLES.map((note) => (
                    <button
                      key={note}
                      type="button"
                      className="concierge-private-notes__chip"
                      onClick={() => handleAddMatchNote(note)}
                    >
                      {note}
                    </button>
                  ))}
                </div>
                {selected.matchNotes.length ? (
                  <ul className="introduction-engine__match-list">
                    {selected.matchNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="concierge-consultant__empty">No match notes yet.</p>
                )}
              </section>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
