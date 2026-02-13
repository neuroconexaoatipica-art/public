interface LogoIconProps {
  className?: string;
  size?: number;
}

export function LogoIcon({ className = "", size = 48 }: LogoIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
    >
      <rect width="120" height="120" rx="24" fill="#81D8D0" />
      <text
        x="60"
        y="82"
        textAnchor="middle"
        fontSize="72"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="700"
        fill="#000"
      >
        N
      </text>
    </svg>
  );
}
