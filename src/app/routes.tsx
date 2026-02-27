/**
 * routes.tsx — React Router config para NeuroConexão Atípica
 * 
 * Abordagem WRAPPER SEGURA: componentes existentes NÃO mudam.
 * Cada rota tem um wrapper que cria as props esperadas pelo componente.
 * useNavigate() substitui o antigo handleNavigate/currentPage.
 */

import { createBrowserRouter, Outlet, useNavigate, useParams, Navigate, useLocation } from "react-router";
import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { motion } from "motion/react";

// ── Providers e Contextos ──
import { ProfileProvider, useProfileContext } from "../lib/ProfileContext";
import { CommunitiesProvider, useCommunitiesContext } from "../lib/CommunitiesContext";
import { ModalProvider, useModalContext } from "../lib/ModalContext";
import { hasAppAccess, isSuperAdmin } from "../lib/roleEngine";
import { isWaitingApproval, isBanned } from "../lib/roleEngine";
import { supabase } from "../lib/supabase";

// ── Componentes Landing (sempre carregados) ──
import { HeaderInstitucional } from "./components/HeaderInstitucional";
import { HeroSection } from "./components/HeroSection";
import { CommunitiesShowcase } from "./components/CommunitiesShowcase";
import { CreatorSection } from "./components/CreatorSection";
import { NucleoFounderSection } from "./components/NucleoFounderSection";
import { ClaritySection } from "./components/ClaritySection";
import { FooterInstitucional } from "./components/FooterInstitucional";
import { PulsoVivo } from "./components/PulsoVivo";
import { NucleosTerritoriais } from "./components/NucleosTerritoriais";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { PlansSection } from "./components/PlansSection";
import { EncounterBanner } from "./components/EncounterBanner";
import { WeeklyHighlights } from "./components/WeeklyHighlights";
import { FounderVideoSection } from "./components/FounderVideoSection";
import { ManifestoSection } from "./components/ManifestoSection";
import { SocialProofStrip } from "./components/SocialProofStrip";
import { TestimonialsCarousel } from "./components/TestimonialsCarousel";
import { FAQSection } from "./components/FAQSection";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LogoIcon } from "./components/LogoIcon";
import { NotFoundPage } from "./components/NotFoundPage";

// ── Modais (sempre carregados) ──
import { SignupPopup } from "./components/SignupPopup";
import { LoginPopup } from "./components/LoginPopup";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { ContactFounderModal } from "./components/ContactFounderModal";

