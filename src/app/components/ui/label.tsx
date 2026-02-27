{
  "lote": 6,
  "status": "pending",
  "file_path": "src/app/components/ui/label.tsx",
  "created_at": "2026-02-27T05:36:35.900Z",
  "file_content": "\"use client\";\n\nimport * as React from \"react\";\nimport * as LabelPrimitive from \"@radix-ui/react-label\";\n\nimport { cn } from \"./utils\";\n\nfunction Label({\n  className,\n  ...props\n}: React.ComponentProps<typeof LabelPrimitive.Root>) {\n  return (\n    <LabelPrimitive.Root\n      data-slot=\"label\"\n      className={cn(\n        \"flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50\",\n        className,\n      )}\n      {...props}\n    />\n  );\n}\n\nexport { Label };\n"
}