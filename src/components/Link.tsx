import type { ReactNode } from "react";

type LinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
};

/** Internal navigation without react-router */
export function Link({ href, className, children, onClick }: LinkProps) {
  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.altKey ||
          event.ctrlKey ||
          event.shiftKey
        ) {
          return;
        }
        event.preventDefault();
        onClick?.();
        window.history.pushState(null, "", href);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }}
    >
      {children}
    </a>
  );
}
