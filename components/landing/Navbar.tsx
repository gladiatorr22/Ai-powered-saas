"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import CustomUserMenu from "@/components/auth/CustomUserMenu";

interface NavbarProps {
    onOpenAuth: (mode: "signin" | "signup") => void;
}

function Navbar({ onOpenAuth }: NavbarProps) {
    const { isSignedIn } = useUser();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass-panel-dark border-b border-white/5 mx-4 mt-4 rounded-2xl">
            <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 relative overflow-hidden rounded-full border border-white/20 p-1">
                    <img src="/assets/logo.png" alt="Lumina Logo" className="w-full h-full object-contain filter invert opacity-90 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white group-hover:text-gray-300 transition-colors">Lumina</span>
            </Link>

            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
                    <Link href="#features" className="hover:text-white transition-colors">Features</Link>
                    <Link href="#showcase" className="hover:text-white transition-colors">Showcase</Link>
                    <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
                </div>

                {isSignedIn ? (
                    <div className="flex items-center gap-4">
                        <CustomUserMenu />
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => onOpenAuth("signin")}
                            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => onOpenAuth("signup")}
                            className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors"
                        >
                            Get Started
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
