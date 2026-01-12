import React from "react";
import Link from "next/link";

function Footer() {
    return (
        <footer className="py-12 px-4 border-t border-white/5 bg-lumina-black text-center">
            <div className="flex items-center justify-center gap-2 mb-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                <img src="/assets/logo.png" alt="Lumina Logo" className="w-6 h-6 object-contain filter invert" />
                <span className="text-lg font-bold text-white">Lumina</span>
            </div>

            <div className="flex justify-center gap-8 mb-8 text-sm text-gray-500">
                <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
                <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
            </div>

            <p className="text-xs text-gray-700">
                &copy; {new Date().getFullYear()} Lumina AI. All rights reserved.
            </p>
        </footer>
    );
}

export default Footer;
