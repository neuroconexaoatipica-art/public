import { useState } from "react";

interface LogoIconProps {
  className?: string;
  size?: number;
}

export function LogoIcon({ className = "", size = 48 }: LogoIconProps) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`rounded-xl bg-gradient-to-br from-[#C8102E] to-[#81D8D0] flex items-center justify-center ${className}`}
      >
        <span className="text-white font-bold" style={{ fontSize: size * 0.45 }}>N</span>
      </div>
    );
  }

  return (
    <img
      src="/logo-512x512.png"
      alt="NeuroConexão Atípica"
      width={size}
      height={size}
      className={`rounded-xl object-contain ${className}`}
      onError={() => setImgError(true)}
    />
  );
}
