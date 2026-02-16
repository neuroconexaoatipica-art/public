export { supabase } from './supabase';
export type { User, Community, Post, LiveInterest, Comment, UserRole } from './supabase';
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
export { COMMUNITIES_CONFIG, COMMUNITY_BY_NAME } from './communitiesConfig';
export type { CommunityConfig } from './communitiesConfig';
export { hasAppAccess, hasModAccess, getDefaultPage } from './roleEngine';
export { ProfileProvider, useProfileContext } from './ProfileContext';
export { CommunitiesProvider, useCommunitiesContext } from './CommunitiesContext';

