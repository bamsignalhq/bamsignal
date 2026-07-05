import type { TrustEducationView } from "../../utils/trustEducation";

export function CommunityTrustEducation({ view }: { view: TrustEducationView }) {
  return (
    <div className="community-trust-education">
      <p className={`community-trust__band community-trust__band--${view.memberTrustBand}`}>
        {view.memberTrustLabel}
      </p>
      {view.topics.map((topic) => (
        <article key={topic.id} className="community-trust-education__topic">
          <h3>{topic.title}</h3>
          <p>{topic.body}</p>
        </article>
      ))}
    </div>
  );
}
