---
name: angular-template-safety
description: Use when editing or reviewing Angular component templates, bindings, conditional rendering, nullable values, or template expressions.
compatibility: opencode
---

## Template Rules

- Never use TypeScript syntax in templates.
- Never use `as`, type assertions, or union types in templates.
- Never cast values in templates.
- Move typing and casting logic into the component class.
- Templates must use simple property access and simple method calls only.
- Always handle nullable values before accessing properties.
- Never index typed objects with an untyped plain string in templates.
- Prefer strongly typed helper methods or local template variables when needed.
- Avoid calling the same method multiple times in a template when a local variable can be used.

## Component Class Rule

If template logic becomes complex:
- move the logic into a typed method, computed signal, or local component property
- keep the template readable
- avoid clever inline expressions
