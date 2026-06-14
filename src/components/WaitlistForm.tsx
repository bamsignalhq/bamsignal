import { Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { LAUNCH_PRIMARY_CITIES } from "../constants/seedCities";
import { trackEvent } from "../utils/analytics";
import { addLaunchLead } from "../utils/launchLeads";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState<string>(LAUNCH_PRIMARY_CITIES[0]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  const submit = async () => {
    setBusy(true);
    setMessage("");
    const result = addLaunchLead({ email, phone, city });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error || "Could not join waitlist.");
      return;
    }
    trackEvent("waitlist_joined", { city });
    setDone(true);
    setEmail("");
    setPhone("");
  };

  if (done) {
    return (
      <section className="card waitlist-form waitlist-form--done">
        <h3>You're on the list</h3>
        <p>We'll reach out when BamSignal opens in {city}. Founding spots are limited.</p>
      </section>
    );
  }

  return (
    <section className="card waitlist-form">
      <div className="waitlist-form__head">
        <Mail size={22} />
        <div>
          <h3>Not ready to join yet?</h3>
          <p>Get launch updates — founding member spots are limited.</p>
        </div>
      </div>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
        />
      </label>
      <label>
        Phone (optional)
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="08012345678"
        />
      </label>
      <label>
        City
        <select value={city} onChange={(e) => setCity(e.target.value)}>
          {LAUNCH_PRIMARY_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <button type="button" className="btn-primary btn-full" onClick={submit} disabled={busy}>
        {busy ? <Loader2 className="spin" size={18} /> : "Join launch waitlist"}
      </button>
      {message && <p className="waitlist-form__msg">{message}</p>}
    </section>
  );
}
