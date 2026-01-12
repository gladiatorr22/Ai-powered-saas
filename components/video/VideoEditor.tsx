"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Video } from "@prisma/client";

interface VideoEditorProps {
    video: Video;
}

export default function VideoEditor({ video }: VideoEditorProps) {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isVideoLoading, setIsVideoLoading] = useState(true);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [showSaveMenu, setShowSaveMenu] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const saveMenuRef = useRef<HTMLDivElement>(null);

    // Transformation States
    const [processingMode, setProcessingMode] = useState<"original" | "social" | "teaser">("original");
    const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1" | "4:5">("16:9");
    const [quality, setQuality] = useState(100);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (saveMenuRef.current && !saveMenuRef.current.contains(e.target as Node)) {
                setShowSaveMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getTransformedUrl = () => {
        if (!cloudName) return "";
        let transformations = [];

        // Add width limit for faster preview loading
        transformations.push("w_720");

        if (processingMode === "social") {
            const [w, h] = aspectRatio.split(":").map(Number);
            transformations.push(`ar_${w}:${h},c_fill,g_auto`);
        } else if (processingMode === "teaser") {
            transformations.push("e_preview:duration_10");
        }

        // Always use streaming quality for preview BUT respect the slider relative to it? 
        // Logic: q_auto:low is standard preview. But user wants to see compression effect.
        // Actually, simulating exact compression artifacts on a w_720 preview is tricky.
        // Let's keep the preview FAST (q_auto:low) but if they dial it down heavily, 
        // we might want to show it. But for now, let's prioritize speed as requested earlier.
        transformations.push(`q_${quality}`);
        transformations.push("f_auto");

        const transformString = transformations.join("/") + "/";
        return `https://res.cloudinary.com/${cloudName}/video/upload/${transformString}${video.publicId}.mp4`;
    };

    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        setPreviewUrl(getTransformedUrl());
        setSaveSuccess(false);
        setIsVideoLoading(true);
    }, [processingMode, aspectRatio, quality]);

    // Full quality URL for downloads (no width limit, proper compression)
    const getDownloadUrl = () => {
        if (!cloudName) return "";
        let transformations = [];

        if (processingMode === "social") {
            const [w, h] = aspectRatio.split(":").map(Number);
            transformations.push(`ar_${w}:${h},c_fill,g_auto`);
        } else if (processingMode === "teaser") {
            transformations.push("e_preview:duration_10");
        }

        if (quality < 100) {
            transformations.push(`q_${quality}`);
            transformations.push("f_auto");
        }

        const transformString = transformations.length > 0 ? transformations.join("/") + "/" : "";
        return `https://res.cloudinary.com/${cloudName}/video/upload/${transformString}${video.publicId}.mp4`;
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const downloadUrl = getDownloadUrl();
            const response = await fetch(downloadUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${video.title}_${processingMode}${quality < 100 ? `_q${quality}` : ""}.mp4`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download failed", error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleSave = async (asCopy: boolean) => {
        setIsSaving(true);
        setSaveSuccess(false);
        setShowSaveMenu(false);

        try {
            const response = await fetch("/api/video-save-copy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    videoId: video.id,
                    title: asCopy
                        ? `${video.title} (${processingMode === "social" ? aspectRatio : processingMode})`
                        : video.title,
                    mode: processingMode,
                    transformations: {
                        aspectRatio: processingMode === "social" ? aspectRatio : null,
                        isCompressed: quality < 100,
                        quality: quality,
                    },
                    overwrite: !asCopy,
                }),
            });

            if (response.ok) {
                setSaveSuccess(true);
                if (!asCopy) router.refresh();
            }
        } catch (error) {
            console.error("Save error", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/video-delete?id=${video.id}`, { method: "DELETE" });
            if (response.ok) router.push("/home");
        } catch (error) {
            console.error("Delete error", error);
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const hasChanges = processingMode !== "original" || quality < 100;

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Link
                href="/home"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Dashboard
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[calc(100vh-12rem)]">
                {/* Left: Preview Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel overflow-hidden rounded-3xl relative aspect-video flex items-center justify-center bg-black/50">
                        {/* Loading Overlay */}
                        {isVideoLoading && previewUrl && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
                                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                                <p className="text-sm text-gray-400">Processing video...</p>
                                <p className="text-xs text-gray-500 mt-1">This may take a moment for AI transformations</p>
                            </div>
                        )}

                        {previewUrl ? (
                            <video
                                ref={videoRef}
                                key={previewUrl}
                                src={previewUrl}
                                controls
                                className="w-full h-full object-contain"
                                onLoadedData={() => setIsVideoLoading(false)}
                                onWaiting={() => setIsVideoLoading(true)}
                                onPlaying={() => setIsVideoLoading(false)}
                            />
                        ) : (
                            <div className="text-gray-500">Configuring Cloudinary...</div>
                        )}
                    </div>

                    <div className="glass-panel p-6 rounded-2xl">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-1">{video.title}</h1>
                                <p className="text-sm text-gray-400">
                                    {processingMode === "original"
                                        ? (quality < 100 ? `Compressed (${quality}%)` : "Original File")
                                        : processingMode === "social"
                                            ? `Smart Crop (${aspectRatio})${quality < 100 ? ` + ${quality}%` : ""}`
                                            : `AI Teaser${quality < 100 ? ` + ${quality}%` : ""}`}
                                </p>
                            </div>

                            <div className="flex gap-2 items-center">
                                {/* Delete Button */}
                                {!showDeleteConfirm ? (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="p-3 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                        title="Delete Video"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-full">
                                        <span className="text-xs text-red-400">Delete?</span>
                                        <button
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                            className="px-3 py-1 bg-red-500 text-white text-xs rounded-full font-bold"
                                        >
                                            {isDeleting ? "..." : "Yes"}
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="px-3 py-1 bg-white/10 text-white text-xs rounded-full"
                                        >
                                            No
                                        </button>
                                    </div>
                                )}

                                {/* Smart Save Button */}
                                <div className="relative" ref={saveMenuRef}>
                                    <button
                                        onClick={() => setShowSaveMenu(!showSaveMenu)}
                                        disabled={isSaving || !hasChanges}
                                        className={`px-5 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${saveSuccess
                                            ? "bg-green-500 text-white"
                                            : !hasChanges
                                                ? "bg-white/10 text-gray-500 cursor-not-allowed"
                                                : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                                            }`}
                                    >
                                        {isSaving ? (
                                            <span className="loading loading-spinner loading-sm"></span>
                                        ) : saveSuccess ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                        )}
                                        {saveSuccess ? "Saved!" : "Save"}
                                        {!saveSuccess && hasChanges && (
                                            <svg className={`w-4 h-4 transition-transform ${showSaveMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        )}
                                    </button>

                                    {showSaveMenu && (
                                        <div className="absolute right-0 top-full mt-2 w-48 glass-panel-dark border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                                            <button onClick={() => handleSave(false)} className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                Save (Overwrite)
                                            </button>
                                            <button onClick={() => handleSave(true)} className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                Save as Copy
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Download Button */}
                                <button
                                    onClick={handleDownload}
                                    disabled={isDownloading}
                                    className="bg-white text-black px-5 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
                                >
                                    {isDownloading ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    )}
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Controls */}
                <div className="space-y-6">
                    {/* Mode Selection */}
                    <div className="glass-panel p-6 rounded-2xl space-y-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            AI Transformation
                        </h3>
                        <div className="grid grid-cols-3 gap-2 p-1 bg-black/20 rounded-xl">
                            {(["original", "social", "teaser"] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setProcessingMode(mode)}
                                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${processingMode === mode ? "bg-white/10 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                                >
                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Social Crop Controls */}
                    {processingMode === "social" && (
                        <div className="glass-panel p-6 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-4">
                            <h3 className="text-md font-bold text-white mb-4">Smart Crop Format</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Landscape", ratio: "16:9" },
                                    { label: "Portrait", ratio: "9:16" },
                                    { label: "Square", ratio: "1:1" },
                                    { label: "Vertical", ratio: "4:5" },
                                ].map((format) => (
                                    <button
                                        key={format.ratio}
                                        onClick={() => setAspectRatio(format.ratio as any)}
                                        className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${aspectRatio === format.ratio ? "bg-white text-black border-white" : "bg-black/20 border-white/5 text-gray-400 hover:border-white/20 hover:text-white"}`}
                                    >
                                        <span className="text-xs font-bold">{format.label}</span>
                                        <span className="text-[10px] opacity-60">{format.ratio}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Teaser Info */}
                    {processingMode === "teaser" && (
                        <div className="glass-panel p-6 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-4">
                            <h3 className="text-md font-bold text-white">AI Teaser</h3>
                            <p className="text-sm text-gray-300">Automatically extracts the most interesting 10 seconds.</p>
                        </div>
                    )}

                    {/* Compression */}
                    <div className="glass-panel p-6 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Compression Level</h3>
                                <p className="text-xs text-gray-400">Adjust video quality percentage</p>
                            </div>
                            <span className="text-xl font-bold text-purple-400">{quality}%</span>
                        </div>

                        <input
                            type="range"
                            min="10"
                            max="100"
                            value={quality}
                            onChange={(e) => setQuality(Number(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Maximum Compression</span>
                            <span>Original Quality</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
