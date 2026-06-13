/**
 * Global types.
 *
 * Re-exports the generated database types and shared enums. Domain types
 * (ProductWithRelations, OrderWithItems, CartItem, AdminSession, ...) live
 * inside their feature: see src/features/<feature>/types.ts.
 */
export * from "./database.types";

/** Generic shape returned by server actions across features. */
export type ActionResult<T = void> =
  | ({ ok: true } & (T extends void ? object : { data: T }))
  | { ok: false; error: string };
