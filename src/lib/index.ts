export { supabase, TIMEOUTS, SUPABASE_STORAGE_KEY } from './supabase';
export type { User, Community, Post, LiveInterest, Comment, UserRole } from './supabase';
export type { Event, EventParticipant, EventType, RitualType, EventStatus, LocationType, ParticipantStatus } from './supabase';
// useProfile e useCommunities são LEGADOS — usar useProfileContext e useCommunitiesContext
// export { useProfile } from './useProfile';
// export { useCommunities } from './useCommunities';
export { usePosts } from './usePosts';
export type { PostWithAuthor } from './usePosts';
export { useComments } from './useComments';
export type { CommentWithAuthor } from './useComments';
export { useImageUpload } from './useImageUpload';
export { useSeats } from './useSeats';
export type { CommunityWithMeta } from './CommunitiesContext';
export { COMMUNITIES_CONFIG, COMMUNITY_BY_NAME, MILA_ACTIVE_COMMUNITIES, MILA_UUID, COMMUNITY_RITUAL_TYPES } from './communitiesConfig';
export type { CommunityConfig, CommunityRitualType } from './communitiesConfig';
export { hasAppAccess, hasModAccess, hasLeadershipAccess, isSuperAdmin, needsLeadershipOnboarding, getDefaultPage, normalizeRole } from './roleEngine';
export { isWaitingApproval, isBanned, getRolePower } from './roleEngine';
export { useRole } from './useRole';
export { useCommunityMembership } from './useCommunityMembership';
export type { MembershipStatus } from './useCommunityMembership';
export { ProfileProvider, useProfileContext } from './ProfileContext';
export { CommunitiesProvider, useCommunitiesContext } from './CommunitiesContext';
export { usePlatformCopy, useHomeSections, useLegalPage, useLegalPages, useAnnouncements } from './useCMS';
export type { PlatformCopy, HomeSection, LegalPage, LegalPageKey, Announcement } from './useCMS';
export { useEvents, useEventDetail, EVENT_TYPE_LABELS, RITUAL_TYPE_LABELS, RITUAL_TYPE_DESCRIPTIONS, EVENT_STATUS_LABELS, LOCATION_TYPE_LABELS } from './useEvents';
export type { EventWithMeta, CreateEventInput } from './useEvents';

// ── V9 MEGA: Novos hooks para rede social viva ──
export { useNotifications } from './useNotifications';
export type { Notification } from './useNotifications';
export { useChat } from './useChat';
export type { ChatMessage } from './useChat';
export { useReactions, REACTION_LABELS } from './useReactions';
export type { ReactionType, ReactionCount } from './useReactions';
export { useConnections } from './useConnections';
export type { Connection } from './useConnections';
export { useProfileVisits } from './useProfileVisits';
export type { ProfileVisit } from './useProfileVisits';
export { useTestimonials } from './useTestimonials';
export type { Testimonial } from './useTestimonials';
export { useReports, REPORT_TYPE_LABELS } from './useReports';
export type { ReportType } from './useReports';
export { useDailyChallenge } from './useDailyChallenge';
export type { DailyChallenge, DailyCheckin } from './useDailyChallenge';
export { usePrivateMessages } from './usePrivateMessages';
export type { PrivateMessage, Conversation } from './usePrivateMessages';

// ── v1.1: Seguranca e utilitarios ──
export {
  sanitizeHTML,
  stripHTML,
  sanitizePostContent,
  cleanTextInput,
  isValidEmail,
  isValidWhatsApp,
  formatWhatsApp,
  validatePassword,
  isAllowedURL,
  isValidURL,
  validateImageFile,
  checkRateLimit,
  RATE_LIMITS,
  logSecurityEvent,
  maskEmail,
  maskWhatsApp,
  SUPER_ADMIN_UUID,
  CURRENT_TERMS_VERSION,
  MIN_AGE,
  MAX_LENGTHS,
} from './security';

// ── v1.1: Novos hooks para camadas estrategicas ──
export { useLiveQuestions } from './useLiveQuestions';
export type { LiveQuestion } from './useLiveQuestions';
export { useRitualLogs } from './useRitualLogs';
export type { RitualLog, RitualStats, RitualType as RitualLogType } from './useRitualLogs';
export { useBadges, useBadgesForUsers, BADGE_CONFIG, runBadgeEngine } from './useBadges';
export type { UserBadge, BadgeType } from './useBadges';
export { useModerationActions, ACTION_TYPE_LABELS } from './useModerationActions';
export type { ModerationAction, ModerationActionType } from './useModerationActions';
export { useMemberTestimonials } from './useMemberTestimonials';
export type { MemberTestimonial } from './useMemberTestimonials';
export { useInviteLinks } from './useInviteLinks';
export type { InviteLink } from './useInviteLinks';

// ── Modal Context (React Router) ──
export { ModalProvider, useModalContext } from './ModalContext';