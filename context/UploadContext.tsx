"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface UploadContextType {
    isUploadOpen: boolean;
    openUpload: () => void;
    closeUpload: () => void;
    onUploadComplete: (() => void) | null;
    setOnUploadComplete: (callback: (() => void) | null) => void;
    triggerUploadComplete: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: React.ReactNode }) {
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [onUploadComplete, setOnUploadComplete] = useState<(() => void) | null>(null);

    const triggerUploadComplete = useCallback(() => {
        if (onUploadComplete) {
            onUploadComplete();
        }
    }, [onUploadComplete]);

    return (
        <UploadContext.Provider value={{
            isUploadOpen,
            openUpload: () => setIsUploadOpen(true),
            closeUpload: () => setIsUploadOpen(false),
            onUploadComplete,
            setOnUploadComplete,
            triggerUploadComplete
        }}>
            {children}
        </UploadContext.Provider>
    );
}

export function useUpload() {
    const context = useContext(UploadContext);
    if (!context) throw new Error("useUpload must be used within UploadProvider");
    return context;
}
