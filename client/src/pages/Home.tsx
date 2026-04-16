/**
 * VANTA Home Page — Carbon Fiber Design System
 * Philosophy: Industrial Modernism + Streetwear Tech Aesthetic
 * 
 * Layout: Navbar → Hero → Collection → Categories → Canvas → About → Footer
 */

import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CollectionSection from "@/components/CollectionSection";
import CategoriesSection from "@/components/CategoriesSection";
import CanvasSection from "@/components/CanvasSection";
import AboutSection from "@/components/AboutSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen" style={{ background: "#0B0B0B" }}>
      <Navbar />
      <HeroSection />
      <CollectionSection />
      <CategoriesSection />
      <CanvasSection />
      <AboutSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
}
