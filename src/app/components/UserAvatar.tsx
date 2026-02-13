interface UserAvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const textSizeMap = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-2xl'
};

export function UserAvatar({ name, photoUrl, size = 'lg', onClick, className = '' }: UserAvatarProps) {
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div
      onClick={onClick}
      className={`${sizeMap[size]} rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-[#81D8D0] transition-all' : ''} ${className}`}
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className={`${textSizeMap[size]} font-semibold text-white/70`}>
          {initial}
        </span>
      )}
    </div>
  );
}
