interface Props {
  src: string | null;
  name: string;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export function UserAvatar({ src, name, size = 40, className = '', onClick }: Props) {
  const initials = (name || 'M').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover flex-shrink-0 ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-[#81D8D0]' : ''} ${className}`}
        style={{ width: size, height: size }}
        onClick={onClick}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }}
      />
    );
  }
  
  return (
    <div
      className={`rounded-full bg-[#81D8D0]/20 flex items-center justify-center flex-shrink-0 text-[#81D8D0] font-semibold ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-[#81D8D0]' : ''} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      onClick={onClick}
    >
      {initials}
    </div>
  );
}
