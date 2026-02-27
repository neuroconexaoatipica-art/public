{
  "lote": 6,
  "status": "pending",
  "file_path": "src/app/components/ui/separator.tsx",
  "created_at": "2026-02-27T05:36:37.745Z",
  "file_content": "\"use client\";\n\nimport * as React from \"react\";\nimport * as SeparatorPrimitive from \"@radix-ui/react-separator\";\n\nimport { cn } from \"./utils\";\n\nfunction Separator({\n  className,\n  orientation = \"horizontal\",\n  decorative = true,\n  ...props\n}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {\n  return (\n    <SeparatorPrimitive.Root\n      data-slot=\"separator-root\"\n      decorative={decorative}\n      orientation={orientation}\n      className={cn(\n        \"bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px\",\n        className,\n      )}\n      {...props}\n    />\n  );\n}\n\nexport { Separator };\n"
}