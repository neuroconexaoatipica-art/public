/**
 * ModalContext — Gerencia estado global dos modais (signup, login, onboarding, contato)
 * Permite que qualquer componente dentro do Router abra/feche modais sem prop drilling.
 */

import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface ModalContextValue {
  isSignupOpen: boolean;
  isLoginOpen: boolean;
  isOnboardingOpen: boolean;
  isContactFounderOpen: boolean;
  openSignup: () => void;
  openLogin: () => void;
  closeSignup: () => void;
  closeLogin: () => void;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  openContactFounder: () => void;
  closeContactFounder: () => void;
  /** Signup concluido: fecha signup, abre onboarding */
  handleSignupSuccess: () => void;
  /** Login concluido: fecha login */
  handleLoginSuccess: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isContactFounderOpen, setIsContactFounderOpen] = useState(false);

  const openSignup = useCallback(() => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  }, []);

  const openLogin = useCallback(() => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
  }, []);

  const closeSignup = useCallback(() => setIsSignupOpen(false), []);
  const closeLogin = useCallback(() => setIsLoginOpen(false), []);
  const openOnboarding = useCallback(() => setIsOnboardingOpen(true), []);
  const closeOnboarding = useCallback(() => setIsOnboardingOpen(false), []);
  const openContactFounder = useCallback(() => setIsContactFounderOpen(true), []);
  const closeContactFounder = useCallback(() => setIsContactFounderOpen(false), []);

  const handleSignupSuccess = useCallback(() => {
    setIsSignupOpen(false);
    setIsOnboardingOpen(true);
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setIsLoginOpen(false);
    // ProfileProvider detecta SIGNED_IN e recarrega automaticamente
  }, []);

  return (
    <ModalContext.Provider
      value={{
        isSignupOpen,
        isLoginOpen,
        isOnboardingOpen,
        isContactFounderOpen,
        openSignup,
        openLogin,
        closeSignup,
        closeLogin,
        openOnboarding,
        closeOnboarding,
        openContactFounder,
        closeContactFounder,
        handleSignupSuccess,
        handleLoginSuccess,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModalContext() {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error('useModalContext must be used within ModalProvider');
  }
  return ctx;
}
