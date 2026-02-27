/**
 * BadgeDisplay — Componente visual de badges
 * Usado em: perfis, posts, comentarios, listas de membros
 */

import { BADGE_CONFIG, type BadgeType, type UserBadge } from '../../lib';

interface BadgeDisplayProps {
  badges: UserBadge[];
  /** Modo compacto: so emojis em linha */
  compact?: boolean;
  /** Max badges visiveis (default: todos) */
  maxVisible?: number;
  className?: string;
}

export function BadgeDisplay({ badges, compact = false, maxVisible, className = '' }: BadgeDisplayProps) {
  if (!badges || badges.length === 0) return null;

  const visibleBadges = maxVisible ? badges.slice(0, maxVisible) : badges;
  const hiddenCount = maxVisible ? Math.max(0, badges.length - maxVisible) : 0;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-0.5 ${className}`}>
        {visibleBadges.map((badge) => {
          const config = BADGE_CONFIG[badge.badge_type];
          if (!config) return null;
          return (
            <span
              key={badge.id}
              title={`${config.label}: ${config.description}`}
              className="cursor-default text-xs"
            >
              {config.emoji}
            </span>
          );
        })}
        {hiddenCount > 0 && (
          <span className="text-[10px] text-white/40 ml-0.5">+{hiddenCount}</span>
        )}
      </span>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {visibleBadges.map((badge) => {
        const config = BADGE_CONFIG[badge.badge_type];
        if (!config) return null;
        return (
          <span
            key={badge.id}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
            style={{
              backgroundColor: config.bgColor,
              color: config.color,
            }}
            title={config.description}
          >
            <span>{config.emoji}</span>
            <span className="font-medium">{config.label}</span>
          </span>
        );
      })}
      {hiddenCount > 0 && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white/5 text-white/40">
          +{hiddenCount}
        </span>
      )}
    </div>
  );
}

/** Badge individual — para uso inline ao lado de nomes */
interface SingleBadgeProps {
  badgeType: BadgeType;
  size?: 'sm' | 'md';
}

export function SingleBadge({ badgeType, size = 'sm' }: SingleBadgeProps) {
  const config = BADGE_CONFIG[badgeType];
  if (!config) return null;

  if (size === 'sm') {
    return (
      <span
        title={`${config.label}: ${config.description}`}
        className="cursor-default"
      >
        {config.emoji}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
      }}
      title={config.description}
    >
      <span>{config.emoji}</span>
      <span className="font-medium">{config.label}</span>
    </span>
  );
}
