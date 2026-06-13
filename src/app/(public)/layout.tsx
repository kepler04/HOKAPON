import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

/** Layout for the public storefront: navbar, footer, toast host. */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            borderRadius: "1rem",
            fontFamily: "var(--font-sans)",
          },
        }}
      />
    </div>
  );
}
