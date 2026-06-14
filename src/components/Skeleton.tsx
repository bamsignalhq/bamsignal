type SkeletonProps = {
  className?: string;
  variant?: "text" | "circle" | "card" | "bar";
};

export function Skeleton({ className = "", variant = "bar" }: SkeletonProps) {
  return <div className={`skeleton skeleton--${variant} ${className}`.trim()} aria-hidden />;
}

export function ProfileCardSkeleton() {
  return (
    <div className="skeleton-profile-card">
      <Skeleton variant="card" className="skeleton-profile-card__photo" />
      <Skeleton variant="text" className="skeleton-profile-card__line" />
      <Skeleton variant="text" className="skeleton-profile-card__line skeleton-profile-card__line--short" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="skeleton-dashboard">
      <Skeleton variant="bar" className="skeleton-dashboard__greet" />
      <Skeleton variant="card" className="skeleton-dashboard__card" />
      <div className="skeleton-dashboard__stats">
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>
    </div>
  );
}
