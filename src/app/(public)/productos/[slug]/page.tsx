import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ShieldCheck, MessageCircle, Flame, Package } from "lucide-react";
import { getProductBySlug } from "@/features/products/queries";
import { getProductPlaceholder } from "@/features/products/placeholder";
import { getFavoriteIds } from "@/features/favorites/queries";
import { FavoriteButton } from "@/features/favorites/components/favorite-button";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/shared/price";
import { ProductGallery } from "@/features/products/components/product-gallery";
import { PurchasePanel } from "@/features/products/components/purchase-panel";

interface Props {
  params: Promise<{ slug: string }>;
}

function storageUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${base}/storage/v1/object/public/${STORAGE_BUCKETS.PRODUCTS}/${path}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: product.description ?? `Compra ${product.name}`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const categorySlug = product.categories?.slug ?? null;
  const theme = getProductPlaceholder(categorySlug);
  const soldOut = product.stock <= 0;
  const LOW_STOCK = 5;
  const lowStock = !soldOut && product.stock <= LOW_STOCK;
  const favoriteIds = await getFavoriteIds();
  const isFavorite = favoriteIds.has(product.id);

  const images = [...(product.product_images ?? [])]
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)
    .map((img) => ({ url: storageUrl(img.url), alt: img.alt }));

  const primaryImageUrl = images[0]?.url ?? null;

  return (
    <Container className="py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Inicio</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/productos" className="hover:text-foreground">Productos</Link>
        {product.categories && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link
              href={`/categorias/${product.categories.slug}`}
              className="hover:text-foreground"
            >
              {product.categories.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div className="animate-rise">
          <ProductGallery images={images} name={product.name} placeholder={theme} />
        </div>

        {/* Info */}
        <div className="animate-rise" style={{ animationDelay: "80ms" }}>
          <div className="flex flex-wrap items-center gap-2">
            {product.is_featured && <Badge tone="accent">Destacado</Badge>}
            {soldOut ? (
              <Badge tone="neutral">Agotado</Badge>
            ) : (
              <Badge tone="mint">
                <Package className="mr-1 inline h-3.5 w-3.5" />
                En stock · {product.stock}{" "}
                {product.stock === 1 ? "disponible" : "disponibles"}
              </Badge>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{product.name}</h1>

          <div className="mt-5">
            <Price value={product.price} comparePrice={product.compare_price} size="lg" />
          </div>

          {/* Urgency banner when stock is low */}
          {lowStock && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3">
              <Flame className="h-6 w-6 shrink-0 animate-pulse text-accent" />
              <div>
                <p className="text-sm font-extrabold uppercase tracking-wide text-accent">
                  ¡Últimos en stock!
                </p>
                <p className="text-sm text-foreground/80">
                  Solo quedan{" "}
                  <span className="font-bold text-accent">{product.stock}</span>{" "}
                  {product.stock === 1 ? "unidad" : "unidades"} · ¡aprovecha
                  antes de que se agote!
                </p>
              </div>
            </div>
          )}

          {product.description && (
            <p className="mt-6 leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

          <div className="mt-8">
            <PurchasePanel
              item={{
                productId: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                imageUrl: primaryImageUrl,
                stock: product.stock,
                maxPerOrder: product.max_per_order,
              }}
              maxPerOrder={product.max_per_order}
            />
          </div>

          {/* Save to favorites */}
          <div className="mt-4">
            <FavoriteButton
              productId={product.id}
              initialFavorited={isFavorite}
              variant="button"
            />
          </div>

          {/* Reassurance */}
          <div className="mt-8 grid gap-3 rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center gap-3 text-sm">
              <ShieldCheck className="h-5 w-5 text-mint" />
              <span>Paga con Yape, Plin o transferencia de forma segura.</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MessageCircle className="h-5 w-5 text-accent" />
              <span>Coordinamos la entrega contigo por WhatsApp.</span>
            </div>
          </div>

          {product.sku && (
            <p className="mt-4 text-xs text-muted-foreground">
              SKU: {product.sku}
            </p>
          )}
        </div>
      </div>
    </Container>
  );
}
