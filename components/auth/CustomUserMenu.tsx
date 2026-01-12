"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function CustomUserMenu() {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    const toggleMenu = () => setIsOpen(!isOpen);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!isLoaded || !user) return null;

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={toggleMenu}
                className="flex items-center gap-3 hover:bg-white/5 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-white/10"
            >
                <img
                    src={user.imageUrl}
                    alt={user.fullName || "User"}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20"
                />
                <div className="flex flex-col items-start hidden sm:flex">
                    <span className="text-sm font-medium text-white leading-none">
                        {user.firstName}
                    </span>
                </div>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 glass-panel-dark border border-white/10 rounded-xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200 z-50">
                    <div className="px-4 py-3 border-b border-white/5 mb-2">
                        <p className="text-sm font-medium text-white">{user.fullName}</p>
                        <p className="text-xs text-gray-400 truncate">{user.primaryEmailAddress?.emailAddress}</p>
                    </div>

                    <div className="flex flex-col">
                        {pathname !== "/home" && (
                            <Link
                                href="/home"
                                className="px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                                onClick={() => setIsOpen(false)}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                Dashboard
                            </Link>
                        )}

                        <Link
                            href="/"
                            className="px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                            onClick={() => setIsOpen(false)}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            Back to Home
                        </Link>

                        <div className="h-px bg-white/5 my-2"></div>

                        <button
                            onClick={() => signOut({ redirectUrl: "/" })}
                            className="text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
