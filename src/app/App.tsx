import { useState, useEffect, useRef, useCallback } from "react";
// v7-visual: landing consolidada + pós-cadastro ativo + formulário fundadora
import { motion } from "motion/react";
import { HeaderInstitucional } from "./components/HeaderInstitucional";
import { HeroSection } from "./components/HeroSection";
import { SignupPopup } from "./components/SignupPopup";
import { LoginPopup } from "./components/LoginPopup";
import { CommunitiesShowcase } from "./components/CommunitiesShowcase";
import { CreatorSection } from "./components/CreatorSection";
import { NucleoFounderSection } from "./components/NucleoFounderSection";
import { ClaritySection } from "./components/ClaritySection";
import { FooterInstitucional } from "./components/FooterInstitucional";
import { PulsoVivo } from "./components/PulsoVivo";
import { NucleosTerritoriais } from "./components/NucleosTerritoriais";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { WelcomePage } from "./components/WelcomePage";
import { ContactFounderModal } from "./components/ContactFounderModal";
import { EthicsPage } from "./components/EthicsPage";
import { WarningsPage } from "./components/WarningsPage";
import { PrivacyPolicyPage } from "./components/PrivacyPolicyPage";
import { TermsOfUsePage } from "./components/TermsOfUsePage";
import { SocialHub } from "./components/SocialHub";
import { ProfileMila } from "./components/ProfileMila";
import { FeedPublico } from "./components/FeedPublico";
import { CommunitiesPage } from "./components/CommunitiesPage";
import { CommunityPage } from "./components/CommunityPage";
import { RoadmapPage } from "./components/RoadmapPage";
import { LegalPageView } from "./components/LegalPageView";
import { EventsPage } from "./components/EventsPage";
import { EventDetailPage } from "./components/EventDetailPage";
import { supabase } from "../lib/supabase";
import { hasAppAccess, ProfileProvider, CommunitiesProvider, useProfileContext } from "../lib";
import type { CommunityWithMeta } from "../lib";
import type { EventWithMeta } from "../lib";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LogoIcon } from "./components/LogoIcon";

type PageType = 'home' | 'ethics' | 'warnings' | 'privacy' | 'terms' | 'moderation' | 'security' | 'child-protection' | 'welcome' | 'social-hub' | 'profile' | 'profile-user' | 'feed' | 'communities' | 'community-detail' | 'roadmap' | 'events' | 'event-detail';

