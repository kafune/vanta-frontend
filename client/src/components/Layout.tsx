/**
 * Layout compartilhado — garante Navbar + Footer consistentes nas páginas
 * que antes ficavam "presas" sem navegação (Coleções, Busca, Wishlist, etc.).
 * O <main> tem padding no topo para não ficar escondido atrás do Navbar fixo.
 * Páginas com hero próprio (Home) não usam este Layout.
 */

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 pt-16 lg:pt-20">{children}</main>
      <Footer />
    </div>
  );
}
