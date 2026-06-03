/**
 * Layout compartilhado — garante Navbar + Footer consistentes nas páginas
 * que antes ficavam "presas" sem navegação (Coleções, Busca, Wishlist, etc.).
 * O <main> tem padding no topo para não ficar escondido atrás do Navbar fixo.
 * Páginas com hero próprio (Home) não usam este Layout.
 */

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: settings } = trpc.settings.getPublic.useQuery();
  const announcement = settings?.announcement?.trim();
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 pt-16 lg:pt-20">
        {announcement && (
          <div className="bg-[#EFEFEF] text-[#0B0B0B] text-center text-sm font-heading py-2 px-4">
            {announcement}
          </div>
        )}
        {children}
      </main>
      <Footer />
    </div>
  );
}
