"use client";

import React, { useState, useEffect } from "react";
import { Video } from "@prisma/client";
import {
  Layout,
  Type,
  Image as ImageIcon,
  Share2,
  ChevronLeft,
  Upload,
  Check,
  Loader2
} from "lucide-react";
import axios from "axios";
import { AILoader, Spinner, Skeleton } from "@/components/ui/Loading";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";
import { getVideoThumbnailUrl, getImageUrl } from "@/lib/cloudinary-urls";

const socialFormats = {
  "Instagram Square": { width: 1080, height: 1080, aspectRatio: "1:1", icon: ImageIcon, label: "Square" },
  "Instagram Portrait": { width: 1080, height: 1350, aspectRatio: "4:5", icon: ImageIcon, label: "Portrait" },
  "X Post": { width: 1200, height: 675, aspectRatio: "16:9", icon: Share2, label: "Post" },
  "X Header": { width: 1500, height: 500, aspectRatio: "3:1", icon: Share2, label: "Header" },
  "Facebook Cover": { width: 820, height: 312, aspectRatio: "205:78", icon: Share2, label: "Cover" },
  "LinkedIn Post": { width: 1200, height: 628, aspectRatio: "1.91:1", icon: Share2, label: "Post" },
  "Snapchat Story": { width: 1080, height: 1920, aspectRatio: "9:16", icon: Share2, label: "Story" },
};

