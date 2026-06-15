import { useEffect, useState } from "react";
import { DEFAULT_CMS, getCms, saveCms, type CmsContent } from "../constants/cms";
import {
  DEFAULT_DISCOVER_CITY_CONFIG,
  DISCOVER_SUPPORTED_CITIES,
  getDiscoverCityConfig,
  saveDiscoverCityConfig,
  type DiscoverCityConfig
} from "../constants/discoverCityConfig";
import { LAUNCH_PRIMARY_CITIES } from "../constants/seedCities";
import { STORAGE_KEYS } from "../constants/limits";
import { AdminPricingPage } from "./AdminPricingPage";
import {
  approveVerification,
  getPendingVerifications,
  pendingCount,
  rejectVerification
} from "../utils/verificationQueue";
import { countEvent, countEventToday, dailyActiveUsersToday } from "../utils/analytics";
import {
  cityLeaderboard,
  dauByCity,
  fastestGrowingCity,
  mostActiveCityToday,
  premiumRevenueByCity,
  profileCompletionByCity,
  signalsByCity,
  topCityByEvent,
  usersByCity
} from "../utils/cityAnalytics";
import { getLaunchLeads } from "../utils/launchLeads";
import { readJson } from "../utils/storage";
import { verifyAdminSession } from "../services/plans";
import { supabase } from "../services/supabase";
import { isAdminSessionActive } from "../utils/adminSession";
import { ADMIN_AUTH_PATH, navigateToPath } from "../constants/routes";
import { DEMO_USER } from "../constants/demoAccounts";
import { getModerationQueue, moderationStats } from "../utils/moderationQueue";
import { liftShadowBan, memberShadowKey, shadowBanId } from "../utils/shadowBan";
import {
  fetchAdminCityMembers,
  setAdminCityHomeHidden,
  setAdminCityPlacement,
  type CityHomeMember
} from "../services/cityHome";
import { CITIES_VISUAL } from "../data/visualLanding";
import { AdminBusinessDashboard } from "../components/admin/AdminBusinessDashboard";
import { AdminSeedingTools } from "../components/admin/AdminSeedingTools";
import { getLaunchConfig, saveLaunchConfig } from "../utils/launchConfig";
import {
  DEFAULT_EMAIL_BRANDING,
  type EmailBrandingSettings
} from "../constants/emailBranding";
import { fetchEmailBranding, saveEmailBrandingAdmin } from "../services/emailBranding";

type AdminHubPageProps = {
  onBack: () => void;
};

type AdminTab =
  | "command"
  | "overview"
  | "business"
  | "users"
  | "reports"
  | "cities"
  | "discover"
  | "cityhome"
  | "pricing"
  | "verifications"
  | "content"
  | "email"
  | "leads";

