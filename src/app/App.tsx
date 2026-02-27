/**
 * App.tsx — NeuroConexao Atipica
 * 
 * Entrypoint minimalista: apenas RouterProvider.
 * Toda a logica de rotas, layouts, providers e auth esta em routes.tsx.
 * 
 * URLs compartilhaveis:
 *   /                → Landing page
 *   /hub             → Social Hub (feed principal)
 *   /profile         → Meu perfil
 *   /profile/:userId → Perfil de outro membro
 *   /communities     → Lista de comunidades
 *   /community/:id   → Comunidade individual
 *   /events          → Eventos
 *   /event/:id       → Detalhe do evento
 *   /messages        → Mensagens privadas
 *   /admin           → Painel admin (super_admin)
 *   /ethics, /privacy, /terms, etc. → Paginas legais
 *   /welcome         → Boas-vindas pos-aprovacao
 *   /roadmap         → Roadmap
 *   /deploy          → Deploy Bridge
 */

import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function App() {
  return <RouterProvider router={router} />;
}