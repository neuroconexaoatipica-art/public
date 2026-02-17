import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { supabase } from "../lib/supabase";
import {
  hasAppAccess,
  ProfileProvider,
  CommunitiesProvider,
  useProfileContext,
} from "../lib";
import type { CommunityWithMeta } from "../lib";

import { HeaderInstitucional } from "./components/HeaderInstitucional";
import { HeroSection } from "./components/HeroSection";
import { SignupPopup } from "./components/SignupPopup";
import { LoginPopup } from "./components/LoginPopup";
import { CommunitiesShowcase } from "./components/CommunitiesShowcase";
import { CreatorSection } from "./components/CreatorSection";
import { ManifestoSection } from "./components/ManifestoSection";
import { MembershipSection } from "./components/MembershipSection";
import { FooterInstitucional } from "./components/FooterInstitucional";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { EthicsPage } from "./components/EthicsPage";
import { WarningsPage } from "./components/WarningsPage";
import { PrivacyPolicyPage } from "./components/PrivacyPolicyPage";
import { TermsOfUsePage } from "./components/TermsOfUsePage";
import { IndexPage } from "./components/IndexPage";
import { SocialHub } from "./components/SocialHub";
import { ProfileMila } from "./components/ProfileMila";
import { FeedPublico } from "./components/FeedPublico";
import { CommunitiesPage } from "./components/CommunitiesPage";
import { CommunityFeed } from "./components/CommunityFeed";
import { RoadmapPage } from "./components/RoadmapPage";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LogoIcon } from "./components/LogoIcon";

type PageType =
  | "home"
  | "ethics"
  | "warnings"
  | "privacy"
  | "terms"
  | "index"
  | "social-hub"
  | "profile"
  | "profile-user"
  | "feed"
  | "communities"
  | "community-detail"
  | "roadmap";

// Componente interno
function AppContent() {
  const { user: currentUser, isLoading } = useProfileContext();
  const [currentPage, setCurrentPage] = useState<PageType>("home");

  useEffect(() => {
    if (isLoading) return;

    if (currentUser) {
      if (hasAppAccess(currentUser.role)) {
        setCurrentPage("social-hub");
      } else {
        setCurrentPage("index");
      }
    } else {
      setCurrentPage("home");
    }
  }, [currentUser, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LogoIcon size={64} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {currentPage === "home" && <HeroSection onCtaClick={() => {}} />}
      {currentPage === "social-hub" && (
  <SocialHub
    onNavigateToProfile={() => {}}
    onNavigateToCommunities={() => {}}
    onNavigateToFeed={() => {}}
    onNavigateToUserProfile={() => {}}
  />
)}

{currentPage === "index" && (
  <IndexPage
    onNavigateToCommunities={() => {}}
    onNavigateToProfile={() => {}}
    onNavigateToRoadmap={() => {}}
    onNavigateToUserProfile={() => {}}
  />
)}

    </div>
  );
}

// EXPORT DEFAULT CORRETO
export default function App() {
  return (
    <ErrorBoundary>
      <ProfileProvider>
        <CommunitiesProvider>
          <AppContent />
        </CommunitiesProvider>
      </ProfileProvider>
    </ErrorBoundary>
  );
}
