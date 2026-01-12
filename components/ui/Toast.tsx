"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

// Toast Types
export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Icons
const toastIcons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
};

// Toast Styles
const toastStyles: Record<ToastType, string> = {
    success: "border-green-500/30 bg-green-500/10",
    error: "border-red-500/30 bg-red-500/10",
    warning: "border-yellow-500/30 bg-yellow-500/10",
    info: "border-blue-500/30 bg-blue-500/10",
};

// Toast Component
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
    React.useEffect(() => {
        const timer = setTimeout(onRemove, toast.duration || 4000);
        return () => clearTimeout(timer);
    }, [toast.duration, onRemove]);

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg animate-in slide-in-from-right-5 fade-in duration-300 ${toastStyles[toast.type]}`}
        >
            {toastIcons[toast.type]}
            <p className="text-sm text-white font-medium flex-1">{toast.message}</p>
            <button
                onClick={onRemove}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
                <X className="w-4 h-4 text-gray-400" />
            </button>
        </div>
    );
}

// Toast Provider
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback(
        (message: string, type: ToastType = "info", duration: number = 4000) => {
            const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            setToasts((prev) => [...prev, { id, message, type, duration }]);
        },
        []
    );

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 max-w-sm">
                {toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onRemove={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

// Hook for using Toast
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
