type UnreadBadgeProps = {
  count: number;
};

export function UnreadBadge({ count }: UnreadBadgeProps) {
  if (count <= 0) return null;

  return (
    <span className="unread-badge" aria-label={`${count} unread`}>
      {count > 99 ? "99+" : count}
    </span>
  );
}
