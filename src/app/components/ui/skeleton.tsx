{
  "lote": 6,
  "status": "pending",
  "file_path": "src/app/components/ui/skeleton.tsx",
  "created_at": "2026-02-27T05:36:38.376Z",
  "file_content": "import { cn } from \"./utils\";\n\nfunction Skeleton({ className, ...props }: React.ComponentProps<\"div\">) {\n  return (\n    <div\n      data-slot=\"skeleton\"\n      className={cn(\"bg-accent animate-pulse rounded-md\", className)}\n      {...props}\n    />\n  );\n}\n\nexport { Skeleton };\n"
}