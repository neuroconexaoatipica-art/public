import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import './styles/index.css'

// Limpar cache problematico de versoes anteriores
const CACHE_VERSION = 'v5';
const storedVersion = localStorage.getItem('app_version');

if (storedVersion !== CACHE_VERSION) {
  const supabaseKeys = Object.keys(localStorage).filter(key => 
    key.startsWith('sb-') || key.includes('supabase')
  );
  
  const supabaseData: Record<string, string> = {};
  supabaseKeys.forEach(key => {
    supabaseData[key] = localStorage.getItem(key) || '';
  });
  
  localStorage.clear();
  sessionStorage.clear();
  
  Object.entries(supabaseData).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
  
  localStorage.setItem('app_version', CACHE_VERSION);
  
  console.log('Cache limpo e atualizado para versao', CACHE_VERSION);
}

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
