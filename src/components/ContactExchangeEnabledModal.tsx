import { useState } from "react";
import type { ContactExchangeShared } from "../types";

type ContactExchangeEnabledModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (shared: ContactExchangeShared) => void;
};

export function ContactExchangeEnabledModal({
  open,
  onClose,
  onSave
}: ContactExchangeEnabledModalProps) {
  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [instagram, setInstagram] = useState("");

  if (!open) return null;

  const handleSave = () => {
    onSave({
      ...(whatsapp.trim() ? { whatsapp: whatsapp.trim() } : {}),
      ...(phone.trim() ? { phone: phone.trim() } : {}),
      ...(telegram.trim() ? { telegram: telegram.trim() } : {}),
      ...(instagram.trim() ? { instagram: instagram.trim() } : {})
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="safety-modal contact-exchange-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h3>❤️ Contact exchange enabled</h3>
        <p className="safety-modal__lead">
          You both agreed to continue outside BamSignal. Stay safe and share only what you're comfortable with.
        </p>
        <label>
          WhatsApp number <span>(optional)</span>
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="e.g. 0803…" />
        </label>
        <label>
          Phone number <span>(optional)</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 0803…" />
        </label>
        <label>
          Telegram <span>(optional)</span>
          <input value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="@username" />
        </label>
        <label>
          Instagram <span>(optional)</span>
          <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@username" />
        </label>
        <div className="safety-modal__actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Maybe later
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
