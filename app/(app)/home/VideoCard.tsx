"use client";

import React from "react";

interface Video {
    id: string;
    title: string;
    description: string | null;
    publicId: string;
    originalSize: string;
    compressedSize: string;
    duration: number;
    createdAt: string;
}

interface VideoCardProps {
    video: Video;
}

function VideoCard({ video }: VideoCardProps) {
    // Format file size for display
    const formatSize = (sizeStr: string) => {
        const bytes = parseInt(sizeStr, 10);
        if (isNaN(bytes)) return sizeStr;
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    // Format duration for display
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Format date for display
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Calculate compression percentage
    const getCompressionRatio = () => {
        const original = parseInt(video.originalSize, 10);
        const compressed = parseInt(video.compressedSize, 10);
        if (isNaN(original) || isNaN(compressed) || original === 0) return null;
        const ratio = ((original - compressed) / original) * 100;
        return ratio > 0 ? ratio.toFixed(1) : null;
    };

    const compressionRatio = getCompressionRatio();

    // Generate Cloudinary video thumbnail URL
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const thumbnailUrl = cloudName
        ? `https://res.cloudinary.com/${cloudName}/video/upload/so_0,w_400,h_225,c_fill/${video.publicId}.jpg`
        : null;

    return (
        <div className="group glass-panel rounded-xl overflow-hidden hover:bg-white/10 transition-colors duration-300">
            {/* Video Thumbnail */}
            <figure className="relative aspect-video bg-black/50">
                {thumbnailUrl ? (
                    <img
                        src={thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full">
                        <svg
                            className="w-16 h-16 text-white/20"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                )}
                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-xs font-mono px-2 py-1 rounded text-white">
                    {formatDuration(video.duration)}
                </div>
            </figure>

            <div className="p-4">
                {/* Title */}
                <h2 className="text-base font-bold text-white line-clamp-1 mb-1 group-hover:text-gray-200">{video.title}</h2>

                {/* Description */}
                {video.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3 h-8">
                        {video.description}
                    </p>
                )}

                {/* Metadata */}
                <div className="mt-2 space-y-1 text-[10px] text-gray-600 font-mono">
                    <div className="flex justify-between">
                        <span>ORIGINAL</span>
                        <span>{formatSize(video.originalSize)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>COMPRESSED</span>
                        <span>{formatSize(video.compressedSize)}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5">
                    <span className="text-[10px] text-gray-600">
                        {formatDate(video.createdAt)}
                    </span>
                    <a
                        href={`https://res.cloudinary.com/${cloudName}/video/upload/${video.publicId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold bg-white text-black px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        Watch
                    </a>
                </div>
            </div>
        </div>
    );
}

export default VideoCard;