// ── Paginas internas (lazy) ──
const WelcomePage = lazy(() => import("./components/WelcomePage").then(m => ({ default: m.WelcomePage })));
const SocialHub = lazy(() => import("./components/SocialHub").then(m => ({ default: m.SocialHub })));
const ProfileMila = lazy(() => import("./components/ProfileMila").then(m => ({ default: m.ProfileMila })));
const FeedPublico = lazy(() => import("./components/FeedPublico").then(m => ({ default: m.FeedPublico })));
const CommunitiesPage = lazy(() => import("./components/CommunitiesPage").then(m => ({ default: m.CommunitiesPage })));
const CommunityPage = lazy(() => import("./components/CommunityPage").then(m => ({ default: m.CommunityPage })));
const EventsPage = lazy(() => import("./components/EventsPage").then(m => ({ default: m.EventsPage })));
const EventDetailPage = lazy(() => import("./components/EventDetailPage").then(m => ({ default: m.EventDetailPage })));
const MessagesPage = lazy(() => import("./components/MessagesPage").then(m => ({ default: m.MessagesPage })));
const AdminDashboard = lazy(() => import("./components/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const RoadmapPage = lazy(() => import("./components/RoadmapPage").then(m => ({ default: m.RoadmapPage })));
const WaitingRoom = lazy(() => import("./components/WaitingRoom").then(m => ({ default: m.WaitingRoom })));
const SettingsPage = lazy(() => import("./components/SettingsPage").then(m => ({ default: m.SettingsPage })));
const FoundersRoom = lazy(() => import("./components/FoundersRoom").then(m => ({ default: m.FoundersRoom })));

// Legal pages
const EthicsPage = lazy(() => import("./components/EthicsPage").then(m => ({ default: m.EthicsPage })));
const WarningsPage = lazy(() => import("./components/WarningsPage").then(m => ({ default: m.WarningsPage })));
const PrivacyPolicyPage = lazy(() => import("./components/PrivacyPolicyPage").then(m => ({ default: m.PrivacyPolicyPage })));
const TermsOfUsePage = lazy(() => import("./components/TermsOfUsePage").then(m => ({ default: m.TermsOfUsePage })));
const LegalPageView = lazy(() => import("./components/LegalPageView").then(m => ({ default: m.LegalPageView })));

// ═══════════════════════════════════════════════════════════
// LOADING FALLBACK
// ═══════════════════════════════════════════════════════════
function LazyFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#000" }}>
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-[#C8102E] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[#999] text-sm mt-4">Carregando...</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ROOT LAYOUT — Providers + Modais + Auth Interceptors
// ═══════════════════════════════════════════════════════════
function RootLayout() {
  return (
    <ErrorBoundary>
      <ProfileProvider>
        <CommunitiesProvider>
          <ModalProvider>
            <RootLayoutInner />
          </ModalProvider>
        </CommunitiesProvider>
      </ProfileProvider>
    </ErrorBoundary>
  );
}

function RootLayoutInner() {
  const { user: currentUser, isLoading } = useProfileContext();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isSignupOpen, isLoginOpen, isOnboardingOpen, isContactFounderOpen,
    openSignup, openLogin, closeSignup, closeLogin,
    closeOnboarding, closeContactFounder,
    handleSignupSuccess, handleLoginSuccess,
  } = useModalContext();

  // ── Compatibilidade: redirecionar hash antigos para rotas reais ──
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    const hashRoutes: Record<string, string> = {
      'privacy': '/privacy',
      'terms': '/terms',
      'ethics': '/ethics',
      'warnings': '/warnings',
      'moderation': '/moderation',
      'security': '/security',
      'child-protection': '/child-protection',
      'deploy': '/deploy',
    };
    if (hash && hashRoutes[hash]) {
      navigate(hashRoutes[hash], { replace: true });
    }
  }, []);

  // ── Onboarding concluido → gravar e redirecionar ──
  const handleOnboardingComplete = async () => {
    closeOnboarding();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase
        .from('users')
        .update({ onboarding_done: true })
        .eq('id', session.user.id);
    }
    navigate('/welcome');
  };

  // ── Loading global ──
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
          <h1 className="text-xl text-[#1A1A1A] mb-4" style={{ fontWeight: 600 }}>NeuroConexao Atipica</h1>
          <div className="w-10 h-10 border-3 border-[#C8102E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#999] text-sm mt-4">Conectando...</p>
        </motion.div>
      </div>
    );
  }

  // ── Interceptor: WaitingRoom ──
  if (currentUser && isWaitingApproval(currentUser.role)) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-black" />}>
        <WaitingRoom onLogout={async () => { await supabase.auth.signOut(); navigate('/'); }} />
      </Suspense>
    );
  }

  // ── Interceptor: Banido ──
  if (currentUser && isBanned(currentUser.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#0A0A0A" }}>
        <div className="max-w-md text-center">
          <LogoIcon size={48} className="h-12 w-12 mx-auto mb-6" />
          <h1 className="text-2xl text-white mb-3" style={{ fontWeight: 700 }}>Acesso suspenso</h1>
          <p className="text-sm text-white/50 mb-6">
            Sua conta foi suspensa. Se acredita que isso e um erro, entre em contato pelo formulario da landing page.
          </p>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate('/'); }}
            className="px-6 py-3 bg-white/10 text-white/60 rounded-xl text-sm hover:bg-white/15 transition-colors"
            style={{ fontWeight: 600 }}
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Paginas com transicao */}
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <Outlet />
      </motion.div>

      {/* Modais globais — acessiveis de qualquer rota */}
      <SignupPopup
        isOpen={isSignupOpen}
        onClose={closeSignup}
        onSwitchToLogin={openLogin}
        onSuccess={handleSignupSuccess}
      />
      <LoginPopup
        isOpen={isLoginOpen}
        onClose={closeLogin}
        onSwitchToSignup={openSignup}
        onLoginSuccess={handleLoginSuccess}
      />
      <OnboardingFlow
        isOpen={isOnboardingOpen}
        onClose={closeOnboarding}
        onComplete={handleOnboardingComplete}
      />
      <ContactFounderModal
        isOpen={isContactFounderOpen}
        onClose={closeContactFounder}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// PUBLIC LAYOUT — Header + Footer (landing + paginas legais)
