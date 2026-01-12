"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import CustomUserMenu from "@/components/auth/CustomUserMenu";
import { UploadProvider, useUpload } from "@/context/UploadContext";
import UploadModal from "@/components/video/UploadModal";

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { openUpload } = useUpload();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-lumina-black text-white">
            {/* Fixed Dashboard Header */}
            <header
                className={`fixed top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between transition-all duration-300 ${scrolled ? "bg-lumina-black/90 backdrop-blur-xl border-b border-white/5" : "bg-transparent border-transparent"
                    }`}
            >
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 relative overflow-hidden rounded-full border border-white/20 p-1">
                        <img src="/assets/logo.png" alt="Lumina Logo" className="w-full h-full object-contain filter invert opacity-90 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white group-hover:text-gray-300 transition-colors">Lumina</span>
                </Link>

                <CustomUserMenu />
            </header>

            {/* Main Content with Padding to prevent header overlap */}
            <main className="pt-24 px-4 pb-12">
                {children}
            </main>

            {/* Global Upload Modal */}
            <UploadModal />
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <UploadProvider>
            <DashboardContent>
                {children}
            </DashboardContent>
        </UploadProvider>
    );
}
