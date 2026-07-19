import { MemberSheet } from "./MemberUxKit";
import { FIRST_TIME_TEACH_TOPICS, type FirstTimeTeachTopicId } from "../../constants/firstTimeUser";

type FirstTimeTeachSheetProps = {
  open: boolean;
  topicId: FirstTimeTeachTopicId;
  onClose: () => void;
};

export function FirstTimeTeachSheet({ open, topicId, onClose }: FirstTimeTeachSheetProps) {
  const topic = FIRST_TIME_TEACH_TOPICS.find((t) => t.id === topicId);
  if (!topic) return null;

  return (
    <MemberSheet
      open={open}
      eyebrow="First-time guide"
      title={topic.title}
      subtitle={topic.summary}
      onClose={onClose}
      ariaLabel={`Learn about ${topic.title}`}
    >
      <p className="member-ux-teach__body">
        BamSignal is built for intentional connections. Take a minute to learn how {topic.title.toLowerCase()}{" "}
        works — then try it from Discover or your profile.
      </p>
    </MemberSheet>
  );
}