// ═══════════════════════════════════════════════════════════
function PublicLayout() {
  const { openLogin, openSignup } = useModalContext();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: "#D4D4D4" }}>
      <HeaderInstitucional
        onLoginClick={openLogin}
        onSignupClick={openSignup}
        onNavigate={(page) => navigate(`/${page}`)}
      />
      <Outlet />
      <FooterInstitucional onNavigate={(page) => navigate(`/${page}`)} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// AUTH LAYOUT — Protege rotas internas (precisa estar logado)
// ═══════════════════════════════════════════════════════════
function AuthLayout() {
  const { user } = useProfileContext();

  // Se nao tem usuario ou nao tem acesso → redirecionar pra landing
  if (!user || !hasAppAccess(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <Suspense fallback={<LazyFallback />}>
      <Outlet />
    </Suspense>
  );
}

// ═══════════════════════════════════════════════════════════
// WRAPPERS — Ponte entre React Router e componentes existentes
// Cada wrapper cria as props que o componente espera.
// ═══════════════════════════════════════════════════════════

// ── Landing Page (16 secoes) ──
function LandingRoute() {
  const { user } = useProfileContext();
  const navigate = useNavigate();
  const { openSignup } = useModalContext();
  const nucleoRef = useRef<HTMLElement>(null);
  const agendaRef = useRef<HTMLElement>(null);

  const scrollToAgenda = useCallback(() => {
    agendaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const scrollToNucleo = useCallback(() => {
    nucleoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Redirecionar usuario logado com acesso para o hub
  useEffect(() => {
    if (user && hasAppAccess(user.role)) {
      navigate('/hub', { replace: true });
    }
  }, [user, navigate]);

  // Se vai redirecionar, nao renderizar landing
  if (user && hasAppAccess(user.role)) return null;

  return (
    <>
      {/* 1. GANCHO */}
      <HeroSection onCtaClick={openSignup} onScrollToAgenda={scrollToAgenda} onScrollToNucleo={scrollToNucleo} />
      {/* 2. PULSO */}
      <PulsoVivo ref={agendaRef} />
      {/* 3. PROVA */}
      <SocialProofStrip />
      {/* 4. ATIVIDADE */}
      <WeeklyHighlights />
      {/* 5. TERRITORIOS */}
      <CommunitiesShowcase />
      {/* 6. COMO */}
      <HowItWorksSection />
      {/* 7. VOZES */}
      <TestimonialsCarousel />
      {/* 8. URGENCIA */}
      <PlansSection onCtaClick={openSignup} />
      {/* 9. VIDEO */}
      <FounderVideoSection />
      {/* 10. LIDERANCA */}
      <NucleoFounderSection ref={nucleoRef} />
      {/* 11. NUCLEOS */}
      <NucleosTerritoriais />
      {/* 12. EVENTO */}
      <EncounterBanner />
      {/* 13. CRIADORA */}
      <CreatorSection />
      {/* 14. MANIFESTO */}
      <ManifestoSection />
      {/* 15. FAQ */}
      <FAQSection />
      {/* 16. CTA FINAL */}
      <ClaritySection onCtaClick={openSignup} />
    </>
  );
}

// ── Paginas Legais ──
function LegalRoute({ pageKey, fallback }: { pageKey: string; fallback?: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <Suspense fallback={<LazyFallback />}>
      <LegalPageView pageKey={pageKey} fallback={fallback} onBack={() => navigate('/')} />
    </Suspense>
  );
}

function WarningsRoute() {
  return (
    <Suspense fallback={<LazyFallback />}>
      <WarningsPage />
    </Suspense>
  );
}

// ── Welcome ──
function WelcomeRoute() {
  const navigate = useNavigate();
  const { openContactFounder } = useModalContext();
  return (
    <Suspense fallback={<LazyFallback />}>
      <WelcomePage
        onCreatePost={() => navigate('/hub')}
        onCompleteProfile={() => navigate('/profile')}
        onContactFounder={openContactFounder}
      />
    </Suspense>
  );
}

// ── Social Hub ──
function SocialHubRoute() {
  const navigate = useNavigate();
  return (
    <SocialHub
      onNavigateToProfile={() => navigate('/profile')}
      onNavigateToCommunities={() => navigate('/communities')}
      onNavigateToFeed={() => navigate('/feed')}
      onNavigateToUserProfile={(userId) => navigate(`/profile/${userId}`)}
      onNavigateToEvents={() => navigate('/events')}
      onNavigateToMessages={() => navigate('/messages')}
      onNavigateToAdmin={() => navigate('/admin')}
      onNavigateToSettings={() => navigate('/settings')}
      onNavigateToFoundersRoom={() => navigate('/founders-room')}
    />
  );
}

// ── Perfil (proprio ou de outro user) ──
function ProfileRoute() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user } = useProfileContext();
  const backPath = user && hasAppAccess(user.role) ? '/hub' : '/';
  return (
    <ProfileMila
      onBack={() => navigate(backPath)}
      viewUserId={userId || null}
      onNavigateToProfile={(id) => navigate(`/profile/${id}`)}
    />
  );
}

// ── Feed ──
function FeedRoute() {
  const navigate = useNavigate();
  const { user } = useProfileContext();
  const backPath = user && hasAppAccess(user.role) ? '/hub' : '/';
  return (
    <FeedPublico
      onBack={() => navigate(backPath)}
      onNavigateToProfile={(userId) => navigate(`/profile/${userId}`)}
    />
  );
}

// ── Comunidades (lista) ──
function CommunitiesRoute() {
  const navigate = useNavigate();
  const { user } = useProfileContext();
  const backPath = user && hasAppAccess(user.role) ? '/hub' : '/';
  return (
    <CommunitiesPage
      onBack={() => navigate(backPath)}
      onSelectCommunity={(community) => navigate(`/community/${community.id}`)}
    />
  );
}

// ── Comunidade (detalhe) ──
function CommunityDetailRoute() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getCommunityById, isLoading } = useCommunitiesContext();

  const community = id ? getCommunityById(id) : undefined;

  // Ainda carregando comunidades
  if (isLoading) {
    return <LazyFallback />;
  }

  // Comunidade nao encontrada
  if (!community) {
    return <NotFoundPage />;
  }

  return (
    <CommunityPage
      community={community}
      onBack={() => navigate('/communities')}
      onNavigateToProfile={(userId) => navigate(`/profile/${userId}`)}
    />
  );
}

// ── Eventos (lista) ──
function EventsRoute() {
  const navigate = useNavigate();
  const { user } = useProfileContext();
  const backPath = user && hasAppAccess(user.role) ? '/hub' : '/';
  return (
    <EventsPage
      onBack={() => navigate(backPath)}
      onSelectEvent={(event) => navigate(`/event/${event.id}`)}
    />
  );
}

// ── Evento (detalhe) ──
function EventDetailRoute() {
  const navigate = useNavigate();
  const { id } = useParams();

  if (!id) {
    return <NotFoundPage />;
  }

  return (
    <EventDetailPage
      eventId={id}
      onBack={() => navigate('/events')}
      onNavigateToProfile={(userId) => navigate(`/profile/${userId}`)}
    />
  );
}

// ── Mensagens ──
function MessagesRoute() {
  const navigate = useNavigate();
  const { user } = useProfileContext();
  const backPath = user && hasAppAccess(user.role) ? '/hub' : '/';
  return (
    <MessagesPage
      onBack={() => navigate(backPath)}
      onNavigateToProfile={(userId) => navigate(`/profile/${userId}`)}
    />
  );
}

// ── Admin ──
function AdminRoute() {
  const navigate = useNavigate();
  const { user } = useProfileContext();

  if (!isSuperAdmin(user?.role)) {
    return <Navigate to="/hub" replace />;
  }

  return (
    <AdminDashboard
      onBack={() => navigate('/hub')}
      onNavigateToProfile={(userId) => navigate(`/profile/${userId}`)}
    />
  );
}

// ── Roadmap ──
function RoadmapRoute() {
  const navigate = useNavigate();
  const { user } = useProfileContext();
  const backPath = user && hasAppAccess(user.role) ? '/hub' : '/';
  return <RoadmapPage onBack={() => navigate(backPath)} />;
}

// ── Deploy Bridge ──
function DeployRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Carregando Deploy Bridge...</div>}>
      <DeployBridge />
    </Suspense>
  );
}

