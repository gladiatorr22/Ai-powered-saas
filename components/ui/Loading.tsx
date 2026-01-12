import React from "react";
import { Sparkles, Loader2 } from "lucide-react";

export function Spinner({ className = "w-4 h-4" }: { className?: string }) {
    return <Loader2 className={`animate-spin ${className}`} />;
}

export function Skeleton({ className = "h-4 w-full" }: { className?: string }) {
    return <div className={`animate-pulse bg-white/5 rounded ${className}`} />;
}

export function AILoader({ label = "Generating..." }: { label?: string }) {
    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-75 blur-lg animate-pulse"></div>
                <div className="relative bg-black p-4 rounded-full border border-white/10">
                    <Sparkles className="w-8 h-8 text-white animate-spin-slow" />
                </div>
            </div>
            <p className="mt-4 text-white font-bold text-lg animate-pulse">{label}</p>
        </div>
    );
}

export function VideoGridSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-video bg-white/5 rounded-xl animate-pulse" />
            ))}
        </div>
    );
}
