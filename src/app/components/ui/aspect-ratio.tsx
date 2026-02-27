{
  "lote": 6,
  "status": "pending",
  "file_path": "src/app/components/ui/aspect-ratio.tsx",
  "created_at": "2026-02-27T05:36:32.268Z",
  "file_content": "\"use client\";\n\nimport * as AspectRatioPrimitive from \"@radix-ui/react-aspect-ratio\";\n\nfunction AspectRatio({\n  ...props\n}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {\n  return <AspectRatioPrimitive.Root data-slot=\"aspect-ratio\" {...props} />;\n}\n\nexport { AspectRatio };\n"
}