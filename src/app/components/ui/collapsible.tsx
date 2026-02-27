{
  "lote": 6,
  "status": "pending",
  "file_path": "src/app/components/ui/collapsible.tsx",
  "created_at": "2026-02-27T05:36:33.791Z",
  "file_content": "\"use client\";\n\nimport * as CollapsiblePrimitive from \"@radix-ui/react-collapsible\";\n\nfunction Collapsible({\n  ...props\n}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {\n  return <CollapsiblePrimitive.Root data-slot=\"collapsible\" {...props} />;\n}\n\nfunction CollapsibleTrigger({\n  ...props\n}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {\n  return (\n    <CollapsiblePrimitive.CollapsibleTrigger\n      data-slot=\"collapsible-trigger\"\n      {...props}\n    />\n  );\n}\n\nfunction CollapsibleContent({\n  ...props\n}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {\n  return (\n    <CollapsiblePrimitive.CollapsibleContent\n      data-slot=\"collapsible-content\"\n      {...props}\n    />\n  );\n}\n\nexport { Collapsible, CollapsibleTrigger, CollapsibleContent };\n"
}