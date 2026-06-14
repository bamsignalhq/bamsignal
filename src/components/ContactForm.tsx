import { useMemo, useState, type FormEvent } from "react";
import { Loader2, Send } from "lucide-react";
import { createAdditionPuzzle, parseCaptchaAnswer } from "../utils/mathCaptcha";

const TOPICS = [
  "General question",
  "Account help",
  "Safety report",
  "Billing & subscriptions",
  "Partnership",
  "Feedback"
] as const;

type FormState = {
  name: string;
  email: string;
  topic: string;
  message: string;
  captcha: string;
};

const EMPTY: FormState = {
  name: "",
  email: "",
  topic: TOPICS[0],
  message: "",
  captcha: ""
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [puzzle, setPuzzle] = useState(createAdditionPuzzle);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const captchaValue = useMemo(() => parseCaptchaAnswer(form.captcha), [form.captcha]);
  const captchaOk = captchaValue === puzzle.answer;

  const canSend =
    form.name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
    form.message.trim().length >= 10 &&
    captchaOk &&
    status !== "sending";

  const update = (patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    if (status === "error") setStatus("idle");
  };

  const refreshCaptcha = () => {
    setPuzzle(createAdditionPuzzle());
    setForm((prev) => ({ ...prev, captcha: "" }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSend) return;

    setStatus("sending");
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          topic: form.topic,
          message: form.message.trim()
        })
      });

      const contentType = response.headers.get("content-type") || "";
      let data: { ok?: boolean; error?: string; message?: string } = {};

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = (await response.text()).trim();
        throw new Error(
          text && text.length < 160
            ? text
            : "Could not reach the contact service. Try again or email support@bamsignal.com."
        );
      }

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Could not send your message. Try again or email support@bamsignal.com.");
      }

      setStatus("success");
      setForm(EMPTY);
      refreshCaptcha();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
      refreshCaptcha();
    }
  };

  if (status === "success") {
    return (
      <div className="contact-form contact-form--success">
        <h3>Message sent</h3>
        <p>Thanks for reaching out. We&apos;ll get back to you within a few hours.</p>
        <button type="button" className="contact-form__btn contact-form__btn--secondary" onClick={() => setStatus("idle")}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-form__grid">
        <label className="contact-form__field">
          <span className="sr-only">Your name</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="Your name"
            required
          />
        </label>

        <label className="contact-form__field">
          <span className="sr-only">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update({ email: e.target.value })}
            placeholder="Email"
            required
          />
        </label>
      </div>

      <label className="contact-form__field">
        <span className="sr-only">Topic</span>
        <select value={form.topic} onChange={(e) => update({ topic: e.target.value })} aria-label="Topic">
          {TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </label>

      <label className="contact-form__field">
        <span className="sr-only">Message</span>
        <textarea
          name="message"
          rows={5}
          value={form.message}
          onChange={(e) => update({ message: e.target.value })}
          placeholder="Message"
          required
        />
      </label>

      <div className="contact-form__captcha">
        <span className="contact-form__captcha-q" id="contact-captcha-label">
          What is {puzzle.a} + {puzzle.b}?
        </span>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2}
          className="contact-form__captcha-input"
          value={form.captcha}
          onChange={(e) => update({ captcha: e.target.value.replace(/\D/g, "") })}
          aria-labelledby="contact-captcha-label"
        />
      </div>

      {error && (
        <p className="contact-form__error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="contact-form__btn" disabled={!canSend}>
        {status === "sending" ? (
          <>
            <Loader2 size={18} className="contact-form__spin" aria-hidden />
            Sending…
          </>
        ) : (
          <>
            <Send size={18} aria-hidden />
            Send message
          </>
        )}
      </button>
    </form>
  );
}
