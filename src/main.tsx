import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import './styles/index.css'

// Limpar cache problemático de versões anteriores
const CACHE_VERSION = 'v5';
const storedVersion = localStorage.getItem('app_version');

if (storedVersion !== CACHE_VERSION) {
  // Limpar tudo exceto dados essenciais do Supabase
  const supabaseKeys = Object.keys(localStorage).filter(key => 
    key.startsWith('sb-') || key.includes('supabase')
  );
  
  const supabaseData: Record<string, string> = {};
  supabaseKeys.forEach(key => {
    supabaseData[key] = localStorage.getItem(key) || '';
  });
  
  // Limpar tudo
  localStorage.clear();
  sessionStorage.clear();
  
  // Restaurar dados do Supabase
  Object.entries(supabaseData).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
  
  // Salvar nova versão
  localStorage.setItem('app_version', CACHE_VERSION);
  
  console.log('Cache limpo e atualizado para versão', CACHE_VERSION);
}

// Forçar atualização do SW em cada page load
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((reg) => reg.update());
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)