import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ChevronDown } from "lucide-react";
import {
  getAvailableWorkspaceIds,
  getWorkspaceDefinition,
  hasMultipleWorkspaces,
  resolveSwitchPath,
  selectWorkspace,
  type WorkspaceId
} from "../../workspaces";
import { navigateToPath } from "../../constants/routes";
import "../../styles/workspace-switcher.css";

type WorkspaceSwitcherProps = {
  currentWorkspaceId: WorkspaceId;
  /** Visual density for Concierge editorial vs member fintech. */
  variant?: "concierge" | "member";
  className?: string;
  onSwitched?: (id: WorkspaceId) => void;
};

/**
 * Shared workspace switcher — visible only when the identity has multiple workspaces.
 */
export function WorkspaceSwitcher({
  currentWorkspaceId,
  variant = "member",
  className = "",
  onSwitched
}: WorkspaceSwitcherProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const available = getAvailableWorkspaceIds();
  const show = hasMultipleWorkspaces() && available.includes(currentWorkspaceId)
    ? true
    : hasMultipleWorkspaces();

  const current = getWorkspaceDefinition(currentWorkspaceId);
  const options = available
    .map((id) => getWorkspaceDefinition(id))
    .filter((def) => def.shipped);

  const close = useCallback(() => setOpen(false), []);

  const switchTo = useCallback(
    (id: WorkspaceId) => {
      if (id === currentWorkspaceId) {
        close();
        return;
      }
      selectWorkspace(id, { setPreferred: true });
      close();
      onSwitched?.(id);
      navigateToPath(resolveSwitchPath(id));
    },
    [close, currentWorkspaceId, onSwitched]
  );

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    optionRefs.current[focusIndex]?.focus();
  }, [open, focusIndex]);

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
      setFocusIndex(Math.max(0, options.findIndex((w) => w.id === currentWorkspaceId)));
    }
  };

  const onListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusIndex((i) => (i + 1) % options.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusIndex((i) => (i - 1 + options.length) % options.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setFocusIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setFocusIndex(options.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const target = options[focusIndex];
      if (target) switchTo(target.id);
    } else if (event.key === "Tab") {
      close();
    }
  };

  if (!show || options.length < 2) return null;

  return (
    <div
      ref={rootRef}
      className={`workspace-switcher workspace-switcher--${variant} ${className}`.trim()}
    >
      <button
        ref={triggerRef}
        type="button"
        className="workspace-switcher__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Workspace: ${current.label}. Change workspace`}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="workspace-switcher__label">
          <span className="workspace-switcher__eyebrow">Workspace</span>
          <span className="workspace-switcher__current">{current.shortLabel}</span>
        </span>
        <ChevronDown size={16} aria-hidden className={open ? "workspace-switcher__chevron is-open" : "workspace-switcher__chevron"} />
      </button>

      {open ? (
        <ul
          id={listId}
          className="workspace-switcher__list"
          role="listbox"
          aria-label="Available workspaces"
          aria-activedescendant={`${listId}-option-${options[focusIndex]?.id ?? currentWorkspaceId}`}
          onKeyDown={onListKeyDown}
        >
          {options.map((workspace, index) => {
            const selected = workspace.id === currentWorkspaceId;
            return (
              <li key={workspace.id} role="presentation">
                <button
                  ref={(node) => {
                    optionRefs.current[index] = node;
                  }}
                  id={`${listId}-option-${workspace.id}`}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  tabIndex={open && focusIndex === index ? 0 : -1}
                  className={
                    selected
                      ? "workspace-switcher__option is-selected"
                      : "workspace-switcher__option"
                  }
                  onClick={() => switchTo(workspace.id)}
                >
                  <span className="workspace-switcher__option-label">{workspace.label}</span>
                  <span className="workspace-switcher__option-desc">{workspace.description}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