export function AdminHubPage({ onBack }: AdminHubPageProps) {
  const [tab, setTab] = useState<AdminTab>("command");
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [cmsDraft, setCmsDraft] = useState<CmsContent>(() => getCms());
  const [discoverDraft, setDiscoverDraft] = useState<DiscoverCityConfig>(() => getDiscoverCityConfig());
  const [rejectReason, setRejectReason] = useState("");
  const [verifications, setVerifications] = useState(getPendingVerifications());
  const [leads, setLeads] = useState(getLaunchLeads());
  const [moderation, setModeration] = useState(getModerationQueue());
  const modStats = moderationStats();
  const [cityHomeCity, setCityHomeCity] = useState(CITIES_VISUAL[0]?.name || "Lagos");
  const [cityHomeMembers, setCityHomeMembers] = useState<CityHomeMember[]>([]);
  const [cityHomeLoading, setCityHomeLoading] = useState(false);
  const [cityHomeMessage, setCityHomeMessage] = useState("");
  const [seedMessage, setSeedMessage] = useState("");
  const [emailBrandingDraft, setEmailBrandingDraft] = useState<EmailBrandingSettings>(DEFAULT_EMAIL_BRANDING);
  const [emailBrandingMessage, setEmailBrandingMessage] = useState("");
  const launchConfig = getLaunchConfig();

  const loadCityHomeMembers = async (city = cityHomeCity) => {
    setCityHomeLoading(true);
    setCityHomeMessage("");
    const data = await fetchAdminCityMembers(city);
    setCityHomeLoading(false);
    if (!data) {
      setCityHomeMessage("Could not load city members. Check database connection and admin session.");
      setCityHomeMembers([]);
      return;
    }
    setCityHomeMembers(data.members);
  };

  useEffect(() => {
    if (tab !== "email" || !authorized) return;
    void fetchEmailBranding().then(setEmailBrandingDraft);
  }, [tab, authorized]);

  useEffect(() => {
    if (tab !== "cityhome" || !authorized) return;
    void loadCityHomeMembers(cityHomeCity);
  }, [tab, authorized, cityHomeCity]);

  useEffect(() => {
    if (isAdminSessionActive()) {
      setAuthorized(true);
      return;
    }
    supabase?.auth.getSession().then(async ({ data }) => {
      const ok = await verifyAdminSession(data.session?.access_token);
      setAuthorized(ok);
      if (!ok) navigateToPath(ADMIN_AUTH_PATH);
    });
  }, []);

  if (authorized === null) {
    return (
      <div className="page admin-page">
        <p>Checking admin access…</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="page admin-page empty-state">
        <h2>Admin access required</h2>
        <p>Log in with an approved admin account.</p>
        <button type="button" className="btn-secondary" onClick={onBack}>
          Back to app
        </button>
      </div>
    );
  }

  const blocked = readJson<string[]>(STORAGE_KEYS.blocked, []).length;
  const reports = readJson<unknown[]>(STORAGE_KEYS.reports, []).length;

  const dayMs = 24 * 60 * 60 * 1000;
  const signalsTodayByCity = signalsByCity(dayMs);
  const premiumTodayByCity = premiumRevenueByCity(dayMs);

  const cityHighlights = [
    { label: "Top city (signups)", value: topCityByEvent("signup_completed") },
    { label: "Most active city today", value: mostActiveCityToday() },
    { label: "Fastest growing (7d)", value: fastestGrowingCity() }
  ];

  const successMetrics = [
    { label: "New users today", value: countEventToday("signup_completed") },
    { label: "Profiles completed today", value: countEventToday("profile_completed") },
    { label: "Signals sent today", value: countEventToday("signal_sent") },
    { label: "Signals accepted today", value: countEventToday("signal_accepted") },
    { label: "Messages started today", value: countEventToday("message_started") },
    { label: "Premium upgrades today", value: countEventToday("payment_successful") },
    { label: "Daily active users", value: dailyActiveUsersToday() },
    { label: "Waitlist leads", value: leads.length }
  ];

  const stats = [
    ...successMetrics,
    { label: "Total signups", value: countEvent("signup_completed") },
    { label: "Total signals sent", value: countEvent("signal_sent") },
    { label: "Profile views", value: countEvent("profile_viewed") },
    { label: "Reports", value: reports },
    { label: "Blocked users", value: blocked },
    { label: "Pending verifications", value: pendingCount() }
  ];

  return (
    <div className="page admin-hub">
      <header className="page-header admin-hub__head">
        <button type="button" className="link-btn" onClick={onBack}>
          ← Back
        </button>
        <h2>Command center</h2>
        <p className="admin-hub__subtitle">Run the platform — moderation, pricing, content, and live ops.</p>
      </header>

      <nav className="admin-tabs" aria-label="Admin sections">
        {(
          [
            ["command", "Command"],
            ["overview", "Metrics"],
            ["business", "Business"],
            ["users", "Users"],
            ["reports", `Reports (${modStats.totalReports})`],
            ["cities", "Cities"],
            ["discover", "Discover"],
            ["cityhome", "City home"],
            ["leads", `Leads (${leads.length})`],
            ["verifications", `Verify (${pendingCount()})`],
            ["pricing", "Pricing"],
            ["content", "Content"],
            ["email", "Email"]
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={tab === id ? "active" : ""}
            onClick={() => {
              setTab(id);
              if (id === "leads") setLeads(getLaunchLeads());
              if (id === "command") setModeration(getModerationQueue());
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "command" && (
        <>
          <section className="admin-stats-grid admin-stats-grid--highlight admin-command-stats">
            <div className="card admin-stat admin-stat--highlight">
              <strong>{modStats.flaggedProfiles}</strong>
              <span>Flagged (3+ reports)</span>
            </div>
            <div className="card admin-stat admin-stat--highlight">
              <strong>{modStats.pendingReview}</strong>
              <span>Awaiting shadow ban</span>
            </div>
            <div className="card admin-stat admin-stat--highlight">
              <strong>{modStats.shadowBanned}</strong>
              <span>Shadow banned</span>
            </div>
            <div className="card admin-stat admin-stat--highlight">
              <strong>{modStats.totalReports}</strong>
              <span>Total reports</span>
            </div>
          </section>

          <section className="card admin-command-panel">
            <h3>Moderation queue</h3>
            <p className="match-prefs-note">
              Shadow banned users stay in the app and can pay — but their signals and messages never reach
              anyone. Use after 3+ reports.
            </p>
            <div className="admin-command-actions">
              {import.meta.env.DEV && (
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => {
                    shadowBanId(memberShadowKey(DEMO_USER.profile.phone, DEMO_USER.profile.email));
                    setModeration(getModerationQueue());
                  }}
                >
                  Shadow ban demo member (test)
                </button>
              )}
              <button type="button" className="btn-secondary btn-sm" onClick={() => setTab("pricing")}>
                Pricing →
              </button>
            </div>
            {moderation.length === 0 && <p className="admin-empty">No reports filed yet.</p>}
            {moderation.map((entry) => (
              <article
                key={entry.profileId}
                className={`card admin-moderation-row ${entry.reportCount >= 3 ? "admin-moderation-row--hot" : ""}`}
              >
                <div className="admin-moderation-row__main">
                  <strong>{entry.name}</strong>
                  <span>
                    {entry.city} · {entry.reportCount} report{entry.reportCount === 1 ? "" : "s"}
                    {entry.shadowBanned ? " · shadow banned" : ""}
                  </span>
                  {entry.lastReason && (
                    <small>Latest: {entry.lastReason.replace(/_/g, " ")}</small>
                  )}
                </div>
                <div className="admin-moderation-row__actions">
                  {entry.shadowBanned ? (
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={() => {
                        liftShadowBan(entry.profileId);
                        setModeration(getModerationQueue());
                      }}
                    >
                      Lift shadow ban
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-primary btn-sm"
                      disabled={entry.reportCount < 3}
                      title={entry.reportCount < 3 ? "Requires 3+ reports" : "Shadow ban profile"}
                      onClick={() => {
                        shadowBanId(entry.profileId);
                        setModeration(getModerationQueue());
                      }}
                    >
                      Shadow ban
                    </button>
                  )}
                </div>
              </article>
            ))}
          </section>

          <section className="admin-stats-grid">
            {successMetrics.slice(0, 4).map((s) => (
              <div key={s.label} className="card admin-stat">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </section>
        </>
      )}

      {tab === "overview" && (
        <>
          <h3 className="admin-section-title">Today</h3>
          <section className="admin-stats-grid admin-stats-grid--highlight">
            {successMetrics.slice(0, 7).map((s) => (
              <div key={s.label} className="card admin-stat admin-stat--highlight">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </section>
          <h3 className="admin-section-title">All time</h3>
          <section className="admin-stats-grid">
            {stats.slice(7).map((s) => (
              <div key={s.label} className="card admin-stat">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </section>
        </>
      )}

      {tab === "business" && <AdminBusinessDashboard />}

      {tab === "users" && (
        <>
          <section className="admin-stats-grid admin-stats-grid--highlight">
            <div className="card admin-stat admin-stat--highlight">
              <strong>{countEvent("signup_completed")}</strong>
              <span>Total signups</span>
            </div>
            <div className="card admin-stat admin-stat--highlight">
              <strong>{dailyActiveUsersToday()}</strong>
              <span>Daily active users</span>
            </div>
            <div className="card admin-stat admin-stat--highlight">
              <strong>{blocked}</strong>
              <span>Blocked users</span>
            </div>
            <div className="card admin-stat admin-stat--highlight">
              <strong>{modStats.shadowBanned}</strong>
              <span>Shadow banned</span>
            </div>
          </section>

          <h3 className="admin-section-title">Users & engagement by city</h3>
          <section className="admin-city-table card">
            {cityLeaderboard(usersByCity()).map((row) => (
              <div key={row.city} className="admin-city-row">
                <span>{row.city}</span>
                <span>{row.value} users</span>
              </div>
            ))}
            {!cityLeaderboard(usersByCity()).length && (
              <p className="admin-empty">No city signup data yet.</p>
            )}
          </section>

          <h3 className="admin-section-title">Profile completion by city</h3>
          <section className="admin-city-table card">
            {cityLeaderboard(profileCompletionByCity()).map((row) => (
              <div key={row.city} className="admin-city-row">
                <span>{row.city}</span>
                <strong>{row.value}%</strong>
              </div>
            ))}
          </section>

          <AdminSeedingTools onMessage={setSeedMessage} />
          {seedMessage && <p className="admin-toast" role="status">{seedMessage}</p>}
        </>
      )}

      {tab === "reports" && (
        <section className="card admin-command-panel">
          <h3>Reports queue</h3>
          <p className="match-prefs-note">
            {modStats.totalReports} total report{modStats.totalReports === 1 ? "" : "s"} ·{" "}
            {modStats.flaggedProfiles} flagged · {modStats.pendingReview} awaiting review
          </p>
          {moderation.length === 0 && <p className="admin-empty">No reports filed yet.</p>}
          {moderation.map((entry) => (
            <article
              key={entry.profileId}
              className={`card admin-moderation-row ${entry.reportCount >= 3 ? "admin-moderation-row--hot" : ""}`}
            >
              <div className="admin-moderation-row__main">
                <strong>{entry.name}</strong>
                <span>
                  {entry.city} · {entry.reportCount} report{entry.reportCount === 1 ? "" : "s"}
                  {entry.shadowBanned ? " · shadow banned" : ""}
                </span>
                {entry.lastReportAt && (
                  <time>{new Date(entry.lastReportAt).toLocaleString()}</time>
                )}
                {entry.lastReason && <small>Latest: {entry.lastReason.replace(/_/g, " ")}</small>}
              </div>
              <div className="admin-moderation-row__actions">
                <button type="button" className="btn-secondary btn-sm" onClick={() => setTab("command")}>
                  Review in Command
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {tab === "cities" && (
        <>
          <section className="admin-stats-grid admin-stats-grid--highlight">
            {cityHighlights.map((s) => (
              <div key={s.label} className="card admin-stat admin-stat--highlight">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </section>

          <h3 className="admin-section-title">Signals sent today by city</h3>
          <section className="admin-city-table card">
            {cityLeaderboard(signalsTodayByCity).map((row) => (
              <div key={row.city} className="admin-city-row">
                <span>{row.city}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
            {!cityLeaderboard(signalsTodayByCity).length && (
              <p className="admin-empty">No signals yet today.</p>
            )}
          </section>

          <h3 className="admin-section-title">Premium revenue today by city (est.)</h3>
          <section className="admin-city-table card">
            {cityLeaderboard(premiumTodayByCity).map((row) => (
              <div key={row.city} className="admin-city-row">
                <span>{row.city}</span>
                <strong>₦{row.value.toLocaleString("en-NG")}</strong>
              </div>
            ))}
            {!cityLeaderboard(premiumTodayByCity).length && (
              <p className="admin-empty">No premium upgrades yet today.</p>
            )}
          </section>

          <h3 className="admin-section-title">Users & engagement by city</h3>
          <section className="admin-city-table card">
            {cityLeaderboard(usersByCity()).map((row) => {
              const dau = dauByCity()[row.city] ?? 0;
              const completed = profileCompletionByCity()[row.city] ?? 0;
              return (
                <div key={row.city} className="admin-city-row admin-city-row--wide">
                  <span>{row.city}</span>
                  <span>{row.value} users</span>
                  <span>{completed} completed</span>
                  <strong>{dau} DAU</strong>
                </div>
              );
            })}
          </section>
        </>
      )}

      {tab === "leads" && (
        <section className="admin-leads">
          {leads.length === 0 && <p className="admin-empty">No launch leads yet.</p>}
          {leads.map((lead) => (
            <article key={lead.id} className="card admin-lead-row">
              <strong>{lead.email || lead.phone}</strong>
              {lead.email && lead.phone && <span>{lead.phone}</span>}
              {lead.city && <span>{lead.city}</span>}
              <time>{new Date(lead.at).toLocaleString()}</time>
            </article>
          ))}
        </section>
      )}

      {tab === "verifications" && (
        <section className="admin-verifications">
          {verifications.filter((v) => v.status === "pending").length === 0 && (
            <p className="admin-empty">No pending verifications.</p>
          )}
          {verifications
            .filter((v) => v.status === "pending")
            .map((v) => (
              <article key={v.id} className="card admin-verification-row">
                <div>
                  <strong>{v.userName}</strong>
                  <span>{v.phone}</span>
                  <time>{new Date(v.submittedAt).toLocaleString()}</time>
                </div>
                <div className="admin-verification-actions">
                  <input
                    type="text"
                    placeholder="Reject reason (optional)"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-primary btn-sm"
                    onClick={() => {
                      approveVerification(v.id);
                      setVerifications(getPendingVerifications());
                    }}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={() => {
                      rejectVerification(v.id, rejectReason || "Did not meet guidelines");
                      setVerifications(getPendingVerifications());
                      setRejectReason("");
                    }}
                  >
                    Reject
                  </button>
                </div>
              </article>
            ))}
        </section>
      )}

      {tab === "discover" && (
        <>
        <section className="card admin-launch-config">
          <h3>Launch experiments</h3>
          <label className="admin-discover-city__toggle">
            <input
              type="checkbox"
              checked={launchConfig.premiumTrialEnabled}
              onChange={(e) => saveLaunchConfig({ premiumTrialEnabled: e.target.checked })}
            />
            24-hour Signal Pass trial for new signups
          </label>
          <label className="admin-discover-city__toggle">
            <input
              type="checkbox"
              checked={launchConfig.socialProofEnabled}
              onChange={(e) => saveLaunchConfig({ socialProofEnabled: e.target.checked })}
            />
            Show success stories section (only when real content exists)
          </label>
        </section>
        <section className="card admin-cms admin-discover-city">
          <h3>Discover city header</h3>
          <p className="match-prefs-note">
            Launch mode avoids fake counts. Real data mode shows counts only when activity meets the threshold.
          </p>

          <label className="admin-discover-city__toggle">
            <input
              type="checkbox"
              checked={discoverDraft.launchMode}
              onChange={(e) => setDiscoverDraft({ ...discoverDraft, launchMode: e.target.checked })}
            />
            Launch mode (growth copy instead of counts)
          </label>

          <label>
            Real data threshold (min active profiles in city)
            <input
              type="number"
              min={1}
              max={50}
              value={discoverDraft.realDataMinActive}
              onChange={(e) =>
                setDiscoverDraft({
                  ...discoverDraft,
                  realDataMinActive: Math.max(1, Number(e.target.value) || 5)
                })
              }
            />
          </label>

          <label>
            Activity rotator (one line per message)
            <textarea
              rows={5}
              value={discoverDraft.activityRotator.join("\n")}
              onChange={(e) =>
                setDiscoverDraft({
                  ...discoverDraft,
                  activityRotator: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean)
                })
              }
            />
          </label>

          <label>
            Confidence rotator (one line per message)
            <textarea
              rows={4}
              value={discoverDraft.confidenceRotator.join("\n")}
              onChange={(e) =>
                setDiscoverDraft({
                  ...discoverDraft,
                  confidenceRotator: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean)
                })
              }
            />
          </label>

          <h4 className="admin-section-title">City headlines & launch activity</h4>
          <div className="admin-discover-city__grid">
            {DISCOVER_SUPPORTED_CITIES.map((city) => (
              <div key={city} className="admin-discover-city__city-block">
                <strong>{city}</strong>
                <label>
                  Headline
                  <input
                    value={discoverDraft.cityHeadlines[city] ?? ""}
                    onChange={(e) =>
                      setDiscoverDraft({
                        ...discoverDraft,
                        cityHeadlines: { ...discoverDraft.cityHeadlines, [city]: e.target.value }
                      })
                    }
                  />
                </label>
                <label>
                  Launch activity message
                  <input
                    value={discoverDraft.launchActivityMessages[city] ?? ""}
                    onChange={(e) =>
                      setDiscoverDraft({
                        ...discoverDraft,
                        launchActivityMessages: {
                          ...discoverDraft.launchActivityMessages,
                          [city]: e.target.value
                        }
                      })
                    }
                  />
                </label>
              </div>
            ))}
          </div>

          <h4 className="admin-section-title">City priorities (comma-separated)</h4>
          {LAUNCH_PRIMARY_CITIES.map((primary) => (
            <label key={primary}>
              {primary} priority order
              <input
                value={(discoverDraft.cityPriorities[primary] ?? []).join(", ")}
                onChange={(e) =>
                  setDiscoverDraft({
                    ...discoverDraft,
                    cityPriorities: {
                      ...discoverDraft.cityPriorities,
                      [primary]: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    }
                  })
                }
              />
            </label>
          ))}

          <div className="admin-cms-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => saveDiscoverCityConfig(discoverDraft)}
            >
              Save discover settings
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setDiscoverDraft({ ...DEFAULT_DISCOVER_CITY_CONFIG })}
            >
              Reset defaults
            </button>
          </div>
        </section>
        </>
      )}

      {tab === "cityhome" && (
        <section className="card admin-cms admin-city-home">
          <h3>City home placements</h3>
          <p className="match-prefs-note">
            Members appear automatically after onboarding. Feature, mark hot, or hide profiles on each city
            home page. Paid City Boosts land here instantly — no manual work needed.
          </p>

          <label>
            City
            <select value={cityHomeCity} onChange={(e) => setCityHomeCity(e.target.value)}>
              {CITIES_VISUAL.map((city) => (
                <option key={city.id} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </label>

          {cityHomeMessage && <p className="admin-empty">{cityHomeMessage}</p>}
          {cityHomeLoading && <p>Loading members…</p>}

          {!cityHomeLoading && cityHomeMembers.length === 0 && !cityHomeMessage && (
            <p className="admin-empty">No completed profiles in {cityHomeCity} yet.</p>
          )}

          {cityHomeMembers.map((member) => (
            <article key={member.id} className="card admin-moderation-row admin-city-home-row">
              <div className="admin-moderation-row__main">
                {member.photo ? (
                  <img src={member.photo} alt="" className="admin-city-home-row__photo" />
                ) : null}
                <div>
                  <strong>{member.name}</strong>
                  <span>
                    {member.city}
                    {member.cityHomeHidden ? " · hidden" : " · visible"}
                  </span>
                </div>
              </div>
              <div className="admin-moderation-row__actions">
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={async () => {
                    const ok = await setAdminCityPlacement({
                      city: cityHomeCity,
                      profileId: member.id,
                      placementType: "featured"
                    });
                    setCityHomeMessage(ok ? `${member.name} featured in ${cityHomeCity}.` : "Could not update placement.");
                    if (ok) void loadCityHomeMembers();
                  }}
                >
                  Feature
                </button>
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={async () => {
                    const ok = await setAdminCityPlacement({
                      city: cityHomeCity,
                      profileId: member.id,
                      placementType: "hot"
                    });
                    setCityHomeMessage(ok ? `${member.name} marked hot in ${cityHomeCity}.` : "Could not update placement.");
                    if (ok) void loadCityHomeMembers();
                  }}
                >
                  Hot
                </button>
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={async () => {
                    const ok = await setAdminCityHomeHidden(member.id, !member.cityHomeHidden);
                    setCityHomeMessage(
                      ok
                        ? member.cityHomeHidden
                          ? `${member.name} visible again.`
                          : `${member.name} hidden from city home.`
                        : "Could not update visibility."
                    );
                    if (ok) void loadCityHomeMembers();
                  }}
                >
                  {member.cityHomeHidden ? "Show" : "Hide"}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {tab === "pricing" && <AdminPricingPage onBack={onBack} embedded />}

      {tab === "content" && (
        <section className="card admin-cms">
          <h3>Editable copy</h3>
          <p className="match-prefs-note">Hero, welcome, safety, and notification templates.</p>
          {(
            [
              ["welcomeTitle", "Welcome title"],
              ["welcomeBody", "Welcome body"],
              ["heroHeadline", "Hero headline"],
              ["heroSubheadline", "Hero subheadline"],
              ["safetyText", "Safety text"],
              ["foundingMemberLabel", "Founding member badge"],
              ["supportWhatsapp", "Support WhatsApp number"],
              ["supportResponseTime", "Support response time (contact strip)"],
              ["supportHours", "Support hours (contact strip)"],
              ["growthVerifiedProfiles", "Growth stat — verified profiles"],
              ["growthCitiesLive", "Growth stat — cities live"],
              ["growthSignalsSent", "Growth stat — signals sent"]
            ] as const
          ).map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                value={cmsDraft[key]}
                onChange={(e) => setCmsDraft({ ...cmsDraft, [key]: e.target.value })}
              />
            </label>
          ))}
          <div className="admin-cms-actions">
            <button type="button" className="btn-primary" onClick={() => saveCms(cmsDraft)}>
              Save content
            </button>
            <button type="button" className="btn-secondary" onClick={() => setCmsDraft({ ...DEFAULT_CMS })}>
              Reset defaults
            </button>
          </div>
        </section>
      )}

      {tab === "email" && (
        <section className="card admin-cms">
          <h3>Email branding</h3>
          <p className="match-prefs-note">
            Control the header shown on BamSignal transactional emails. When a banner is enabled, it replaces the logo.
            Invalid or missing banner images fall back to the logo automatically.
          </p>
          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={emailBrandingDraft.bannerEnabled}
              onChange={(e) =>
                setEmailBrandingDraft({ ...emailBrandingDraft, bannerEnabled: e.target.checked })
              }
            />
            Enable email banner
          </label>
          <label>
            Banner image URL
            <input
              type="url"
              placeholder="https://bamsignal.com/campaigns/launch-banner.webp"
              value={emailBrandingDraft.bannerImageUrl}
              onChange={(e) =>
                setEmailBrandingDraft({ ...emailBrandingDraft, bannerImageUrl: e.target.value })
              }
            />
          </label>
          <label>
            Banner link URL
            <input
              type="url"
              placeholder="https://bamsignal.com/premium"
              value={emailBrandingDraft.bannerLinkUrl}
              onChange={(e) =>
                setEmailBrandingDraft({ ...emailBrandingDraft, bannerLinkUrl: e.target.value })
              }
            />
          </label>
          <label>
            Banner alt text
            <input
              type="text"
              placeholder="Signal Pass launch — limited time"
              value={emailBrandingDraft.bannerAltText}
              onChange={(e) =>
                setEmailBrandingDraft({ ...emailBrandingDraft, bannerAltText: e.target.value })
              }
            />
          </label>
          {emailBrandingMessage && <p className="match-prefs-note">{emailBrandingMessage}</p>}
          <div className="admin-cms-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                void (async () => {
                  setEmailBrandingMessage("");
                  const { data } = await supabase?.auth.getSession() || { data: null };
                  const result = await saveEmailBrandingAdmin(
                    emailBrandingDraft,
                    data?.session?.access_token
                  );
                  if (!result.ok) {
                    setEmailBrandingMessage(result.error || "Could not save email branding.");
                    return;
                  }
                  if (result.value) setEmailBrandingDraft(result.value);
                  setEmailBrandingMessage("Email branding saved.");
                })();
              }}
            >
              Save email branding
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEmailBrandingDraft(DEFAULT_EMAIL_BRANDING);
                setEmailBrandingMessage("Reset to defaults (not saved yet).");
              }}
            >
              Reset defaults
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
