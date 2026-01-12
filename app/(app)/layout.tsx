"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import CustomUserMenu from "@/components/auth/CustomUserMenu";
import { UploadProvider, useUpload } from "@/context/UploadContext";
import UploadModal from "@/components/video/UploadModal";
import { LucideIcon } from "lucide-react";
import {
    LayoutDashboard,
    Upload,
    Share2,
    Sparkles,
    Folder,
    Heart,
    User,
    CreditCard,
    LogOut,
    Menu,
    X
} from "lucide-react";

interface MenuItem {
    label: string;
    href?: string;
    action?: () => void;
    icon: LucideIcon;
    className?: string;
}

function Sidebar({ mobile, onClose }: { mobile?: boolean; onClose?: () => void }) {
    const pathname = usePathname();
    const { openUpload } = useUpload();
    const { signOut } = useClerk();

    const MENU_GROUPS: { title: string; items: MenuItem[] }[] = [
        {
            title: "MENU",
            items: [
                { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            ]
        },
        {
            title: "TOOLS",
            items: [
                { label: "Video Upload", action: openUpload, icon: Upload },
                { label: "Social Share", href: "/social-share", icon: Share2 },
                { label: "AI Studio", href: "/ai-studio", icon: Sparkles },
            ]
        },
        {
            title: "LIBRARY",
            items: [
                { label: "My Videos", href: "/my-videos", icon: Folder },
                { label: "Favorites", href: "/favorites", icon: Heart },
            ]
        },
        {
            title: "ACCOUNT",
            items: [
                { label: "Profile", href: "/profile", icon: User },
                { label: "Billing", href: "/billing", icon: CreditCard },
                {
                    label: "Logout",
                    action: () => signOut({ redirectUrl: '/' }),
                    icon: LogOut,
                    className: "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                },
            ]
        }
    ];

    return (
        <aside className={`bg-lumina-black border-r border-white/5 flex flex-col h-full ${mobile ? 'w-full' : 'w-64'}`}>
            {/* Logo Area */}
            <div className="p-6">
                <Link href="/" className="flex items-center gap-3 w-fit" onClick={mobile ? onClose : undefined}>
                    <div className="w-8 h-8 relative overflow-hidden rounded-full border border-white/20 p-1">
                        <img src="/assets/logo.png" alt="Lumina Logo" className="w-full h-full object-contain filter invert opacity-90" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">Lumina</span>
                </Link>
                {mobile && (
                    <button onClick={onClose} className="ml-auto text-gray-400 absolute right-6 top-7">
                        <X className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 space-y-8 py-4">
                {MENU_GROUPS.map((group, idx) => (
                    <div key={idx}>
                        <h3 className="menu-title text-xs font-bold text-gray-500 mb-3 px-3 tracking-wider">{group.title}</h3>
                        <ul className="space-y-1">
                            {group.items.map((item, itemIdx) => {
                                const isActive = item.href ? pathname === item.href || pathname.startsWith(item.href) && item.href !== '/home' : false;
                                const IconComponent = item.icon;
                                return (
                                    <li key={itemIdx}>
                                        {item.href ? (
                                            <Link
                                                href={item.href}
                                                onClick={mobile ? onClose : undefined}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                                    ? "bg-white/10 text-white"
                                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                                    }`}
                                            >
                                                <IconComponent className="w-4 h-4" />
                                                {item.label}
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    if (item.action) item.action();
                                                    if (mobile && onClose) onClose();
                                                }}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${item.className || "text-gray-400 hover:text-white hover:bg-white/5"}`}
                                            >
                                                <IconComponent className="w-4 h-4" />
                                                {item.label}
                                            </button>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>


        </aside>
    );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#0a0a0a] text-white">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block h-screen sticky top-0">
                <Sidebar />
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-lumina-black/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-400 hover:text-white">
                        <Menu className="w-6 h-6" />
                    </button>
                    <Link href="/" className="font-bold text-white">Lumina</Link>
                </div>
                <CustomUserMenu />
            </div>

            {/* Mobile Drawer */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-64 z-50 bg-lumina-black border-r border-white/10 shadow-2xl animate-in slide-in-from-left">
                        <Sidebar mobile onClose={() => setIsMobileMenuOpen(false)} />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                <div className="p-6 lg:p-8 pt-20 lg:pt-8 max-w-7xl mx-auto">
                    {children}
                </div>
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
