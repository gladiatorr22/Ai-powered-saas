"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Video as VideoIcon, Loader2 } from "lucide-react";
import { Video } from "@prisma/client";
import Link from "next/link";
import { getVideoThumbnailUrl } from "@/lib/cloudinary-urls";

export default function MyVideosPage() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const res = await axios.get("/api/videos");
            setVideos(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <VideoIcon className="w-8 h-8 text-blue-400" />
                My Videos
            </h1>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-white/50" />
                </div>
            ) : videos.length === 0 ? (
                <div className="text-center py-20 text-gray-500 bg-white/5 rounded-2xl border border-white/10">
                    <VideoIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">No videos found</p>
                    <Link href="/dashboard" className="text-blue-400 hover:underline mt-2 inline-block">
                        Upload some videos in Dashboard
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map((video) => (
                        <div key={video.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all group">
                            <div className="relative aspect-video bg-black">
                                <img
                                    src={getVideoThumbnailUrl(video.publicId)}
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <VideoIcon className="w-8 h-8 text-white" />
                                </div>
                                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                    {Math.round(video.duration)}s
                                </span>
                            </div>
                            <div className="p-4">
                                <h3 className="text-white font-bold truncate">{video.title}</h3>
                                <div className="flex justify-between mt-2 text-xs text-gray-400">
                                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                                    <span>{(Number(video.originalSize) / 1024 / 1024).toFixed(1)} MB</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
