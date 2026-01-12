"use client";

import React, { useState, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useUpload } from "@/context/UploadContext";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB - direct upload supports larger files

export default function UploadModal() {
    const { isUploadOpen, closeUpload, triggerUploadComplete } = useUpload();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    if (!isUploadOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (selectedFile: File) => {
        if (selectedFile.size > MAX_FILE_SIZE) {
            setError("File size exceeds 500MB limit");
            setFile(null);
            return;
        }
        setError(null);
        setFile(selectedFile);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile && droppedFile.type.startsWith("video/")) {
            validateAndSetFile(droppedFile);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title.trim()) return;

        setIsUploading(true);
        setError(null);
        setUploadProgress(0);

        try {
            // Step 1: Get signed upload credentials
            setUploadStatus("Preparing upload...");
            const signatureRes = await axios.get("/api/cloudinary-signature");
            const { signature, timestamp, cloudName, apiKey, folder } = signatureRes.data;

            // Step 2: Upload directly to Cloudinary
            setUploadStatus("Uploading to cloud...");
            const formData = new FormData();
            formData.append("file", file);
            formData.append("signature", signature);
            formData.append("timestamp", String(timestamp));
            formData.append("api_key", apiKey);
            formData.append("folder", folder);
            formData.append("resource_type", "video");

            const cloudinaryRes = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
                formData,
                {
                    onUploadProgress: (progressEvent) => {
                        const progress = progressEvent.total
                            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                            : 0;
                        setUploadProgress(progress);
                    },
                }
            );

            const { public_id, bytes, duration } = cloudinaryRes.data;

            // Step 3: Save metadata to database
            setUploadStatus("Saving to library...");
            await axios.post("/api/save-video", {
                title,
                description,
                publicId: public_id,
                originalSize: file.size,
                compressedSize: bytes,
                duration: duration || 0,
            });

            // Success
            closeUpload();
            setTitle("");
            setDescription("");
            setFile(null);
            setUploadStatus("");
            triggerUploadComplete();
            router.refresh();

        } catch (err) {
            console.error("Upload error:", err);
            setError(axios.isAxiosError(err)
                ? err.response?.data?.error || "Upload failed"
                : "An error occurred during upload"
            );
        } finally {
            setIsUploading(false);
            setUploadStatus("");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeUpload}></div>

            <div className="relative w-full max-w-lg glass-panel-dark border border-white/10 rounded-3xl p-8 shadow-2xl animate-scale-in overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={closeUpload}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <h2 className="text-2xl font-bold text-white mb-6">Upload Video</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* File Drop Zone */}
                    <div
                        className={`border-2 border-dashed border-white/10 rounded-2xl p-8 text-center transition-colors ${file ? 'bg-white/5 border-green-500/30' : 'hover:bg-white/5 hover:border-white/30'}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="video/*"
                            className="hidden"
                        />

                        {file ? (
                            <div className="flex flex-col items-center">
                                <svg className="w-10 h-10 text-green-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p className="text-sm font-medium text-white">{file.name}</p>
                                <p className="text-xs text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center cursor-pointer">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                </div>
                                <p className="text-sm font-medium text-gray-300">Click to upload or drag and drop</p>
                                <p className="text-xs text-gray-500 mt-1">MP4, WebM, MOV up to 500MB</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Title</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                                placeholder="Video title"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all resize-none h-24"
                                placeholder="Video description (optional)"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {isUploading && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>{uploadStatus}</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isUploading || !file || !title.trim()}
                        className="w-full bg-white text-black font-bold py-3.5 rounded-full hover:bg-gray-200 focus:ring-4 focus:ring-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isUploading ? "Uploading..." : "Upload Video"}
                    </button>
                </form>
            </div>
        </div>
    );
}
