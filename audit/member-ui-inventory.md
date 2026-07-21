# BamSignal Member UI Inventory

**Date:** 2026-07-21  
**Branch:** `feat/member-ui-stabilization`  
**Scope:** Authenticated member surfaces — presentation only  
**Mode:** SAFE UI REFACTOR inventory (pre-consolidation baseline)

---

## 1. Screen inventory

| Screen | Route / mount | Main components | Shared vs one-off |
|--------|---------------|-----------------|-------------------|
| HomePage | `/home` | HomeSignalLimitBar, ProfileImprovementNudge, PersonalizedHomeCard, HomeFeedFilters, HomeSignalsFeed | Mostly shared home/* + nudges |
| DiscoverPage | `/discover` | DiscoverHeader, ProfileStoryCard, ProfileDetailSheet, MemberEmptyState, ProfileCardSkeleton | Shared discover/* + UxKit empty |
| LikesPage (Signals) | `/signals` | SignalsPageHeader, IncomingSignalCard, inline empty + safety row | Shared signals/*; empty/safety were one-off |
| ChatsPage | `/chats` | EmptyChatState, ChatInput, contact/paywall modals | Domain EmptyChatState |
| ProfilePage | `/profile` | ProfileOverviewContent, settings hub, sheets | Large orchestrator; profile/* shared |
| PremiumPage | Overlay `premium` | Inline plan UI | Overlaps PremiumCenter |
| PremiumCenterPage | `/subscription` | Plan CTAs, CommercialDashboardSummary | Shared commercial/* |
| SavedProfilesPage | `/saved-profiles` | SavedProfileCard, inline empty/loading | Empty/loading one-off |
| VisitorsPage | Overlay `visitors` | Legacy EmptyState or visitor rows | Thin page |
| ReferralDashboardPage | `/referral` | ReferralCard, campaign panels | Mostly one-off |
| SafetyCenterPage | Overlay `safety` | BlockedUsersList, MemberReportsList | Shared safety/* |

Path map: `src/constants/memberRoutes.ts` — tabs `/home`, `/discover`, `/signals`, `/chats`, `/profile`; related `/saved-profiles`, `/subscription`, `/referral`.

---

## 2. Shared primitives (canonical)

| Primitive | Location |
|-----------|----------|
| MemberLoadingState, MemberSkeleton, MemberEmptyState, MemberErrorState, MemberSheet, network banners | `MemberUxKit.tsx` |
| ProfileCompletionProgress | `ProfileCompletionProgress.tsx` |
| FirstTimeTeachSheet, MemberToast | member/ |
| ProfileImprovementNudge, MemberMicroNudge | nudges/ |
| MEMBER_BUTTON_* | `uxDesignSystem.ts` |
| Tokens | `member-fintech.css`, `member-design-system.css`, `member-ux-kit.css` |

### Named brief items

| Name | Status |
|------|--------|
| member-insight-card | Does not exist (domain cards own insight UI) |
| member-guidance-banner | Does not exist (nudges / ProfileGuidanceChip) |
| profile-completion-compact | Orphan component (unused) — removed in this sprint |
| member-card | Locked target name; aliased to existing `.card` styles |

---

## 3. Duplicate patterns (pre-fix)

1. Dual `MemberErrorState` (legacy `message` vs UxKit `body`)
2. `EmptyState` vs `MemberEmptyState` vs inline empties (Likes, Saved, Home feed)
3. Twin safety rows: DiscoverSafetyCard vs Likes inline markup
4. Loading: plain text vs MemberLoadingState vs ProfileCardSkeleton vs feed card skeletons
5. Page heads: `.member-page-head` vs custom Visitors/Safety/Referral heads
6. PremiumPage ↔ PremiumCenterPage presentational overlap
7. Orphan ProfileCompletionCompact vs live ProfileCompletionProgress

---

## 4. Token gaps (baseline)

- `--bs-gold` referenced in UxKit without definition in fintech
- Hardcoded error/network hex in `member-ux-kit.css`
- Duplicate button heights (raw px vs `--bs-btn-h-*`)
- Empty max-width `340px` not tokenized
- `member-pages.css` hex sprawl (debt — not fully rewritten this sprint)

---

## 5. Consolidation targets (this sprint)

1. Unify MemberErrorState → UxKit only  
2. Migrate empties → MemberEmptyState; EmptyState/EmptyChatState thin adapters  
3. MemberLoadingState on Saved (status loading)  
4. MemberPageHead + MemberSafetyRow helpers  
5. Remove ProfileCompletionCompact  
6. Shared premium presentational shell  
7. Token + a11y polish on shared CSS/TS  

---

*Inventory captured for certification. Implementation follows on this branch.*
