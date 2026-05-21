/**
 * VANTA Navbar — Carbon Fiber Design System
 * Floating transparent navbar with glassmorphism on scroll
 * Typography: Bebas Neue (logo) + Syne (nav items)
 * Integrated with CartDrawer for shopping cart functionality
 */

import { useState, useEffect } from "react";
import { ShoppingBag, Search, Menu, X, User, Heart } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import EnhancedCartDrawer from "./EnhancedCartDrawer";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { SearchBar } from "./SearchBar";
import { MobileNavigationDrawer } from "./MobileNavigationDrawer";

const navLinks = [
  { label: "Coleção", href: "#collection" },
  { label: "Categorias", href: "#categories" },
  { label: "Personalize sua peça", href: "#canvas" },
  { label: "Sobre", href: "#about" },
];

export default function Navbar() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { itemCount } = useCart();
  const wishlistCount = trpc.wishlist.getWishlistCount.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "navbar-glass-scrolled" : "navbar-glass"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <a
              href="#"
              className="font-display text-2xl lg:text-3xl tracking-widest text-[#EFEFEF] hover:text-white transition-colors"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            >
              VANTA
            </a>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="relative font-heading text-xs font-medium tracking-[0.15em] uppercase text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] transition-colors duration-200 group"
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#EFEFEF] transition-all duration-300 group-hover:w-full" />
                </button>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Search Bar - Desktop */}
              <div className="hidden md:block">
                <SearchBar />
              </div>
              
              {/* Search Icon - Mobile */}
              <button
                onClick={() => setLocation("/search")}
                className="md:hidden text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] transition-colors p-1"
                aria-label="Pesquisar"
              >
                <Search size={18} strokeWidth={1.5} />
              </button>
              {user && (
                <>
                  <button
                    onClick={() => setLocation("/wishlist")}
                    className="relative text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] transition-colors p-1"
                    aria-label="Wishlist"
                  >
                    <Heart size={18} strokeWidth={1.5} />
                    {(wishlistCount.data ?? 0) > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                        {(wishlistCount.data ?? 0) > 99 ? "99+" : wishlistCount.data}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setLocation("/profile")}
                    className="text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] transition-colors p-1"
                    aria-label="Perfil"
                  >
                    <User size={18} strokeWidth={1.5} />
                  </button>
                </>
              )}
              <button
                onClick={() => setCartOpen(true)}
                className="relative text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] transition-colors p-1"
                aria-label="Carrinho"
              >
                <ShoppingBag size={18} strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle - now handled by MobileNavigationDrawer */}
              <MobileNavigationDrawer cartCount={itemCount} />
            </div>
          </div>
        </div>
      </nav>



      {/* Enhanced Cart Drawer with Real-Time Inventory Validation & Promotions */}
      <EnhancedCartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
