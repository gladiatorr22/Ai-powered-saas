"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import VideoCard from "./VideoCard";
import Link from "next/link";
import { useUpload } from "@/context/UploadContext";

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

function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const { openUpload } = useUpload();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get("/api/videos");
        setVideos(response.data);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError("Failed to load videos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="min-h-screen bg-lumina-black text-white p-4 md:p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">My Videos</h1>
            <p className="text-gray-400">
              Manage and view your uploaded assets.
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex gap-4">
            <button onClick={openUpload} className="glass-button px-6 py-3 rounded-full flex items-center gap-2 text-sm font-medium">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Upload Video
            </button>
            <Link href="/social-share" className="bg-white text-black px-6 py-3 rounded-full flex items-center gap-2 text-sm font-bold hover:bg-gray-200 transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Social Share
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32">
            <span className="loading loading-spinner loading-lg text-white"></span>
            <p className="mt-4 text-gray-500">Loading videos...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="glass-panel p-4 rounded-lg flex items-center gap-3 text-red-400">
            <svg
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && videos.length === 0 && (
          <div className="glass-panel rounded-3xl p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6">
              <svg
                className="w-10 h-10 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No videos yet</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Upload your first video to start processing and sharing your content.
            </p>
            <button onClick={openUpload} className="bg-white text-black px-8 py-3 rounded-full text-base font-bold hover:bg-gray-200 transition-colors">
              Upload Video
            </button>
          </div>
        )}

        {/* Video Grid */}
        {!isLoading && !error && videos.length > 0 && (
          <>
            <div className="mb-6 text-sm text-gray-500 font-mono">
              {videos.length} VIDEO{videos.length !== 1 ? "S" : ""}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;