type AdminTerminalEmptyProps = {
  children: string;
};

export function AdminTerminalEmpty({ children }: AdminTerminalEmptyProps) {
  return (
    <div className="admin-terminal-empty" role="status">
      <code className="admin-terminal-empty__line">
        <span className="admin-terminal-empty__prompt" aria-hidden>
          &gt;
        </span>{" "}
        {children}
      </code>
    </div>
  );
}