// ── Settings ──
function SettingsRoute() {
  const navigate = useNavigate();
  const { user } = useProfileContext();
  const backPath = user && hasAppAccess(user.role) ? '/hub' : '/';
  return (
    <SettingsPage
      onBack={() => navigate(backPath)}
      onNavigateToProfile={(userId) => navigate(`/profile/${userId}`)}
    />
  );
}

// ── Founders Room ──
function FoundersRoomRoute() {
  const navigate = useNavigate();
  const { user } = useProfileContext();
  const backPath = user && hasAppAccess(user.role) ? '/hub' : '/';
  return (
    <FoundersRoom
      onBack={() => navigate(backPath)}
      onNavigateToProfile={(userId) => navigate(`/profile/${userId}`)}
    />
  );
}

// ═══════════════════════════════════════════════════════════
// ROUTER CONFIG
// ═══════════════════════════════════════════════════════════

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      // ── Rotas publicas (com header/footer) ──
      {
        Component: PublicLayout,
        children: [
          { index: true, Component: LandingRoute },
          {
            path: "ethics",
            element: <LegalRoute pageKey="ethics" fallback={<Suspense fallback={<LazyFallback />}><EthicsPage /></Suspense>} />,
          },
          { path: "warnings", Component: WarningsRoute },
          {
            path: "privacy",
            element: <LegalRoute pageKey="privacy_policy" fallback={<Suspense fallback={<LazyFallback />}><PrivacyPolicyPage /></Suspense>} />,
          },
          {
            path: "terms",
            element: <LegalRoute pageKey="terms_of_use" fallback={<Suspense fallback={<LazyFallback />}><TermsOfUsePage /></Suspense>} />,
          },
          {
            path: "moderation",
            element: <LegalRoute pageKey="moderation_policy" />,
          },
          {
            path: "security",
            element: <LegalRoute pageKey="security_policy" />,
          },
          {
            path: "child-protection",
            element: <LegalRoute pageKey="child_protection_policy" />,
          },
        ],
      },

      // ── Rotas protegidas (sem header/footer, precisa de auth) ──
      {
        Component: AuthLayout,
        children: [
          { path: "welcome", Component: WelcomeRoute },
          { path: "hub", Component: SocialHubRoute },
          { path: "profile", Component: ProfileRoute },
          { path: "profile/:userId", Component: ProfileRoute },
          { path: "feed", Component: FeedRoute },
          { path: "communities", Component: CommunitiesRoute },
          { path: "community/:id", Component: CommunityDetailRoute },
          { path: "events", Component: EventsRoute },
          { path: "event/:id", Component: EventDetailRoute },
          { path: "messages", Component: MessagesRoute },
          { path: "admin", Component: AdminRoute },
          { path: "roadmap", Component: RoadmapRoute },
          { path: "settings", Component: SettingsRoute },
          { path: "founders-room", Component: FoundersRoomRoute },
        ],
      },

      // ── Deploy Bridge (rota especial, sem layout) ──
      { path: "deploy", Component: DeployRoute },

      // ── 404 ──
      { path: "*", Component: NotFoundPage },
    ],
  },
]);