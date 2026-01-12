"use client";

import React, { useState, useRef } from "react";

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
    isSelectMode?: boolean;
    isSelected?: boolean;
    onToggleSelect?: (id: string) => void;
}

function VideoCard({ video, isSelectMode = false, isSelected = false, onToggleSelect }: VideoCardProps) {
    const [isHovering, setIsHovering] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // ... (existing formatting functions) ...
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

    // Cloudinary URLs
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const thumbnailUrl = cloudName
        ? `https://res.cloudinary.com/${cloudName}/video/upload/so_0,w_400,h_225,c_fill,q_auto/${video.publicId}.jpg`
        : null;

    // Teaser URL using e_preview for AI-generated highlight
    const teaserUrl = cloudName
        ? `https://res.cloudinary.com/${cloudName}/video/upload/e_preview:duration_5,q_auto,f_auto/${video.publicId}.mp4`
        : null;

    const handleMouseEnter = () => {
        setIsHovering(true);
        setTimeout(() => {
            videoRef.current?.play().catch(() => { });
        }, 100);
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    return (
        <div
            className={`group glass-panel rounded-xl overflow-hidden hover:bg-white/10 transition-colors duration-300 relative ${isSelected ? 'ring-2 ring-white bg-white/5' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Selection Checkbox */}
            {(isSelectMode || isHovering || isSelected) && onToggleSelect && (
                <div
                    className="absolute top-2 left-2 z-20"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelect(video.id);
                    }}
                >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${isSelected ? 'bg-white border-white' : 'bg-black/50 border-white/50 hover:border-white'}`}>
                        {isSelected && <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                </div>
            )}

            {/* Video Thumbnail / Teaser */}
            <figure
                className="relative aspect-video bg-black/50 overflow-hidden cursor-pointer"
                onClick={() => {
                    if (isSelectMode && onToggleSelect) {
                        onToggleSelect(video.id);
                    } else {
                        window.location.href = `/videos/${video.id}`; // Or router push if imported
                    }
                }}
            >
                {/* Thumbnail */}
                {thumbnailUrl && (
                    <img
                        src={thumbnailUrl}
                        alt={video.title}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovering ? "opacity-0" : "opacity-80 group-hover:opacity-100"}`}
                    />
                )}

                {/* Teaser Video */}
                {teaserUrl && (
                    <video
                        ref={videoRef}
                        src={teaserUrl}
                        muted
                        loop
                        playsInline
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovering ? "opacity-100" : "opacity-0"}`}
                    />
                )}

                {/* Fallback */}
                {!thumbnailUrl && !teaserUrl && (
                    <div className="flex items-center justify-center w-full h-full">
                        <svg className="w-16 h-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                )}

                {/* Duration Badge */}
                <div className={`absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-xs font-mono px-2 py-1 rounded text-white transition-opacity ${isHovering ? "opacity-0" : "opacity-100"}`}>
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
                        <span className="flex items-center gap-1">
                            {formatSize(video.compressedSize)}
                            {compressionRatio && (
                                <span className="text-green-400">(-{compressionRatio}%)</span>
                            )}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5">
                    <span className="text-[10px] text-gray-600">
                        {formatDate(video.createdAt)}
                    </span>
                    <a
                        href={`/videos/${video.id}`}
                        className="text-xs font-bold bg-white text-black px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-1"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Edit
                    </a>
                </div>
            </div>
        </div>
    );
}

export default VideoCard;
