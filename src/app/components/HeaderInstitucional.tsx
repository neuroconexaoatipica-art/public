import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { LogoIcon } from "./LogoIcon";

interface HeaderInstitucionalProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  onNavigate?: (page: string) => void;
  onScrollToAgenda?: () => void;
}

export function HeaderInstitucional({ onLoginClick, onSignupClick, onNavigate, onScrollToAgenda }: HeaderInstitucionalProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`w-full sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-black/10" 
          : "bg-[#D4D4D4]/90 backdrop-blur-sm border-b border-[#1A1A1A]/8"
      }`}
    >
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <LogoIcon size={48} className="h-10 w-10 md:h-12 md:w-12" />
            <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-[#81D8D0]/40 flex-shrink-0">
              <img src="/mila-creator.png" alt="Mila" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <h1 className="text-lg md:text-xl lg:text-2xl font-semibold text-[#1A1A1A] tracking-tight">
              NeuroConexão Atípica
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10">
            <nav className="flex items-center gap-8">
              <button 
                onClick={() => onNavigate?.('ethics')}
                className="text-sm lg:text-base text-[#555] hover:text-[#C8102E] transition-colors relative group font-medium"
              >
                Ética
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#C8102E] transition-all group-hover:w-full" />
              </button>
              <button 
                onClick={() => onNavigate?.('warnings')}
                className="text-sm lg:text-base text-[#555] hover:text-[#C8102E] transition-colors relative group font-medium"
              >
                Avisos
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#C8102E] transition-all group-hover:w-full" />
              </button>
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={onLoginClick}
                className="text-sm lg:text-base px-4 lg:px-5 py-2 text-[#555] hover:text-[#1A1A1A] transition-colors font-semibold"
              >
                Entrar
              </button>
              <button
                onClick={onSignupClick}
                className="text-sm lg:text-base px-5 lg:px-6 py-2.5 bg-[#C8102E] text-white rounded-xl hover:bg-[#C8102E]/90 transition-all hover:shadow-lg font-semibold"
              >
                Cadastrar
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-black/5 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-[#1A1A1A]" />
            ) : (
              <Menu className="h-6 w-6 text-[#1A1A1A]" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-black/10 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <button 
              onClick={() => {
                onNavigate?.('ethics');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-[#555] hover:text-[#C8102E] hover:bg-black/5 rounded-lg transition-colors font-medium"
            >
              Ética
            </button>
            <button 
              onClick={() => {
                onNavigate?.('warnings');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-[#555] hover:text-[#C8102E] hover:bg-black/5 rounded-lg transition-colors font-medium"
            >
              Avisos
            </button>
            <div className="flex flex-col gap-2 px-4 pt-2">
              <button
                onClick={() => {
                  onLoginClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-[#555] border border-[#999]/30 rounded-xl hover:bg-black/5 transition-colors font-semibold"
              >
                Entrar
              </button>
              <button
                onClick={() => {
                  onSignupClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-[#C8102E] text-white rounded-xl hover:bg-[#C8102E]/90 transition-colors font-semibold"
              >
                Cadastrar
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}