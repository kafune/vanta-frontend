/**
 * VANTA Footer — Carbon Fiber Design System
 * Minimalist footer with social icons and payment methods
 */

import { Instagram, Twitter, Youtube, Mail } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const socialLinks = [
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Twitter, label: "Twitter/X", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
  { icon: Mail, label: "E-mail", href: "#" },
];

const footerLinks = {
  "Loja": ["Coleção", "Categorias", "Novidades", "Promoções"],
  "Customização": ["Your Canvas", "Como Funciona", "Materiais", "FAQ"],
  "Empresa": ["Sobre Nós", "Sustentabilidade", "Carreiras", "Imprensa"],
  "Suporte": ["Contacto", "Trocas & Devoluções", "Rastrear Pedido", "Política de Privacidade"],
};

// Payment method icons as SVG paths (simplified)
const paymentMethods = [
  { name: "Visa", symbol: "VISA" },
  { name: "Mastercard", symbol: "MC" },
  { name: "Pix", symbol: "PIX" },
  { name: "Boleto", symbol: "BOL" },
  { name: "Apple Pay", symbol: "⌘PAY" },
];

export default function Footer() {
  const { data: settings } = trpc.settings.getPublic.useQuery();
  const storeName = settings?.storeName || "VANTA";
  return (
    <footer style={{ background: "#080808", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Newsletter Banner */}
      <div
        className="py-16 px-6 lg:px-8"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <h3 className="font-display text-3xl lg:text-4xl text-[#EFEFEF] mb-2">
              FIQUE POR DENTRO
            </h3>
            <p className="font-heading text-sm font-light text-[rgba(239,239,239,0.45)]">
              Novidades, lançamentos exclusivos e ofertas especiais.
            </p>
          </div>
          <div className="flex gap-0 max-w-md w-full">
            <input
              type="email"
              placeholder="seu@email.com"
              className="flex-1 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] px-4 py-3 font-heading text-sm text-[#EFEFEF] placeholder:text-[rgba(239,239,239,0.25)] focus:outline-none focus:border-[rgba(255,255,255,0.3)] transition-colors"
              style={{ borderRadius: "2px 0 0 2px" }}
            />
            <button
              onClick={() => toast.success("Inscrito!", { description: "Bem-vindo à família VANTA." })}
              className="btn-cta px-6 py-3 whitespace-nowrap"
              style={{ borderRadius: "0 2px 2px 0" }}
            >
              <span>Inscrever</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div
        className="py-16 px-6 lg:px-8"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-1">
            <div className="font-display text-2xl tracking-widest text-[#EFEFEF] mb-4">{storeName}</div>
            <p className="font-heading text-xs font-light text-[rgba(239,239,239,0.4)] leading-relaxed mb-6">
              Vestuário premium com personalização exclusiva. Qualidade certificada, design sem compromisso.
            </p>
            {(settings?.contactEmail || settings?.contactWhatsapp) && (
              <div className="font-heading text-xs font-light text-[rgba(239,239,239,0.45)] mb-6 space-y-1">
                {settings?.contactEmail && (
                  <p>
                    <a href={`mailto:${settings.contactEmail}`} className="hover:text-[#EFEFEF] transition-colors">{settings.contactEmail}</a>
                  </p>
                )}
                {settings?.contactWhatsapp && (
                  <p>
                    <a href={`https://wa.me/${settings.contactWhatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="hover:text-[#EFEFEF] transition-colors">
                      WhatsApp: {settings.contactWhatsapp}
                    </a>
                  </p>
                )}
              </div>
            )}
            {/* Social Icons */}
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  onClick={(e) => { e.preventDefault(); toast(`${label} em breve`); }}
                  className="w-8 h-8 border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[rgba(239,239,239,0.4)] hover:text-[#EFEFEF] hover:border-[rgba(255,255,255,0.3)] transition-all duration-200"
                >
                  <Icon size={14} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <div className="font-mono-label text-[rgba(239,239,239,0.5)] mb-4">{title}</div>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <button
                      onClick={() => toast(`${link}`, { description: "Em breve." })}
                      className="font-heading text-xs font-light text-[rgba(239,239,239,0.4)] hover:text-[rgba(239,239,239,0.8)] transition-colors duration-200 text-left"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="py-6 px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <p className="font-mono-label text-[rgba(239,239,239,0.25)] text-[0.6rem]">
            © 2025 {storeName}. Todos os direitos reservados.
          </p>

          {/* Payment Methods */}
          <div className="flex items-center gap-2">
            <span className="font-mono-label text-[rgba(239,239,239,0.2)] text-[0.55rem] mr-1">Pagamentos:</span>
            {paymentMethods.map((method) => (
              <div
                key={method.name}
                className="px-2 py-1 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]"
                title={method.name}
                style={{ borderRadius: "2px" }}
              >
                <span className="font-mono-label text-[rgba(239,239,239,0.35)] text-[0.55rem]">
                  {method.symbol}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
