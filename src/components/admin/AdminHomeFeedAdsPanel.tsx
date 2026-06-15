import { useEffect, useState } from "react";
import {
  DEFAULT_HOME_FEED_ADS,
  HOME_FEED_AD_IMAGE_SPEC,
  type HomeFeedAdsSettings
} from "../../constants/homeFeedAds";
import { fetchHomeFeedAds, saveHomeFeedAdsAdmin } from "../../services/homeFeedAds";
import { supabase } from "../../services/supabase";

type AdminHomeFeedAdsPanelProps = {
  onMessage: (message: string) => void;
};

export function AdminHomeFeedAdsPanel({ onMessage }: AdminHomeFeedAdsPanelProps) {
  const [draft, setDraft] = useState<HomeFeedAdsSettings>(DEFAULT_HOME_FEED_ADS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetchHomeFeedAds().then(setDraft);
  }, []);

  const updateSlot = (index: 0 | 1 | 2, patch: Partial<HomeFeedAdsSettings["slots"][0]>) => {
    setDraft((current) => {
      const slots = [...current.slots] as HomeFeedAdsSettings["slots"];
      slots[index] = { ...slots[index], ...patch };
      return { ...current, slots };
    });
  };

  const save = async () => {
    setSaving(true);
    const { data } = (await supabase?.auth.getSession()) || { data: null };
    const result = await saveHomeFeedAdsAdmin(draft, data?.session?.access_token);
    setSaving(false);
    if (result.ok && result.value) {
      setDraft(result.value);
      onMessage("Home feed ads saved.");
    } else {
      onMessage(result.error || "Could not save home feed ads.");
    }
  };

  return (
    <section className="card admin-cms admin-home-ads">
      <h3>Home feed ads</h3>
      <p className="match-prefs-note">
        Sponsored banners appear in the Home grid after every 5 rows (3 slots total). Ads only show when the master
        switch is on and each slot is enabled with a valid image URL.
      </p>

      <div className="admin-home-ads__spec card">
        <strong>Image sizing</strong>
        <p>
          Upload or host at exactly <strong>{HOME_FEED_AD_IMAGE_SPEC.label}</strong> — {HOME_FEED_AD_IMAGE_SPEC.formats}
          , under {HOME_FEED_AD_IMAGE_SPEC.maxFileKb} KB when possible. The banner spans all 3 grid columns on mobile.
        </p>
        <p className="admin-home-ads__spec-hint">
          Oversized images will crop or slow the feed. Resize before uploading to your CDN or storage bucket, then paste
          the URL below.
        </p>
      </div>

      <label className="admin-checkbox">
        <input
          type="checkbox"
          checked={draft.enabled}
          onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
        />
        Enable home feed ads (master switch)
      </label>

      {([0, 1, 2] as const).map((index) => {
        const slot = draft.slots[index];
        const rowStart = index * 5 + 1;
        const rowEnd = rowStart + 4;
        return (
          <article key={index} className="admin-home-ads__slot card">
            <h4>
              Banner {index + 1} <span>— after rows {rowStart}–{rowEnd}</span>
            </h4>

            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={slot.enabled}
                onChange={(e) => updateSlot(index, { enabled: e.target.checked })}
              />
              Activate this banner
            </label>

            <label>
              Image URL ({HOME_FEED_AD_IMAGE_SPEC.width}×{HOME_FEED_AD_IMAGE_SPEC.height}px)
              <input
                type="url"
                value={slot.imageUrl}
                placeholder="https://…/banner.webp"
                onChange={(e) => updateSlot(index, { imageUrl: e.target.value })}
              />
            </label>

            {slot.imageUrl ? (
              <div className="admin-home-ads__preview">
                <span>Preview</span>
                <img src={slot.imageUrl} alt={slot.altText || "Ad preview"} />
              </div>
            ) : null}

            <label>
              Link URL (optional)
              <input
                type="url"
                value={slot.linkUrl}
                placeholder="https://…"
                onChange={(e) => updateSlot(index, { linkUrl: e.target.value })}
              />
            </label>

            <label>
              Alt text
              <input
                value={slot.altText}
                placeholder="Describe the sponsor offer"
                onChange={(e) => updateSlot(index, { altText: e.target.value })}
              />
            </label>
          </article>
        );
      })}

      <div className="admin-cms-actions">
        <button type="button" className="btn-primary" disabled={saving} onClick={() => void save()}>
          {saving ? "Saving…" : "Save home feed ads"}
        </button>
        <button type="button" className="btn-secondary" onClick={() => setDraft(DEFAULT_HOME_FEED_ADS)}>
          Reset defaults
        </button>
      </div>
    </section>
  );
}
