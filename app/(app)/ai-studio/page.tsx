"use client";

import React, { useState, useEffect } from "react";
import { CldImage, CldVideoPlayer } from "next-cloudinary";
import "next-cloudinary/dist/cld-video-player.css";
import axios from "axios";
import { useRouter } from "next/navigation";
import { AILoader, Spinner, Skeleton } from "@/components/ui/Loading";
import { useToast } from "@/components/ui/Toast";
import { getVideoThumbnailUrl, getImageUrl } from "@/lib/cloudinary-urls";
import {
    Sparkles,
    Eraser,
    RefreshCw,
    Palette,
    Image as ImageIcon,
    Wand2,
    Upload,
    ChevronLeft,
    Layers,
    Crop,
    MessageSquare,
    Tag,
    FileText,
    Shield,
    Video as VideoIcon,
    Zap,
    Send,
    Copy,
    Check,
    Eye,
    Mic,
    Search,
    Settings,
    Download
} from "lucide-react";
import { Video } from "@prisma/client";

// Types
type StudioTab = "create" | "analyze" | "optimize";
type StudioMode = "home" | "fill" | "remove" | "replace" | "recolor" | "bg-replace" | "restore" | "crop" | "vision" | "tags" | "ocr" | "moderate" | "transcribe" | "preview" | "quality";
type MediaType = "image" | "video";

// Tool Definitions
const CREATE_TOOLS = [
    { id: "fill", label: "Generative Fill", description: "Extend images with AI backgrounds", icon: Layers, color: "text-purple-400" },
    { id: "remove", label: "Generative Remove", description: "Magic eraser for objects", icon: Eraser, color: "text-red-400" },
    { id: "replace", label: "Generative Replace", description: "Swap objects with text", icon: RefreshCw, color: "text-blue-400" },
    { id: "recolor", label: "Generative Recolor", description: "Change colors instantly", icon: Palette, color: "text-pink-400" },
    { id: "bg-replace", label: "Background Replace", description: "New AI-generated scenes", icon: ImageIcon, color: "text-green-400" },
    { id: "restore", label: "Generative Restore", description: "Fix blurry photos", icon: Wand2, color: "text-yellow-400" },
    { id: "crop", label: "Smart Crop", description: "AI-powered cropping", icon: Crop, color: "text-cyan-400" },
];

const ANALYZE_TOOLS = [
    { id: "vision", label: "AI Vision", description: "Ask questions about images", icon: MessageSquare, color: "text-violet-400" },
    { id: "tags", label: "Auto-Tagging", description: "AI categorization", icon: Tag, color: "text-orange-400" },
    { id: "ocr", label: "Text Extraction", description: "Read text in images", icon: FileText, color: "text-lime-400" },
    { id: "moderate", label: "Content Moderation", description: "Safety detection", icon: Shield, color: "text-rose-400" },
    { id: "transcribe", label: "Transcription", description: "Video to text", icon: Mic, color: "text-teal-400" },
];

const OPTIMIZE_TOOLS = [
    { id: "preview", label: "Video Preview", description: "AI highlight reels", icon: VideoIcon, color: "text-indigo-400" },
    { id: "quality", label: "Quality Optimize", description: "Smart compression", icon: Zap, color: "text-amber-400" },
];

const ASPECT_RATIOS = [
    { label: "1:1", value: "1:1" },
    { label: "4:3", value: "4:3" },
    { label: "16:9", value: "16:9" },
    { label: "9:16", value: "9:16" },
    { label: "21:9", value: "21:9" },
    { label: "4:5", value: "4:5" },
];

const GRAVITY_OPTIONS = [
    { label: "Auto (AI)", value: "auto" },
    { label: "Faces", value: "auto:faces" },
    { label: "Classic", value: "auto:classic" },
    { label: "Center", value: "center" },
    { label: "North", value: "north" },
    { label: "South", value: "south" },
];

// Moderation result type
interface ModerationResult {
    safe: boolean;
    categories?: string[];
    status?: string;
}

