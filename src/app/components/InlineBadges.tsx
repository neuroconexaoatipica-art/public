/**
 * InlineBadges — Carrega e exibe badges compactas ao lado de nomes
 * Uso: <InlineBadges userId="xxx" />
 * Renderiza emojis das badges ativas do usuario.
 * Fail silencioso — se nao houver badges ou erro, nao renderiza nada.
 */

import { useBadges } from '../../lib';
import { BadgeDisplay } from './BadgeDisplay';

interface InlineBadgesProps {
  userId?: string;
  maxVisible?: number;
  className?: string;
}

export function InlineBadges({ userId, maxVisible = 3, className = '' }: InlineBadgesProps) {
  const { badges } = useBadges(userId);

  if (!badges || badges.length === 0) return null;

  return (
    <BadgeDisplay
      badges={badges}
      compact
      maxVisible={maxVisible}
      className={className}
    />
  );
}
