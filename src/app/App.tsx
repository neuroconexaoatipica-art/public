import { useState, useEffect } from "react";
import { motion } from "motion/react";
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
import { supabase } from "../lib/supabase";
import { hasAppAccess, ProfileProvider, CommunitiesProvider, useProfileContext } from "../lib";
import type { CommunityWithMeta } from "../lib";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LogoIcon } from "./components/LogoIcon";

type PageType = 'home' | 'ethics' | 'warnings' | 'privacy' | 'terms' | 'index' | 'social-hub' | 'profile' | 'profile-user' | 'feed' | 'communities' | 'community-detail' | 'roadmap';

// Componente interno que consome os Contexts
function AppContent() {
  const { user: currentUser, isLoading } = useProfileContext();

  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [viewingCommunity, setViewingCommunity] = useState<CommunityWithMeta | null>(null);

  useEffect(() => {
    if (isLoading) return;

    const hash = window.location.hash.replace('#', '');
    const publicPages: Record<string, PageType> = {
      'privacy': 'privacy',
      'terms': 'terms',
      'ethics': 'ethics',
      'warnings': 'warnings',
    };
    if (hash && publicPages[hash]) {
      setCurrentPage(publicPages[hash]);
      return;
    }

    if (currentUser) {
      if (hasAppAccess(currentUser.role)) {
        setCurrentPage('social-hub');
      } else {
        setCurrentPage('index');
      }
    } else {
      setCurrentPage('home');
    }
  }, [currentUser, isLoading]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const publicPages: Record<string, PageType> = {
        'privacy': 'privacy',
        'terms': 'terms',
        'ethics': 'ethics',
        'warnings': 'warnings',
      };
      if (hash && publicPages[hash]) {
        setCurrentPage(publicPages[hash]);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleOpenSignup = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };

  const handleOpenLogin = () => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
  };

  const handleCloseSignup = () => {
    setIsSignupOpen(false);
  };

  const handleCloseLogin = () => {
    setIsLoginOpen(false);
  };

  const handleLoginSuccess = async () => {
    setIsLoginOpen(false);
  };

  const handleSignupSuccess = () => {
    setIsSignupOpen(false);
    setIsOnboardingOpen(true);
  };

  const handleOnboardingComplete = async () => {
    setIsOnboardingOpen(false);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase
        .from('users')
        .update({ onboarding_done: true })
        .eq('id', session.user.id);
    }
    
    setCurrentPage('index');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageType);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleNavigateToUserProfile = (userId: string) => {
    if (userId === currentUser?.id) {
      setCurrentPage('profile');
    } else {
      setViewingUserId(userId);
      setCurrentPage('profile-user');
    }
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleSelectCommunity = (community: CommunityWithMeta) => {
    setViewingCommunity(community);
    setCurrentPage('community-detail');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const getBackPage = (): PageType => {
    if (hasAppAccess(currentUser?.role)) return 'social-hub';
    if (currentUser) return 'index';
    return 'home';
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'ethics':
        return <EthicsPage />;
      case 'warnings':
        return <WarningsPage />;
      case 'privacy':
        return <PrivacyPolicyPage />;
      case 'terms':
        return <TermsOfUsePage />;
      
      case 'index':
        return (
          <IndexPage 
            onNavigateToCommunities={() => handleNavigate('communities')}
            onNavigateToProfile={() => handleNavigate('profile')}
            onNavigateToRoadmap={() => handleNavigate('roadmap')}
            onNavigateToUserProfile={handleNavigateToUserProfile}
          />
        );
      
      case 'roadmap':
        return <RoadmapPage onBack={() => handleNavigate(currentUser ? 'index' : 'home')} />;
      
      case 'social-hub':
        return (
          <SocialHub 
            onNavigateToProfile={() => handleNavigate('profile')}
            onNavigateToCommunities={() => handleNavigate('communities')}
            onNavigateToFeed={() => handleNavigate('feed')}
            onNavigateToUserProfile={handleNavigateToUserProfile}
          />
        );
      
      case 'profile':
        return (
          <ProfileMila 
            onBack={() => handleNavigate(getBackPage())}
            onNavigateToProfile={handleNavigateToUserProfile}
          />
        );
      
      case 'profile-user':
        return (
          <ProfileMila 
            onBack={() => handleNavigate(getBackPage())}
            viewUserId={viewingUserId}
            onNavigateToProfile={handleNavigateToUserProfile}
          />
        );
      
      case 'feed':
        return (
          <FeedPublico 
            onBack={() => handleNavigate(getBackPage())}
            onNavigateToProfile={handleNavigateToUserProfile}
          />
        );
      
      case 'communities':
        return (
          <CommunitiesPage 
            onBack={() => handleNavigate(getBackPage())}
            onSelectCommunity={handleSelectCommunity}
          />
        );
      
      case 'community-detail':
        return viewingCommunity ? (
          <CommunityFeed
            community={viewingCommunity}
            onBack={() => handleNavigate('communities')}
            onNavigateToProfile={handleNavigateToUserProfile}
          />
        ) : (
          <CommunitiesPage 
            onBack={() => handleNavigate(getBackPage())}
            onSelectCommunity={handleSelectCommunity}
          />
        );
      
      // Landing Page
      default:
        return (
          <>
            <HeroSection onCtaClick={handleOpenSignup} />
            <CommunitiesShowcase />
            <CreatorSection />
            <ManifestoSection />
            <MembershipSection onJoinClick={handleOpenSignup} />
          </>
        );
    }
  };

  const hideHeaderFooterPages = ['index', 'social-hub', 'profile', 'profile-user', 'feed', 'communities', 'community-detail', 'roadmap'];
  const shouldShowHeaderFooter = !hideHeaderFooterPages.includes(currentPage);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <LogoIcon size={64} className="h-16 w-16 mx-auto mb-5" />
          <h1 className="text-xl font-semibold text-white mb-4">NeuroConexão Atípica</h1>
          <div className="w-10 h-10 border-3 border-[#81D8D0] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white/40 text-sm mt-4">Conectando ao servidor...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {shouldShowHeaderFooter && (
        <HeaderInstitucional 
          onLoginClick={handleOpenLogin}
          onSignupClick={handleOpenSignup}
          onNavigate={handleNavigate}
        />
      )}
      
      <motion.div
        key={currentPage}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        {renderPage()}
      </motion.div>
      
      {shouldShowHeaderFooter && (
        <FooterInstitucional onNavigate={handleNavigate} />
      )}

      {/* Popups */}
      <SignupPopup 
        isOpen={isSignupOpen}
        onClose={handleCloseSignup}
        onSwitchToLogin={handleOpenLogin}
        onSuccess={handleSignupSuccess}
      />
      
      <LoginPopup 
        isOpen={isLoginOpen}
        onClose={handleCloseLogin}
        onSwitchToSignup={handleOpenSignup}
        onLoginSuccess={handleLoginSuccess}
      />

      <OnboardingFlow
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}

// Componente principal
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