// Image type
interface ImageItem {
    id: string;
    publicId: string;
    title: string;
}

export default function AIStudio() {
    const router = useRouter();
    const { showToast } = useToast();

    // UI State
    const [activeTab, setActiveTab] = useState<StudioTab>("create");
    const [mode, setMode] = useState<StudioMode>("home");
    const [activeMedia, setActiveMedia] = useState<{ publicId: string; type: MediaType } | null>(null);
    const [generated, setGenerated] = useState(false);

    // Tool State
    const [prompt, setPrompt] = useState("");
    const [prompt2, setPrompt2] = useState("");
    const [aspectRatio, setAspectRatio] = useState("1:1");
    const [gravity, setGravity] = useState("auto");
    const [fillPrompt, setFillPrompt] = useState("");

    // AI Vision State
    const [visionQuestion, setVisionQuestion] = useState("");
    const [visionResponse, setVisionResponse] = useState("");
    const [visionHistory, setVisionHistory] = useState<{ role: string, content: string }[]>([]);

    // Analysis Results
    const [tags, setTags] = useState<string[]>([]);
    const [ocrText, setOcrText] = useState("");
    const [moderationResult, setModerationResult] = useState<ModerationResult | null>(null);
    const [transcript, setTranscript] = useState("");

    // Loading State
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Library State
    const [videos, setVideos] = useState<Video[]>([]);
    const [images, setImages] = useState<ImageItem[]>([]);

    useEffect(() => {
        fetchLibrary();
    }, []);

    const fetchLibrary = async () => {
        try {
            const [vidRes, imgRes] = await Promise.all([
                axios.get("/api/videos"),
                axios.get("/api/images").catch(() => ({ data: [] }))
            ]);
            setVideos(vidRes.data);
            setImages(imgRes.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await axios.post("/api/image-upload", formData);
            await axios.post("/api/images", { publicId: res.data.publicId, title: file.name });
            setActiveMedia({ publicId: res.data.publicId, type: "image" });
            fetchLibrary();
        } catch (err) {
            showToast("Upload failed", "error");
        } finally {
            setIsUploading(false);
        }
    };

    const handleGenerate = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setGenerated(true);
        }, 2000);
    };

    const handleDiscard = () => {
        setGenerated(false);
        setPrompt("");
        setPrompt2("");
        setFillPrompt("");
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await axios.post("/api/images", {
                title: `${mode} - ${new Date().toLocaleTimeString()}`,
                publicId: activeMedia?.publicId
            });
            showToast("Saved to Dashboard!", "success");
            setGenerated(false);
            fetchLibrary();
        } catch (e) {
            showToast("Failed to save", "error");
        } finally {
            setIsSaving(false);
        }
    };

    // AI Vision Handler
    const handleVisionAsk = async () => {
        if (!visionQuestion.trim() || !activeMedia) return;

        setIsAnalyzing(true);
        setVisionHistory(prev => [...prev, { role: "user", content: visionQuestion }]);

        try {
            const res = await axios.post("/api/ai/vision", {
                imageUrl: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${activeMedia.publicId}`,
                question: visionQuestion
            });

            setVisionHistory(prev => [...prev, { role: "assistant", content: res.data.response }]);
            setVisionResponse(res.data.response);
        } catch (e) {
            setVisionHistory(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't analyze the image. Please try again." }]);
        } finally {
            setVisionQuestion("");
            setIsAnalyzing(false);
        }
    };

    // Auto-Tag Handler
    const handleAutoTag = async () => {
        if (!activeMedia) return;
        setIsAnalyzing(true);
        try {
            const res = await axios.post("/api/ai/tags", { publicId: activeMedia.publicId });
            setTags(res.data.tags || []);
        } catch (e) {
            showToast("Tagging failed", "error");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // OCR Handler
    const handleOCR = async () => {
        if (!activeMedia) return;
        setIsAnalyzing(true);
        try {
            const res = await axios.post("/api/ai/ocr", { publicId: activeMedia.publicId });
            setOcrText(res.data.text || "No text detected");
        } catch (e) {
            showToast("OCR failed", "error");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Moderation Handler
    const handleModerate = async () => {
        if (!activeMedia) return;
        setIsAnalyzing(true);
        try {
            const res = await axios.post("/api/ai/moderate", { publicId: activeMedia.publicId });
            setModerationResult(res.data);
        } catch (e) {
            showToast("Moderation check failed", "error");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Transcribe Handler
    const handleTranscribe = async () => {
        if (!activeMedia || activeMedia.type !== "video") return;
        setIsAnalyzing(true);
        try {
            const res = await axios.post("/api/ai/transcribe", { publicId: activeMedia.publicId });
            setTranscript(res.data.transcript || "No speech detected");
        } catch (e) {
            showToast("Transcription failed", "error");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Get current tools based on active tab
    const getCurrentTools = () => {
        switch (activeTab) {
            case "create": return CREATE_TOOLS;
            case "analyze": return ANALYZE_TOOLS;
            case "optimize": return OPTIMIZE_TOOLS;
            default: return CREATE_TOOLS;
        }
    };

    // Render Tool Controls
    const renderToolControls = () => {
        switch (mode) {
            case "fill":
                return (
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-bold text-white mb-2">Aspect Ratio</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {ASPECT_RATIOS.map(r => (
                                    <button key={r.value} onClick={() => setAspectRatio(r.value)}
                                        className={`p-2 rounded border text-sm ${aspectRatio === r.value ? 'bg-white text-black border-white' : 'border-white/20 text-gray-400'}`}>
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-white mb-2">Scene Description (Optional)</h3>
                            <textarea
                                value={fillPrompt}
                                onChange={e => setFillPrompt(e.target.value)}
                                placeholder="Describe what should fill the extended area..."
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white h-20 resize-none"
                            />
                        </div>
                    </div>
                );

            case "remove":
                return (
                    <div className="space-y-4">
                        <h3 className="font-bold text-white">What to remove?</h3>
                        <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)}
                            placeholder="e.g. people, tree, text, car"
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white" />
                    </div>
                );

            case "replace":
                return (
                    <div className="space-y-4">
                        <h3 className="font-bold text-white">Replace Object</h3>
                        <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)}
                            placeholder="Object to find (e.g. apple)"
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white" />
                        <input type="text" value={prompt2} onChange={e => setPrompt2(e.target.value)}
                            placeholder="Replace with (e.g. orange)"
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white" />
                    </div>
                );

            case "recolor":
                return (
                    <div className="space-y-4">
                        <h3 className="font-bold text-white">Object to Recolor</h3>
                        <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)}
                            placeholder="e.g. dress, car, sky"
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white" />
                        <h3 className="font-bold text-white text-sm">New Color</h3>
                        <input type="text" value={prompt2} onChange={e => setPrompt2(e.target.value)}
                            placeholder="e.g. blue, red, golden"
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white" />
                    </div>
                );

            case "bg-replace":
                return (
                    <div className="space-y-4">
                        <h3 className="font-bold text-white">Describe New Background</h3>
                        <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                            placeholder="e.g. sunset beach, modern office, forest trail"
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white h-24 resize-none" />
                    </div>
                );

            case "restore":
                return (
                    <div className="space-y-4">
                        <p className="text-gray-400">AI will automatically enhance quality, remove artifacts, and fix blurriness.</p>
                    </div>
                );

            case "crop":
                return (
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-bold text-white mb-2">Aspect Ratio</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {ASPECT_RATIOS.map(r => (
                                    <button key={r.value} onClick={() => setAspectRatio(r.value)}
                                        className={`p-2 rounded border text-sm ${aspectRatio === r.value ? 'bg-white text-black border-white' : 'border-white/20 text-gray-400'}`}>
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-white mb-2">Smart Focus</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {GRAVITY_OPTIONS.map(g => (
                                    <button key={g.value} onClick={() => setGravity(g.value)}
                                        className={`p-2 rounded border text-xs ${gravity === g.value ? 'bg-white text-black border-white' : 'border-white/20 text-gray-400'}`}>
                                        {g.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case "vision":
                return (
                    <div className="space-y-4 h-full flex flex-col">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> Ask about this image
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-3 bg-black/20 rounded-lg p-3 max-h-48">
                            {visionHistory.length === 0 ? (
                                <p className="text-gray-500 text-sm">Try asking: "What's in this image?" or "Write an Instagram caption"</p>
                            ) : (
                                visionHistory.map((msg, i) => (
                                    <div key={i} className={`p-2 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-500/20 text-blue-200 ml-4' : 'bg-white/5 text-gray-300 mr-4'}`}>
                                        {msg.content}
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="flex gap-2">
                            <input type="text" value={visionQuestion} onChange={e => setVisionQuestion(e.target.value)}
                                placeholder="Ask a question..."
                                onKeyDown={e => e.key === 'Enter' && handleVisionAsk()}
                                className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm" />
                            <button onClick={handleVisionAsk} disabled={isAnalyzing}
                                className="px-4 bg-violet-600 text-white rounded-lg hover:bg-violet-500 disabled:opacity-50">
                                {isAnalyzing ? <Spinner className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                );

            case "tags":
                return (
                    <div className="space-y-4">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Tag className="w-4 h-4" /> Auto-Generated Tags
                        </h3>
                        {tags.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag, i) => (
                                    <span key={i} className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm">{tag}</span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">Click "Analyze" to generate tags</p>
                        )}
                        <button onClick={handleAutoTag} disabled={isAnalyzing || !activeMedia}
                            className="w-full py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 disabled:opacity-50">
                            {isAnalyzing ? "Analyzing..." : "Generate Tags"}
                        </button>
                    </div>
                );

            case "ocr":
                return (
                    <div className="space-y-4">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Extracted Text
                        </h3>
                        {ocrText ? (
                            <div className="bg-black/20 rounded-lg p-3 max-h-48 overflow-y-auto">
                                <p className="text-gray-300 text-sm whitespace-pre-wrap">{ocrText}</p>
                                <button onClick={() => { navigator.clipboard.writeText(ocrText); }}
                                    className="mt-2 text-xs text-blue-400 flex items-center gap-1">
                                    <Copy className="w-3 h-3" /> Copy
                                </button>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">Click "Extract" to read text from the image</p>
                        )}
                        <button onClick={handleOCR} disabled={isAnalyzing || !activeMedia}
                            className="w-full py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-500 disabled:opacity-50">
                            {isAnalyzing ? "Extracting..." : "Extract Text"}
                        </button>
                    </div>
                );

            case "moderate":
                return (
                    <div className="space-y-4">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Shield className="w-4 h-4" /> Content Safety
                        </h3>
                        {moderationResult ? (
                            <div className="space-y-2">
                                <div className={`p-3 rounded-lg ${moderationResult.safe ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                    <p className="font-bold">{moderationResult.safe ? '✓ Safe for Work' : '⚠ Content Warning'}</p>
                                    {moderationResult.categories && (
                                        <p className="text-xs mt-1">{moderationResult.categories.join(', ')}</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">Click "Check" to analyze content safety</p>
                        )}
                        <button onClick={handleModerate} disabled={isAnalyzing || !activeMedia}
                            className="w-full py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-500 disabled:opacity-50">
                            {isAnalyzing ? "Checking..." : "Check Safety"}
                        </button>
                    </div>
                );

            case "transcribe":
                return (
                    <div className="space-y-4">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Mic className="w-4 h-4" /> Video Transcript
                        </h3>
                        {activeMedia?.type !== "video" ? (
                            <p className="text-yellow-400 text-sm">⚠ Select a video to transcribe</p>
                        ) : transcript ? (
                            <div className="bg-black/20 rounded-lg p-3 max-h-48 overflow-y-auto">
                                <p className="text-gray-300 text-sm whitespace-pre-wrap">{transcript}</p>
                                <button onClick={() => { navigator.clipboard.writeText(transcript); }}
                                    className="mt-2 text-xs text-blue-400 flex items-center gap-1">
                                    <Copy className="w-3 h-3" /> Copy
                                </button>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">Click "Transcribe" to generate subtitles</p>
                        )}
                        <button onClick={handleTranscribe} disabled={isAnalyzing || activeMedia?.type !== "video"}
                            className="w-full py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 disabled:opacity-50">
                            {isAnalyzing ? "Transcribing..." : "Transcribe Video"}
                        </button>
                    </div>
                );

            case "preview":
                return (
                    <div className="space-y-4">
                        <h3 className="font-bold text-white">AI Video Preview</h3>
                        <p className="text-gray-400 text-sm">Generate a 5-10 second highlight reel from your video.</p>
                        {activeMedia?.type !== "video" && (
                            <p className="text-yellow-400 text-sm">⚠ Select a video to create preview</p>
                        )}
                    </div>
                );

            case "quality":
                return (
                    <div className="space-y-4">
                        <h3 className="font-bold text-white">Smart Optimization</h3>
                        <p className="text-gray-400 text-sm">AI automatically selects the best format (WebP/AVIF) and compression for optimal quality and size.</p>
                        <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                            <p className="text-green-400 text-sm">✓ Auto-format: Enabled</p>
                            <p className="text-green-400 text-sm">✓ Auto-quality: Enabled</p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // Tool Selection View
    if (mode === "home") {
        const tools = getCurrentTools();

        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                            <Sparkles className="w-8 h-8 text-blue-400" />
                            AI Studio
                        </h1>
                        <p className="text-gray-400 mt-2">Professional AI-powered media tools</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-xl w-fit">
                    <button onClick={() => setActiveTab("create")}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === "create" ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>
                        ✨ Create
                    </button>
                    <button onClick={() => setActiveTab("analyze")}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === "analyze" ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>
                        🔍 Analyze
                    </button>
                    <button onClick={() => setActiveTab("optimize")}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === "optimize" ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>
                        ⚡ Optimize
                    </button>
                </div>

                {/* Tool Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {tools.map(tool => (
                        <button
                            key={tool.id}
                            onClick={() => { setMode(tool.id as StudioMode); setGenerated(false); }}
                            className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all text-left flex flex-col gap-3 group"
                        >
                            <div className={`p-3 rounded-xl bg-white/5 w-fit ${tool.color} group-hover:scale-110 transition-transform`}>
                                <tool.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{tool.label}</h3>
                                <p className="text-sm text-gray-400">{tool.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Editor View
    const allTools = [...CREATE_TOOLS, ...ANALYZE_TOOLS, ...OPTIMIZE_TOOLS];
    const currentTool = allTools.find(t => t.id === mode);
    const isAnalyzeTool = ANALYZE_TOOLS.some(t => t.id === mode);

    return (
        <div className="container mx-auto px-4 py-6 h-[calc(100vh-80px)] relative">
            {isProcessing && <AILoader label={`Processing ${currentTool?.label}...`} />}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => { setMode("home"); setGenerated(false); setVisionHistory([]); setTags([]); setOcrText(""); setModerationResult(null); setTranscript(""); }}
                        className="p-2 hover:bg-white/10 rounded-full text-white">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        {currentTool?.icon && <currentTool.icon className={`w-6 h-6 ${currentTool?.color}`} />}
                        {currentTool?.label}
                    </h2>
                </div>

                {generated && !isAnalyzeTool && (
                    <div className="flex gap-2 animate-in fade-in slide-in-from-right-4">
                        <button onClick={handleDiscard} className="px-4 py-2 text-white hover:bg-white/10 rounded-full border border-white/20">Discard</button>
                        <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200">
                            {isSaving ? "Saving..." : "Save to Dashboard"}
                        </button>
                    </div>
                )}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100%-80px)]">
                {/* Left: Media Library */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 max-h-[35vh] overflow-hidden">
                        <h3 className="font-bold text-white text-sm">Select Media</h3>
                        <label className="cursor-pointer bg-white text-black py-2 rounded-lg text-sm font-bold text-center hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                            {isUploading ? <Spinner className="w-4 h-4 text-black" /> : <Upload className="w-4 h-4" />} Upload
                            <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                        </label>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                            {images.map(img => (
                                <div key={img.id} onClick={() => { setActiveMedia({ publicId: img.publicId, type: "image" }); setGenerated(false); }}
                                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${activeMedia?.publicId === img.publicId ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5 border border-transparent'}`}>
                                    <div className="w-10 h-10 bg-black rounded overflow-hidden flex-shrink-0">
                                        <img src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,w_80,h_80/${img.publicId}`} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="truncate text-xs text-gray-300">{img.title}</span>
                                </div>
                            ))}
                            {videos.map(v => (
                                <div key={v.id} onClick={() => { setActiveMedia({ publicId: v.publicId, type: "video" }); setGenerated(false); }}
                                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${activeMedia?.publicId === v.publicId ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5 border border-transparent'}`}>
                                    <div className="w-10 h-10 bg-black rounded overflow-hidden flex-shrink-0 relative">
                                        <img src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/c_fill,w_80,h_80,so_0/${v.publicId}.jpg`} className="w-full h-full object-cover" />
                                        <VideoIcon className="absolute bottom-0.5 right-0.5 w-3 h-3 text-white" />
                                    </div>
                                    <span className="truncate text-xs text-gray-300">{v.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tool Controls */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex-1 overflow-y-auto">
                        {renderToolControls()}
                        {!isAnalyzeTool && (
                            <button onClick={handleGenerate} disabled={!activeMedia || isProcessing || generated}
                                className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                                {isProcessing ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                {generated ? "Generated" : "Generate"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Center: Preview Canvas */}
                <div className="lg:col-span-9 bg-black/40 border border-white/5 rounded-2xl p-6 flex items-center justify-center relative overflow-hidden">
                    {!activeMedia ? (
                        <div className="text-center text-gray-500">
                            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p>Select or upload media to start</p>
                        </div>
                    ) : activeMedia.type === "video" ? (
                        <div className="relative w-full max-w-4xl aspect-video shadow-2xl rounded-lg overflow-hidden">
                            <CldVideoPlayer
                                width="1920"
                                height="1080"
                                src={activeMedia.publicId}
                                colors={{
                                    accent: "#3b82f6",
                                    base: "#000000",
                                    text: "#ffffff"
                                }}
                                // Auto-generate AI preview if mode is preview
                                transformation={mode === "preview" ? {
                                    effect: "preview:duration_5" // Generates 5s highlight
                                } : undefined}
                            />
                        </div>
                    ) : (
                        <div className="relative max-w-full max-h-full shadow-2xl transition-all duration-500">
                            <CldImage
                                width="960"
                                height="600"
                                src={activeMedia.publicId}
                                sizes="100vw"
                                alt="Preview"
                                className="rounded-lg object-contain max-h-[70vh]"
                                // Generative Fill
                                fillBackground={generated && mode === "fill"}
                                crop={generated && mode === "fill" ? "pad" : (generated && mode === "crop" ? "fill" : undefined)}
                                aspectRatio={generated && (mode === "fill" || mode === "crop") ? aspectRatio : undefined}
                                gravity={generated && mode === "crop" ? gravity : undefined}
                                // Generative Remove
                                remove={generated && mode === "remove" && prompt ? prompt : undefined}
                                // Generative Replace
                                replace={generated && mode === "replace" && prompt && prompt2 ? { from: prompt, to: prompt2 } : undefined}
                                // Recolor
                                recolor={generated && mode === "recolor" && prompt && prompt2 ? [prompt, prompt2] : undefined}
                                // Restore
                                restore={generated && mode === "restore"}
                                // Background Replace
                                replaceBackground={generated && mode === "bg-replace" && prompt ? prompt : undefined}
                                // Quality Optimization
                                format={mode === "quality" ? "auto" : undefined}
                                quality={mode === "quality" ? "auto" : undefined}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
