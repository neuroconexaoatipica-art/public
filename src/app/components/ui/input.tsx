{
  "lote": 6,
  "status": "pending",
  "file_path": "src/app/components/ui/input.tsx",
  "created_at": "2026-02-27T05:36:35.442Z",
  "file_content": "import * as React from \"react\";\n\nimport { cn } from \"./utils\";\n\nfunction Input({ className, type, ...props }: React.ComponentProps<\"input\">) {\n  return (\n    <input\n      type={type}\n      data-slot=\"input\"\n      className={cn(\n        \"file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm\",\n        \"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]\",\n        \"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive\",\n        className,\n      )}\n      {...props}\n    />\n  );\n}\n\nexport { Input };\n"
}