// Componente interno que consome os Contexts
function AppContent() {
  const { user: currentUser, isLoading } = useProfileContext();

  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isContactFounderOpen, setIsContactFounderOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [openCreatePostOnNav, setOpenCreatePostOnNav] = useState(false);

  // Estado para visualização de perfil de outro usuário
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  // Estado para visualização de comunidade individual
  const [viewingCommunity, setViewingCommunity] = useState<CommunityWithMeta | null>(null);
  // Estado para visualização de evento individual
  const [viewingEvent, setViewingEvent] = useState<EventWithMeta | null>(null);

  // Ref para scroll até Núcleo Fundador
  const nucleoRef = useRef<HTMLElement>(null);
  const agendaRef = useRef<HTMLElement>(null);

  const scrollToNucleo = useCallback(() => {
    nucleoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const scrollToAgenda = useCallback(() => {
    agendaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Roteamento baseado em role — executa quando user muda
  useEffect(() => {
    if (isLoading) return;

    // Checar hash da URL para roteamento direto (ex: #privacy, #terms)
    const hash = window.location.hash.replace('#', '');
    const publicPages: Record<string, PageType> = {
      'privacy': 'privacy',
      'terms': 'terms',
      'ethics': 'ethics',
      'warnings': 'warnings',
      'moderation': 'moderation',
      'security': 'security',
      'child-protection': 'child-protection',
    };
    if (hash && publicPages[hash]) {
      setCurrentPage(publicPages[hash]);
      return;
    }

    // Não redirecionar se está na tela de boas-vindas (pós-cadastro)
    if (currentPage === 'welcome') return;

    if (currentUser) {
      if (hasAppAccess(currentUser.role)) {
        setCurrentPage('social-hub');
      } else {
        // Fallback para visitor ou roles desconhecidos
        setCurrentPage('home');
      }
    } else {
      setCurrentPage('home');
    }
  }, [currentUser, isLoading]);

  // Escutar mudancas de hash (ex: usuario digitar #privacy na URL)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const publicPages: Record<string, PageType> = {
        'privacy': 'privacy',
        'terms': 'terms',
        'ethics': 'ethics',
        'warnings': 'warnings',
        'moderation': 'moderation',
        'security': 'security',
        'child-protection': 'child-protection',
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
    // O ProfileProvider detecta SIGNED_IN e recarrega automaticamente
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
    
    // Mostrar tela de boas-vindas ativa (não sala de espera)
    setCurrentPage('welcome');
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

  const handleSelectEvent = (event: EventWithMeta) => {
    setViewingEvent(event);
    setCurrentPage('event-detail');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const getBackPage = (): PageType => {
    if (hasAppAccess(currentUser?.role)) return 'social-hub';
    return 'home';
  };

  // Welcome page actions
  const handleWelcomeCreatePost = () => {
    setOpenCreatePostOnNav(true);
    setCurrentPage('social-hub');
  };

  const handleWelcomeCompleteProfile = () => {
    setCurrentPage('profile');
  };

  const handleWelcomeContactFounder = () => {
    setIsContactFounderOpen(true);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'ethics':
        return <LegalPageView pageKey="ethics" fallback={<EthicsPage />} onBack={() => handleNavigate('home')} />;
      case 'warnings':
        return <WarningsPage />;
      case 'privacy':
        return <LegalPageView pageKey="privacy_policy" fallback={<PrivacyPolicyPage />} onBack={() => handleNavigate('home')} />;
      case 'terms':
        return <LegalPageView pageKey="terms_of_use" fallback={<TermsOfUsePage />} onBack={() => handleNavigate('home')} />;
      case 'moderation':
        return <LegalPageView pageKey="moderation_policy" onBack={() => handleNavigate('home')} />;
      case 'security':
        return <LegalPageView pageKey="security_policy" onBack={() => handleNavigate('home')} />;
      case 'child-protection':
        return <LegalPageView pageKey="child_protection_policy" onBack={() => handleNavigate('home')} />;
      
      case 'welcome':
        return (
          <WelcomePage
            onCreatePost={handleWelcomeCreatePost}
            onCompleteProfile={handleWelcomeCompleteProfile}
            onContactFounder={handleWelcomeContactFounder}
          />
        );
      
      case 'roadmap':
        return <RoadmapPage onBack={() => handleNavigate(currentUser ? 'social-hub' : 'home')} />;
      
      case 'social-hub':
        return (
          <SocialHub 
            onNavigateToProfile={() => handleNavigate('profile')}
            onNavigateToCommunities={() => handleNavigate('communities')}
            onNavigateToFeed={() => handleNavigate('feed')}
            onNavigateToUserProfile={handleNavigateToUserProfile}
            onNavigateToEvents={() => handleNavigate('events')}
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
          <CommunityPage
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
      
      case 'events':
        return <EventsPage onBack={() => handleNavigate(getBackPage())} onSelectEvent={handleSelectEvent} />;
      
      case 'event-detail':
        return viewingEvent ? (
          <EventDetailPage
            eventId={viewingEvent.id}
            onBack={() => handleNavigate('events')}
            onNavigateToProfile={handleNavigateToUserProfile}
          />
        ) : (
          <EventsPage onBack={() => handleNavigate(getBackPage())} onSelectEvent={handleSelectEvent} />
        );
      
      // Landing Page — 8 seções completas
      default:
        return (
          <>
            <HeroSection onCtaClick={handleOpenSignup} onScrollToAgenda={scrollToAgenda} onScrollToNucleo={scrollToNucleo} />
            <PulsoVivo ref={agendaRef} />
            <CommunitiesShowcase />
            <NucleosTerritoriais />
            <NucleoFounderSection ref={nucleoRef} />
            <CreatorSection />
            <ClaritySection onCtaClick={handleOpenSignup} />
          </>
        );
    }
  };

  // Páginas que NÃO mostram header/footer institucional
  const hideHeaderFooterPages = ['welcome', 'social-hub', 'profile', 'profile-user', 'feed', 'communities', 'community-detail', 'roadmap', 'events', 'event-detail'];
  const shouldShowHeaderFooter = !hideHeaderFooterPages.includes(currentPage);

  // Loading inicial — só depende de isLoading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#D4D4D4" }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <LogoIcon size={64} className="h-16 w-16 mx-auto mb-5" />
          <h1 className="text-xl text-[#1A1A1A] mb-4" style={{ fontWeight: 600 }}>NeuroConexão Atípica</h1>
          <div className="w-10 h-10 border-3 border-[#C8102E] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[#999] text-sm mt-4">Conectando...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#D4D4D4" }}>
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

      <ContactFounderModal
        isOpen={isContactFounderOpen}
        onClose={() => setIsContactFounderOpen(false)}
      />
    </div>
  );
}

// Componente principal: wraps com Providers (instância ÚNICA de cada)
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