import type {
  SuccessStoryConsentAction,
  SuccessStoryPhotoPermission,
  SuccessStoryTestimonialPermission,
  SuccessStoryVideoPermission,
  SuccessStoryVisibilityLevel
} from "../constants/conciergeSuccessStoryConsent";
import { DEFAULT_SUCCESS_STORY_CONSENT } from "../constants/conciergeSuccessStoryConsent";

export type SuccessStoryPartyApproval = {
  memberId: string;
  memberName: string;
  approved: boolean;
  approvedAt?: string;
};

export type SuccessStoryConsentHistoryEntry = {
  id: string;
  action: SuccessStoryConsentAction;
  at: string;
  approvedBy: string;
  memberId?: string;
  detail?: string;
  visibility?: SuccessStoryVisibilityLevel;
  photoPermission?: SuccessStoryPhotoPermission;
  videoPermission?: SuccessStoryVideoPermission;
  testimonialPermission?: SuccessStoryTestimonialPermission;
};

export type SuccessStoryConsentRecord = {
  id: string;
  journeyId: string;
  memberAId: string;
  memberBId: string;
  memberAName: string;
  memberBName: string;
  visibility: SuccessStoryVisibilityLevel;
  photoPermission: SuccessStoryPhotoPermission;
  videoPermission: SuccessStoryVideoPermission;
  testimonialPermission: SuccessStoryTestimonialPermission;
  partyApprovals: {
    memberA: SuccessStoryPartyApproval;
    memberB: SuccessStoryPartyApproval;
  };
  withdrawn: boolean;
  withdrawnAt?: string;
  history: SuccessStoryConsentHistoryEntry[];
  storyCategories?: import("../types/JourneyStoryType").JourneyStoryCategoryEntry[];
  storyProfile?: import("../types/JourneyStoryType").JourneyStoryProfile;
  createdAt: string;
  updatedAt: string;
};

export type SuccessStoryConsentPermissions = Pick<
  SuccessStoryConsentRecord,
  "visibility" | "photoPermission" | "videoPermission" | "testimonialPermission"
>;