export default function SocialShare() {
  const [selectedFormat, setSelectedFormat] = useState("Instagram Square");
  const [caption, setCaption] = useState("");
  const { showToast } = useToast();

  // Multi-select state
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<Video[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [thumbnailMap, setThumbnailMap] = useState<Record<string, string>>({});

  // Loading & UI State
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(true);

  // Nav Guard
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  const router = useRouter();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setIsLoadingLibrary(true);
    try {
      const res = await axios.get("/api/videos");
      setVideos(res.data);

      // Check for query params
      const params = new URLSearchParams(window.location.search);
      const videoIds = params.get("videoIds");
      if (videoIds && res.data.length > 0) {
        const ids = videoIds.split(",");
        const toSelect = res.data.filter((v: Video) => ids.includes(v.id));
        if (toSelect.length > 0) {
          setSelectedVideos(toSelect);
          setActiveVideoId(toSelect[0].id);
        }
      }

    } catch (error) {
      console.error("Error fetching videos:", error);
      showToast("Failed to load videos", "error");
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  // Warn before leave
  useEffect(() => {
    if (selectedVideos.length > 0 || caption) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [selectedVideos, caption, thumbnailMap]);

  // Handle Back
  const handleBack = () => {
    if (isDirty) {
      setPendingNavigation(() => () => router.push("/dashboard"));
      setShowConfirmModal(true);
    } else {
      router.push("/dashboard");
    }
  };

  // Modal Handlers
  const handleConfirmLeave = () => {
    if (pendingNavigation) pendingNavigation();
    setShowConfirmModal(false);
  };

  const handleCancelLeave = () => {
    setPendingNavigation(null);
    setShowConfirmModal(false);
  };

  // Upload Handlers
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeVideoId) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("/api/image-upload", formData);
      setThumbnailMap(prev => ({
        ...prev,
        [activeVideoId]: res.data.publicId
      }));
      showToast("Thumbnail uploaded successfully", "success");
    } catch (error) {
      showToast("Failed to upload thumbnail", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Toggle Selection
  const toggleVideoSelection = (video: Video) => {
    setSelectedVideos(prev => {
      const isSelected = prev.find(v => v.id === video.id);
      if (isSelected) {
        const newSelection = prev.filter(v => v.id !== video.id);
        if (activeVideoId === video.id) {
          setActiveVideoId(newSelection.length > 0 ? newSelection[0].id : null);
        }
        return newSelection;
      } else {
        if (prev.length >= 5) {
          showToast("Maximum 5 videos can be selected", "warning");
          return prev;
        }
        const newSelection = [...prev, video];
        if (!activeVideoId) setActiveVideoId(video.id);
        return newSelection;
      }
    });
  };

  const handleSaveDraft = async () => {
    if (selectedVideos.length === 0) return;
    setIsSaving(true);
    try {
      // Loop through selected videos and save drafts
      const promises = selectedVideos.map(video =>
        axios.post("/api/social-drafts", {
          videoId: video.id,
          caption,
          format: selectedFormat,
          thumbnailPublicId: thumbnailMap[video.id]
        })
      );
      await Promise.all(promises);

      showToast("Draft(s) saved successfully!", "success");
      setIsDirty(false);
      router.push("/dashboard");
    } catch (e) {
      showToast("Failed to save drafts", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const getTransformedUrl = (video: Video) => {
    const formatConfig = socialFormats[selectedFormat as keyof typeof socialFormats];
    return activeVideoId ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/c_fill,w_${formatConfig.width},h_${formatConfig.height}/${video.publicId}.mp4` : "";
  };

  const handleShare = (platform: string) => {
    const video = selectedVideos.find(v => v.id === activeVideoId);
    if (!video) return;
    const url = getTransformedUrl(video);
    if (!url) return;

    const text = encodeURIComponent(caption);
    const encodedUrl = encodeURIComponent(url);

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${text} ${encodedUrl}`, '_blank');
        break;
      case 'instagram':
      case 'snapchat':
        navigator.clipboard.writeText(url);
        showToast(`${platform} doesn't support direct web sharing. Link copied to clipboard!`, "info");
        break;
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-black text-white relative">
      {isSaving && <AILoader label="Saving Drafts..." />}

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCancelLeave}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave?"
        primaryAction={{
          label: "Leave",
          onClick: handleConfirmLeave,
          className: "bg-red-500 text-white hover:bg-red-600"
        }}
      />

      {/* Left: Library & Selection */}
      <div className="w-80 border-r border-white/10 flex flex-col bg-lumina-gray/20">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <button onClick={handleBack} className="p-2 hover:bg-white/10 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-bold">Library ({selectedVideos.length}/5)</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoadingLibrary ? (
            <>
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </>
          ) : (
            videos.map(video => {
              const isSelected = selectedVideos.some(v => v.id === video.id);
              return (
                <div
                  key={video.id}
                  onClick={() => toggleVideoSelection(video)}
                  className={`relative group cursor-pointer rounded-xl overflow-hidden border transition-all ${isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-white/10 hover:border-white/30'}`}
                >
                  <div className="aspect-video bg-black relative">
                    <img
                      src={getVideoThumbnailUrl(video.publicId, { width: 300, height: 200 })}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                      alt={video.title}
                    />
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-xs font-medium truncate text-white drop-shadow-md">{video.title}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Center: Preview */}
      <div className="flex-1 flex flex-col bg-black/60 relative">
        {selectedVideos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <Share2 className="w-16 h-16 mb-4 opacity-20" />
            <p>Select videos to start sharing</p>
          </div>
        ) : (
          <>
            {/* Selector Tabs for Preview */}
            <div className="h-16 border-b border-white/10 flex items-center px-4 gap-2 overflow-x-auto">
              {selectedVideos.map(v => (
                <button
                  key={v.id}
                  onClick={() => setActiveVideoId(v.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${activeVideoId === v.id ? 'bg-white text-black font-bold' : 'bg-white/5 hover:bg-white/10'}`}
                >
                  <span className="max-w-[100px] truncate">{v.title}</span>
                </button>
              ))}
            </div>

            {/* Main Preview */}
            <div className="flex-1 p-8 flex items-center justify-center overflow-hidden">
              {activeVideoId && (
                <div className="relative shadow-2xl max-h-full aspect-[9/16] bg-black rounded-xl overflow-hidden border border-white/10">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-white/5">
                    <p>Preview: {selectedFormat}</p>
                  </div>
                  <img
                    src={thumbnailMap[activeVideoId]
                      ? getImageUrl(thumbnailMap[activeVideoId])
                      : getVideoThumbnailUrl(selectedVideos.find(v => v.id === activeVideoId)?.publicId || "")
                    }
                    className="w-full h-full object-cover opacity-50"
                    alt="Preview"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white font-bold drop-shadow-xl p-4 text-center">{caption || "Your caption here..."}</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right: Controls */}
      {selectedVideos.length > 0 && (
        <div className="w-96 border-l border-white/10 bg-lumina-gray/20 flex flex-col">
          <div className="p-6 space-y-8 flex-1 overflow-y-auto">

            {/* Format Selection */}
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2"><Layout className="w-4 h-4" /> Format</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(socialFormats).map(([key, fmt]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedFormat(key)}
                    className={`p-3 rounded-lg text-left text-xs transition-all border ${selectedFormat === key ? 'bg-white text-black border-white' : 'bg-white/5 hover:bg-white/10 border-transparent text-gray-400'}`}
                  >
                    <div className="font-bold mb-1">{fmt.label}</div>
                    <div className="opacity-70">{fmt.aspectRatio}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Caption */}
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2"><Type className="w-4 h-4" /> Caption</h3>
              <textarea
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Write a caption..."
                className="w-full h-32 bg-black/40 border border-white/10 rounded-lg p-3 text-white resize-none focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            {/* Thumbnail */}
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Custom Thumbnail</h3>
              <p className="text-xs text-gray-500">Upload a custom cover for the active video.</p>
              <label className="block w-full cursor-pointer">
                <div className="w-full h-24 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center hover:bg-white/5 transition-colors gap-2 group">
                  {isUploading ? (
                    <Spinner className="w-5 h-5 text-gray-400" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-gray-400 group-hover:text-white" />
                      <span className="text-xs text-gray-500 group-hover:text-gray-300">Click to upload</span>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailUpload} />
              </label>
            </div>

            {/* Share Actions */}
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2"><Share2 className="w-4 h-4" /> Share</h3>
              <div className="grid grid-cols-3 gap-2">
                {['twitter', 'facebook', 'linkedin', 'whatsapp', 'instagram', 'snapchat'].map(p => (
                  <button key={p} onClick={() => handleShare(p)} className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-xs capitalize">
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              {isSaving ? <Spinner className="w-4 h-4 text-black" /> : <Share2 className="w-4 h-4" />}
              Save & Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
}