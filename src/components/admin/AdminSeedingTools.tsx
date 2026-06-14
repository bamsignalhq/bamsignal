import { useState } from "react";
import { MOCK_PROFILES } from "../../data/mockProfiles";
import { STORAGE_KEYS } from "../../constants/limits";
import { readJson, writeJson } from "../../utils/storage";
import { usersByCity } from "../../utils/cityAnalytics";
import { approveVerification } from "../../utils/verificationQueue";
import { shadowBanId } from "../../utils/shadowBan";

type AdminSeedingToolsProps = {
  onMessage: (msg: string) => void;
};

export function AdminSeedingTools({ onMessage }: AdminSeedingToolsProps) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("Lagos");
  const [profileId, setProfileId] = useState(MOCK_PROFILES[0]?.id ?? "");

  const createDemoUser = () => {
    if (!name.trim()) {
      onMessage("Enter a name for the demo user.");
      return;
    }
    const leads = readJson<{ name: string; city: string; at: string }[]>(STORAGE_KEYS.launchLeads, []);
    writeJson(
      STORAGE_KEYS.launchLeads,
      [{ name: name.trim(), city, at: new Date().toISOString() }, ...leads].slice(0, 100)
    );
    onMessage(`Created launch lead: ${name.trim()} in ${city}.`);
    setName("");
  };

  const verifyUser = () => {
    approveVerification(profileId);
    onMessage(`Marked ${profileId} as verified in queue.`);
  };

  const featureProfile = () => {
    const boosts = readJson<Record<string, string>>(STORAGE_KEYS.activeBoosts, {});
    boosts[profileId] = new Date(Date.now() + 7 * 86400000).toISOString();
    writeJson(STORAGE_KEYS.activeBoosts, boosts);
    onMessage(`Featured ${profileId} for 7 days.`);
  };

  const suspendUser = () => {
    shadowBanId(profileId);
    onMessage(`Suspended ${profileId} (shadow ban).`);
  };

  const cityStats = usersByCity();

  return (
    <section className="admin-seeding card">
      <h3>Launch seeding tools</h3>
      <p>Create density, verify profiles, and curate discovery for launch cities.</p>

      <div className="admin-seeding__grid">
        <fieldset>
          <legend>Create user (lead)</legend>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
          <button type="button" className="btn-secondary" onClick={createDemoUser}>
            Create user
          </button>
        </fieldset>

        <fieldset>
          <legend>Profile actions</legend>
          <select value={profileId} onChange={(e) => setProfileId(e.target.value)}>
            {MOCK_PROFILES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.city}
              </option>
            ))}
          </select>
          <div className="admin-seeding__actions">
            <button type="button" className="btn-secondary" onClick={verifyUser}>
              Verify user
            </button>
            <button type="button" className="btn-secondary" onClick={featureProfile}>
              Feature profile
            </button>
            <button type="button" className="btn-secondary" onClick={suspendUser}>
              Suspend user
            </button>
          </div>
        </fieldset>
      </div>

      <h4>City analytics</h4>
      <ul className="admin-seeding__cities">
        {Object.entries(cityStats).map(([cityName, count]) => (
          <li key={cityName}>
            <span>{cityName}</span>
            <strong>{String(count)}</strong>
          </li>
        ))}
        {!Object.keys(cityStats).length && <li>No signup city data yet.</li>}
      </ul>
    </section>
  );
}
