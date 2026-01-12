"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Heart, Loader2, Video as VideoIcon, Image as ImageIcon } from "lucide-react";
import { getVideoThumbnailUrl, getImageUrl } from "@/lib/cloudinary-urls";
import { CldImage } from "next-cloudinary";
import { useToast } from "@/components/ui/Toast";

// Favorite Type (using LocalStorage for MVP)
interface FavoriteItem {
    id: string; // publicId
    type: "video" | "image";
    title: string;
}

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    // Using LocalStorage for MVP
    useEffect(() => {
        const stored = localStorage.getItem("favorites");
        if (stored) {
            try {
                setFavorites(JSON.parse(stored));
            } catch {
                setFavorites([]);
            }
        }
        setLoading(false);
    }, []);

    const removeFromFavorites = (id: string) => {
        const updated = favorites.filter(f => f.id !== id);
        setFavorites(updated);
        localStorage.setItem("favorites", JSON.stringify(updated));
        showToast("Removed from favorites", "success");
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
                Favorites
            </h1>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-white/50" />
                </div>
            ) : favorites.length === 0 ? (
                <div className="text-center py-20 text-gray-500 bg-white/5 rounded-2xl border border-white/10">
                    <Heart className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">No favorites yet</p>
                    <p className="text-sm text-gray-600 mt-2">Mark items as favorite to see them here</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {favorites.map((item) => (
                        <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all group relative">
                            <div className="absolute top-2 right-2 z-10">
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeFromFavorites(item.id); }}
                                    className="p-2 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
                                >
                                    <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                                </button>
                            </div>

                            <div className="relative aspect-video bg-black">
                                {item.type === 'video' ? (
                                    <img
                                        src={getVideoThumbnailUrl(item.id)}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <CldImage
                                        width="400"
                                        height="225"
                                        src={item.id}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                <div className="absolute bottom-2 left-2">
                                    {item.type === 'video' ? <VideoIcon className="w-4 h-4 text-white" /> : <ImageIcon className="w-4 h-4 text-white" />}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-white font-bold truncate">{item.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
