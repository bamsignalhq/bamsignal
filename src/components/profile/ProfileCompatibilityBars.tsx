type ProfileDimension = {
  label: string;
  percent: number;
};

type ProfileCompatibilityBarsProps = {
  dimensions: ProfileDimension[];
};

export function ProfileCompatibilityBars({ dimensions }: ProfileCompatibilityBarsProps) {
  if (!dimensions.length) return null;

  return (
    <div className="profile-premium-compat">
      {dimensions.map((dimension) => (
        <div key={dimension.label} className="profile-premium-compat__row">
          <div className="profile-premium-compat__label-row">
            <span>{dimension.label}</span>
            <span>{dimension.percent}%</span>
          </div>
          <div className="profile-premium-compat__track" aria-hidden>
            <div
              className="profile-premium-compat__fill"
              style={{ width: `${dimension.percent}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
