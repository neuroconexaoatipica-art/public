{
  "lote": 4,
  "status": "pending",
  "file_path": "src/app/components/InlineBadges.tsx",
  "created_at": "2026-02-27T05:36:25.875Z",
  "file_content": "/**\n * InlineBadges — Carrega e exibe badges compactas ao lado de nomes\n * Uso: <InlineBadges userId=\"xxx\" />\n * Renderiza emojis das badges ativas do usuario.\n * Fail silencioso — se nao houver badges ou erro, nao renderiza nada.\n */\n\nimport { useBadges } from '../../lib';\nimport { BadgeDisplay } from './BadgeDisplay';\n\ninterface InlineBadgesProps {\n  userId?: string;\n  maxVisible?: number;\n  className?: string;\n}\n\nexport function InlineBadges({ userId, maxVisible = 3, className = '' }: InlineBadgesProps) {\n  const { badges } = useBadges(userId);\n\n  if (!badges || badges.length === 0) return null;\n\n  return (\n    <BadgeDisplay\n      badges={badges}\n      compact\n      maxVisible={maxVisible}\n      className={className}\n    />\n  );\n}\n"
}