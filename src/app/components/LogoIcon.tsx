const logoImg = "/logo.png";

interface LogoIconProps {
  className?: string;
  size?: number;
}

export function LogoIcon({ className = "", size = 48 }: LogoIconProps) {
  return (
    <img
      src={logoImg}
      alt="NeuroConexão Atípica"
      width={size}
      height={size}
      className={`rounded-xl object-cover ${className}`}
    />
  );
}
