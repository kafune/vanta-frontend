/**
 * OBSIDIAN Home Page — Carbon Fiber Design System
 * Philosophy: Industrial Modernism + Streetwear Tech Aesthetic
 * 
 * Layout: Navbar → Hero → Collection → Categories → Canvas → About → Footer
 */

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CollectionSection from "@/components/CollectionSection";
import CategoriesSection from "@/components/CategoriesSection";
import CanvasSection from "@/components/CanvasSection";
import AboutSection from "@/components/AboutSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";

export default function Home() {
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
