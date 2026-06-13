import { StorePreview } from "@/components/admin/store-preview";

export default function StorePreviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Ver tienda</h1>
        <p className="text-muted-foreground">
          Vista previa de tu tienda pública, sin salir del panel.
        </p>
      </div>
      <StorePreview />
    </div>
  );
}
