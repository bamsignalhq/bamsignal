import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  MAX_MORE_ABOUT_ME,
  MORE_ABOUT_ME_CATEGORIES,
  MORE_ABOUT_ME_HEADLINE,
  MORE_ABOUT_ME_LIMIT_MESSAGE,
  MORE_ABOUT_ME_SUBTEXT,
  formatMoreAboutMeChip
} from "../../constants/moreAboutMe";
import type { MoreAboutMeId } from "../../constants/moreAboutMe";
import { toggleMoreAboutMeSelection } from "../../utils/moreAboutMe";

type MoreAboutMePickerSheetProps = {
  open: boolean;
  selected: string[];
  onChange: (items: string[]) => void;
  onClose: () => void;
};

export function MoreAboutMePickerSheet({
  open,
  selected,
  onChange,
  onClose
}: MoreAboutMePickerSheetProps) {
  const [limitMessage, setLimitMessage] = useState("");
  const atMax = selected.length >= MAX_MORE_ABOUT_ME;

  useEffect(() => {
    if (!open) {
      setLimitMessage("");
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const toggle = (id: MoreAboutMeId) => {
    const result = toggleMoreAboutMeSelection(selected, id);
    if (result.blocked) {
      setLimitMessage(result.blockedReason || MORE_ABOUT_ME_LIMIT_MESSAGE);
      return;
    }
    setLimitMessage("");
    onChange(result.next);
  };

  const remove = (id: string) => {
    setLimitMessage("");
    onChange(selected.filter((item) => item !== id));
  };

  return createPortal(
    <div className="more-about-me-sheet" role="dialog" aria-modal="true" aria-label={MORE_ABOUT_ME_HEADLINE}>
      <button type="button" className="more-about-me-sheet__backdrop" onClick={onClose} aria-label="Close" />
      <div className="more-about-me-sheet__panel card">
        <header className="more-about-me-sheet__head">
          <div>
            <h3>{MORE_ABOUT_ME_HEADLINE}</h3>
            <p>{MORE_ABOUT_ME_SUBTEXT}</p>
            <p className="more-about-me-sheet__optional">Optional · up to {MAX_MORE_ABOUT_ME}</p>
            {selected.length > 0 ? (
              <p className="tap-select-sheet__count">{selected.length} selected</p>
            ) : null}
          </div>
          <button type="button" className="tap-select-sheet__done" onClick={onClose}>
            Done
          </button>
        </header>

        {selected.length > 0 ? (
          <div className="more-about-me-sheet__selected">
            <div className="tap-select-sheet__chips">
              {selected.map((id) => (
                <button
                  key={id}
                  type="button"
                  className="tap-select-chip more-about-me-chip more-about-me-chip--selected"
                  onClick={() => remove(id)}
                  aria-label={`Remove ${formatMoreAboutMeChip(id)}`}
                >
                  {formatMoreAboutMeChip(id)}
                  <X size={14} aria-hidden />
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="more-about-me-sheet__body">
          {MORE_ABOUT_ME_CATEGORIES.map((category) => (
            <section key={category.id} className="more-about-me-sheet__category">
              <h4>{category.label}</h4>
              <div className="more-about-me-sheet__chips">
                {category.items.map((item) => {
                  const isSelected = selected.includes(item.id);
                  const blocked = !isSelected && atMax;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`more-about-me-chip${isSelected ? " more-about-me-chip--selected" : ""}${
                        blocked ? " more-about-me-chip--disabled" : ""
                      }`}
                      onClick={() => toggle(item.id)}
                      disabled={blocked}
                      aria-pressed={isSelected}
                    >
                      <span aria-hidden>{item.emoji}</span>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <footer className="more-about-me-sheet__foot">
          {limitMessage ? (
            <p className="more-about-me-sheet__limit" role="status">
              {limitMessage}
            </p>
          ) : (
            <p className="more-about-me-sheet__count">
              {selected.length > 0
                ? `${selected.length} selected · ${MAX_MORE_ABOUT_ME} max`
                : "Skip for now or pick what feels like you"}
            </p>
          )}
          <button type="button" className="btn-primary btn-full" onClick={onClose}>
            Done
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
