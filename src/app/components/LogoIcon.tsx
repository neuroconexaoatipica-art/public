{
  "lote": 1,
  "status": "pending",
  "file_path": "src/app/components/LogoIcon.tsx",
  "created_at": "2026-02-27T05:36:10.011Z",
  "file_content": "import { useState } from \"react\";\n\ninterface LogoIconProps {\n  className?: string;\n  size?: number;\n}\n\nexport function LogoIcon({ className = \"\", size = 48 }: LogoIconProps) {\n  const [imgError, setImgError] = useState(false);\n\n  if (imgError) {\n    return (\n      <div\n        style={{ width: size, height: size }}\n        className={`rounded-xl bg-gradient-to-br from-[#C8102E] to-[#81D8D0] flex items-center justify-center ${className}`}\n      >\n        <span className=\"text-white font-bold\" style={{ fontSize: size * 0.45 }}>N</span>\n      </div>\n    );\n  }\n\n  return (\n    <img\n      src=\"/logo-512x512.png\"\n      alt=\"NeuroConexão Atípica\"\n      width={size}\n      height={size}\n      className={`rounded-xl object-contain ${className}`}\n      onError={() => setImgError(true)}\n    />\n  );\n}"
}