import { motion } from "motion/react";
import { Eye } from "lucide-react";
import { useProfileVisits } from "../../lib";
import { UserAvatar } from "./UserAvatar";

interface ProfileVisitsBadgeProps {
  userId: string;
  isOwnProfile: boolean;
  onNavigateToProfile?: (userId: string) => void;
}

export function ProfileVisitsBadge({ userId, isOwnProfile, onNavigateToProfile }: ProfileVisitsBadgeProps) {
  const { visits, visitCount, isLoading } = useProfileVisits(userId);

  if (isLoading || (!isOwnProfile && visitCount === 0)) return null;

  // Só o dono do perfil vê quem visitou
  if (!isOwnProfile) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/3 border border-white/8 rounded-xl p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Eye className="h-4 w-4 text-[#81D8D0]" />
        <h3 className="text-white text-sm" style={{ fontWeight: 700 }}>
          Quem visitou seu perfil
        </h3>
        {visitCount > 0 && (
          <span className="ml-auto text-[10px] px-2 py-0.5 bg-[#81D8D0]/15 text-[#81D8D0] rounded-full" style={{ fontWeight: 700 }}>
            {visitCount} esta semana
          </span>
        )}
      </div>

      {visitCount === 0 ? (
        <p className="text-white/25 text-xs">Nenhuma visita recente ao seu perfil.</p>
      ) : (
        <div className="space-y-2">
          {visits.slice(0, 5).map((v) => (
            <button
              key={v.id}
              onClick={() => onNavigateToProfile?.(v.visitor_id)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left"
            >
              <UserAvatar name={v.visitor_data?.name || "?"} photoUrl={v.visitor_data?.profile_photo} size={28} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs truncate" style={{ fontWeight: 600 }}>
                  {v.visitor_data?.name || "Membro"}
                </p>
              </div>
              <span className="text-white/20 text-[10px]">
                {timeAgo(v.visited_at)}
              </span>
            </button>
          ))}
          {visitCount > 5 && (
            <p className="text-white/25 text-[10px] text-center pt-1">
              +{visitCount - 5} visitas
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}