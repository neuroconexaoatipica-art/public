{
  "lote": 1,
  "status": "pending",
  "file_path": "src/app/App.tsx",
  "created_at": "2026-02-27T05:36:09.226Z",
  "file_content": "/**\n * App.tsx — NeuroConexao Atipica\n * \n * Entrypoint minimalista: apenas RouterProvider.\n * Toda a logica de rotas, layouts, providers e auth esta em routes.tsx.\n * \n * URLs compartilhaveis:\n *   /                → Landing page\n *   /hub             → Social Hub (feed principal)\n *   /profile         → Meu perfil\n *   /profile/:userId → Perfil de outro membro\n *   /communities     → Lista de comunidades\n *   /community/:id   → Comunidade individual\n *   /events          → Eventos\n *   /event/:id       → Detalhe do evento\n *   /messages        → Mensagens privadas\n *   /admin           → Painel admin (super_admin)\n *   /ethics, /privacy, /terms, etc. → Paginas legais\n *   /welcome         → Boas-vindas pos-aprovacao\n *   /roadmap         → Roadmap\n *   /deploy          → Deploy Bridge\n */\n\nimport { RouterProvider } from \"react-router\";\nimport { router } from \"./routes\";\n\nexport default function App() {\n  return <RouterProvider router={router} />;\n}"
}