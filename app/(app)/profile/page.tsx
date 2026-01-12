"use client";

import React from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { User, Mail, Calendar, LogOut, Settings, Shield, ExternalLink, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const { user, isLoaded } = useUser();
    const { signOut, openUserProfile } = useClerk();
    const router = useRouter();

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-white/50" />
            </div>
        );
    }

    if (!user) {
        return null; // or redirect to login
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <User className="w-8 h-8 text-blue-400" />
                My Profile
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Profile Info */}
                <div className="md:col-span-2 space-y-6">
                    {/* User Card */}
                    <div className="glass-panel p-8 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>

                        <div className="relative">
                            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-blue-500 to-purple-500">
                                <img
                                    src={user.imageUrl}
                                    alt={user.fullName || "User"}
                                    className="w-full h-full rounded-full object-cover border-4 border-black"
                                />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-black w-6 h-6 rounded-full" title="Active"></div>
                        </div>

                        <div className="relative pt-2 text-center sm:text-left">
                            <h2 className="text-2xl font-bold text-white">{user.fullName}</h2>
                            <p className="text-gray-400">@{user.username || user.firstName?.toLowerCase() || 'user'}</p>
                            <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-300">
                                    Pro Plan
                                </span>
                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-green-300">
                                    Verified
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="glass-panel p-6 rounded-xl flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <Mail className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Email Content</p>
                                <p className="text-white font-medium truncate max-w-[200px]" title={user.primaryEmailAddress?.emailAddress}>
                                    {user.primaryEmailAddress?.emailAddress}
                                </p>
                            </div>
                        </div>

                        <div className="glass-panel p-6 rounded-xl flex items-center gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-lg">
                                <Calendar className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Member Since</p>
                                <p className="text-white font-medium">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Account Settings */}
                    <div className="glass-panel p-6 rounded-xl">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-gray-400" />
                            Security & Account
                        </h3>
                        <div className="space-y-4">
                            <button
                                onClick={() => openUserProfile()}
                                className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <Settings className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                    <div className="text-left">
                                        <p className="text-white font-medium">Manage Account</p>
                                        <p className="text-sm text-gray-500">Update personal details and security settings</p>
                                    </div>
                                </div>
                                <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats/Actions */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-xl text-center">
                        <h3 className="text-lg font-bold text-white mb-2">My Usage</h3>
                        <div className="w-32 h-32 mx-auto my-6 relative flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="64" cy="64" r="56" stroke="gray" strokeWidth="12" fill="transparent" className="opacity-10" />
                                <circle cx="64" cy="64" r="56" stroke="#3B82F6" strokeWidth="12" fill="transparent" strokeDasharray="351.86" strokeDashoffset="100" className="opacity-80" />
                            </svg>
                            <div className="absolute text-center">
                                <span className="text-2xl font-bold text-white">72%</span>
                                <p className="text-[10px] text-gray-400 uppercase mt-0.5">Used</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-6">
                            You have used 7.2GB of your 10GB storage limit.
                        </p>
                        <button className="w-full py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm font-medium">
                            Upgrade Plan
                        </button>
                    </div>

                    <button
                        onClick={() => signOut(() => router.push("/"))}
                        className="w-full py-4 glass-panel rounded-xl text-red-400 font-medium hover:bg-red-500/10 hover:border-red-500/30 transition-all flex items-center justify-center gap-2 group"
                    >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
