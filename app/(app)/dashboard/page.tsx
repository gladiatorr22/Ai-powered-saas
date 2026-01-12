"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import VideoCard from "./VideoCard";
import Link from "next/link";
import { useUpload } from "@/context/UploadContext";
import { useToast } from "@/components/ui/Toast";
import { Plus, Share2, CheckSquare, X, Download, Trash2 } from "lucide-react";

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

type SortField = "createdAt" | "title" | "originalSize";
type SortOrder = "asc" | "desc";

function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const { openUpload, setOnUploadComplete } = useUpload();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk Actions Handlers
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    setIsDeleting(true);
    try {
      // Actually delete from backend
      const deletePromises = Array.from(selectedIds).map((id) =>
        axios.delete(`/api/video-delete?id=${id}`)
      );
      await Promise.all(deletePromises);

      // Update UI
      setVideos((prev) => prev.filter((v) => !selectedIds.has(v.id)));
      showToast(`Successfully deleted ${selectedIds.size} video(s)`, "success");
      setSelectedIds(new Set());
      setIsSelectMode(false);
    } catch (e) {
      console.error("Bulk delete error:", e);
      showToast("Failed to delete some videos", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkShare = () => {
    const idsStr = Array.from(selectedIds).join(",");
    window.location.href = `/social-share?videoIds=${idsStr}`;
  };

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/videos");
      setVideos(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching videos:", err);
      setError("Failed to load videos");
      showToast("Failed to load videos", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
    setOnUploadComplete(() => fetchVideos);
    return () => setOnUploadComplete(null);
  }, [setOnUploadComplete]);

  // Sorted videos
  const sortedVideos = useMemo(() => {
    return [...videos].sort((a, b) => {
      let comparison = 0;

      if (sortField === "createdAt") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === "originalSize") {
        comparison = parseInt(a.originalSize) - parseInt(b.originalSize);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [videos, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${sortField === field
        ? "bg-white/10 text-white"
        : "text-gray-500 hover:text-white hover:bg-white/5"
        }`}
    >
      {label}
      {sortField === field && (
        <svg className={`w-3 h-3 transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-lumina-black text-white p-4 md:p-8 pt-24 pb-32">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">My Videos</h1>
            <p className="text-gray-400">
              Manage and view your uploaded assets.
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex gap-4">
            <button
              onClick={() => {
                setIsSelectMode(!isSelectMode);
                setSelectedIds(new Set());
              }}
              className={`px-6 py-3 rounded-full flex items-center gap-2 text-sm font-medium transition-colors ${isSelectMode ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
              {isSelectMode ? <X className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
              {isSelectMode ? "Cancel" : "Select"}
            </button>

            <button onClick={openUpload} className="glass-button px-6 py-3 rounded-full flex items-center gap-2 text-sm font-medium">
              <Plus className="w-4 h-4" />
              Upload
            </button>
            <Link href="/social-share" className="bg-white text-black px-6 py-3 rounded-full flex items-center gap-2 text-sm font-bold hover:bg-gray-200 transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">Loading videos...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="glass-panel p-4 rounded-lg flex items-center gap-3 text-red-400 border border-red-500/20 bg-red-500/10">
            <span>{error}</span>
            <button onClick={fetchVideos} className="ml-auto text-sm underline hover:no-underline">
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && videos.length === 0 && (
          <div className="glass-panel rounded-3xl p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <Plus className="w-10 h-10 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No videos yet</h2>
            <p className="text-gray-500 mb-6">Upload your first video to get started</p>
            <button onClick={openUpload} className="bg-white text-black px-8 py-3 rounded-full text-base font-bold">
              Upload Video
            </button>
          </div>
        )}

        {/* Video Grid */}
        {!isLoading && !error && videos.length > 0 && (
          <>
            {/* Sort Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-500 font-mono">
                {videos.length} VIDEO{videos.length !== 1 ? "S" : ""}
                {selectedIds.size > 0 && <span className="text-white ml-2 font-bold">• {selectedIds.size} SELECTED</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 mr-2">Sort by:</span>
                <SortButton field="createdAt" label="Date" />
                <SortButton field="title" label="Name" />
                <SortButton field="originalSize" label="Size" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {sortedVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  isSelectMode={isSelectMode}
                  isSelected={selectedIds.has(video.id)}
                  onToggleSelect={toggleSelection}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-[#0a0a0a] border border-white/20 rounded-full px-8 py-4 flex items-center gap-6 shadow-2xl z-50 animate-in slide-in-from-bottom-5">
          <span className="text-white font-bold text-sm mr-2">{selectedIds.size} Selected</span>

          <div className="h-6 w-px bg-white/20"></div>

          <button
            onClick={handleBulkShare}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors"
            title="Share Selected"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Share</span>
          </button>

          <button
            onClick={() => showToast("Download feature coming soon!", "info")}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors"
            title="Download"
          >
            <Download className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Download</span>
          </button>

          <button
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
            title="Delete Selected"
          >
            {isDeleting ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
            <span className="text-[10px] uppercase font-bold tracking-wider">Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default Home;