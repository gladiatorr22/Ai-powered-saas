"use client";

import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import BentoGrid from "@/components/landing/BentoGrid";
import Reviews from "@/components/landing/Reviews";
import Footer from "@/components/landing/Footer";
import AuthModal from "@/components/auth/AuthModal";

export default function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  const openAuth = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-lumina-black selection:bg-white selection:text-black">
      <Navbar onOpenAuth={openAuth} />
      <Hero onOpenAuth={openAuth} />
      <BentoGrid />
      <Reviews />
      <Footer />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
