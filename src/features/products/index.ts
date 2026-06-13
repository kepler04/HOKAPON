/**
 * Public API of the products feature.
 *
 * Only client-safe modules (types, schemas) are re-exported here so this
 * barrel can be imported from anywhere. Server-only modules are imported
 * directly by their callers:
 *   import { getProducts } from "@/features/products/queries";   // Server Components
 *   import { createProduct } from "@/features/products/actions"; // Server Actions
 */
export * from "./types";
export * from "./schemas";
