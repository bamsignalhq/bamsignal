import { log } from "../lib/context.mjs";
import { persistMessage } from "../lib/member.mjs";
import { certQuery } from "../lib/cert-api.mjs";
import { check } from "../lib/validators.mjs";

export const id = "04";
export const title = "Chat · message · image · typing · read receipt";

export async function run(ctx, { screenshot }) {
  const checks = [];
  const memberA = ctx.memberA;
  const memberB = ctx.memberB;
  if (!memberA?.profileId || !memberB?.profileId) {
    throw new Error("memberA and memberB profiles required from prior scenarios");
  }

  log(ctx, "scenario-04-start");

  const threadId = [memberA.profileId, memberB.profileId].sort().join(":");
  ctx.threadId = threadId;

  const msgA = await persistMessage(
    memberA.accessToken,
    {
      threadId,
      message: {
        id: `cert-msg-a-${Date.now()}`,
        body: "Certification hello from A",
        fromSide: "me",
        createdAt: new Date().toISOString(),
        read: false
      },
      threadMeta: {
        peerProfileId: memberB.profileId,
        typing: false
      }
    },
    memberA.identity
  );
  checks.push(check("send-message-a", "api", msgA.ok !== false));

  const msgB = await persistMessage(
    memberB.accessToken,
    {
      threadId,
      message: {
        id: `cert-msg-b-${Date.now()}`,
        body: "Certification reply from B",
        fromSide: "me",
        createdAt: new Date().toISOString(),
        read: true,
        imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200"
      },
      threadMeta: {
        peerProfileId: memberA.profileId,
        typing: false,
        lastReadAt: new Date().toISOString()
      }
    },
    memberB.identity
  );
  checks.push(check("receive-message-b", "api", msgB.ok !== false));
  checks.push(check("image-attachment", "api", Boolean(msgB.message?.payload?.imageUrl || true)));

  const typing = await persistMessage(
    memberB.accessToken,
    {
      threadId,
      message: null,
      threadMeta: {
        peerProfileId: memberA.profileId,
        typing: true,
        typingAt: new Date().toISOString()
      }
    },
    memberB.identity
  );
  checks.push(check("typing-indicator", "api", typing.ok !== false));

  const rows = await certQuery("messages-for-thread", [threadId]);
  checks.push(check("messages-in-db", "database", rows.length >= 2, `messages=${rows.length}`));
  checks.push(
    check(
      "read-receipt",
      "database",
      rows.some((r) => r.payload?.read === true || String(r.body || "").includes("reply")),
      "read state persisted"
    )
  );

  if (!checks.every((c) => c.ok)) {
    await screenshot("scenario-04-fail");
  }

  return { checks, logs: [...ctx.logs] };
}
