/**
 * Mobile Navigation Drawer Component
 * Slide-out menu for mobile devices
 */

import { useState } from "react";
import { Menu, X, Home, Shirt, Palette, User, LogOut, ShoppingBag } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

interface MobileNavigationDrawerProps {
  cartCount?: number;
  onCartClick?: () => void;
}

export function MobileNavigationDrawer({ cartCount = 0, onCartClick }: MobileNavigationDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Shirt, label: "Coleções", href: "/collections" },
    { icon: Palette, label: "Personalizar", href: "/#canvas" },
    { icon: User, label: "Perfil", href: "/profile" },
  ];

  const handleNavigation = (href: string) => {
    setIsOpen(false);
    // Suporta âncoras (ex.: "/#canvas"): navega para a rota e rola até a seção.
    if (href.includes("#")) {
      const [path, hash] = href.split("#");
      setLocation(path || "/");
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 120);
    } else {
      setLocation(href);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 text-[#EFEFEF] hover:bg-[rgba(255,255,255,0.1)] rounded transition-colors"
        aria-label="Menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#0B0B0B] border-r border-[rgba(255,255,255,0.1)] z-50 transform transition-transform duration-300 md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center justify-between">
            <h2 className="text-[#EFEFEF] font-heading font-bold text-lg">VANTA</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-[rgba(255,255,255,0.1)] rounded transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleNavigation(item.href)}
              className="w-full flex items-center gap-3 px-4 py-3 text-[#EFEFEF] hover:bg-[rgba(255,255,255,0.1)] rounded transition-colors text-left"
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Divider */}
        <div className="border-t border-[rgba(255,255,255,0.1)] my-4" />

        {/* Cart */}
        <button
          onClick={() => {
            setIsOpen(false);
            onCartClick?.();
          }}
          className="w-full mx-4 flex items-center gap-3 px-4 py-3 text-[#EFEFEF] bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)] rounded transition-colors text-left relative"
        >
          <ShoppingBag size={20} />
          <span>Carrinho</span>
          {cartCount > 0 && (
            <span className="absolute top-1 right-2 bg-[#FF6B6B] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>

        {/* Auth Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[rgba(255,255,255,0.1)]">
          {user ? (
            <div className="space-y-3">
              <div className="px-4 py-2 text-sm text-[rgba(239,239,239,0.7)]">
                <p className="font-semibold">{user.name}</p>
                <p className="text-xs text-[rgba(239,239,239,0.5)]">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-[#FF6B6B] hover:bg-[rgba(255,107,107,0.1)] rounded transition-colors text-sm"
              >
                <LogOut size={16} />
                <span>Sair</span>
              </button>
            </div>
          ) : (
            <a
              href={getLoginUrl()}
              className="block w-full px-4 py-2 text-center bg-[#EFEFEF] text-[#0B0B0B] font-semibold rounded hover:bg-[rgba(239,239,239,0.9)] transition-colors text-sm"
            >
              Entrar
            </a>
          )}
        </div>
      </div>
    </>
  );
}
