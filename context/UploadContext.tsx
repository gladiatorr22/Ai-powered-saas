"use client";

import { createContext, useContext, useState } from "react";

interface UploadContextType {
    isUploadOpen: boolean;
    openUpload: () => void;
    closeUpload: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: React.ReactNode }) {
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    return (
        <UploadContext.Provider value={{ isUploadOpen, openUpload: () => setIsUploadOpen(true), closeUpload: () => setIsUploadOpen(false) }}>
            {children}
        </UploadContext.Provider>
    );
}

export function useUpload() {
    const context = useContext(UploadContext);
    if (!context) throw new Error("useUpload must be used within UploadProvider");
    return context;
}
