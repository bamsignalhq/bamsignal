import { useCallback, useEffect, useMemo, useState } from "react";
import { INTRODUCTION_ENGINE_TITLE } from "../../../constants/conciergeIntroduction";
import type { IntroductionRecord } from "../../../types/conciergeIntroduction";
import {
  createIntroductionCandidate,
  listIntroductionHistory,
  listPendingIntroductions
} from "../../../utils/IntroductionEngine";
import { listConciergeMembers } from "../../../utils/conciergeConsultantStore";
import { IntroductionCard } from "./IntroductionCard";
import { IntroductionHistoryCard } from "./IntroductionHistoryCard";
import { PendingIntroductionsTable } from "./PendingIntroductionsTable";
import { useAdminToast } from "../AdminToast";

export function IntroductionEnginePanel() {
  const { pushToast } = useAdminToast();
  const [records, setRecords] = useState<IntroductionRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [memberAId, setMemberAId] = useState("");
  const [memberBId, setMemberBId] = useState("");

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
      pushToast("Could not create introduction.");
      return;
    }
    pushToast("Introduction candidate created.");
    setMemberAId("");
    setMemberBId("");
    setSelectedId(created.id);
    refresh();
  };

  return (
    <div className="introduction-engine">
      <header className="introduction-engine__head">
        <div>
          <h2>{INTRODUCTION_ENGINE_TITLE}</h2>
          <p>Consultant-guided introductions with mutual consent at every step.</p>
        </div>
      </header>

      <section className="introduction-engine__create concierge-consultant-card--glass">
        <h3>Create introduction</h3>
        <div className="introduction-engine__create-grid">
          <label>
            Member A
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
            Member B
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
        <IntroductionCard record={selected} onUpdated={refresh} />
      ) : null}

      <IntroductionHistoryCard engineRecords={records} />
    </div>
  );
}
