import { getAllCategories } from "@/features/categories/queries";
import { CategoriesManager } from "@/features/categories/components/categories-manager";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Categorías</h1>
        <p className="text-muted-foreground">{categories.length} en total</p>
      </div>
      <CategoriesManager categories={categories} />
    </div>
  );
}
