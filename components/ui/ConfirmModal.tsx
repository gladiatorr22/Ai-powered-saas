import React from "react";
import { X } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    primaryAction?: {
        label: string;
        onClick: () => void;
        className?: string;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
        className?: string;
    };
}

export default function ConfirmModal({
    isOpen,
    onClose,
    title,
    message,
    primaryAction,
    secondaryAction,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all animate-in fade-in zoom-in-95">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 mb-6">{message}</p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>

                    {secondaryAction && (
                        <button
                            onClick={secondaryAction.onClick}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${secondaryAction.className || "bg-white/10 text-white hover:bg-white/20"}`}
                        >
                            {secondaryAction.label}
                        </button>
                    )}

                    {primaryAction && (
                        <button
                            onClick={primaryAction.onClick}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${primaryAction.className || "bg-white text-black hover:bg-gray-200"}`}
                        >
                            {primaryAction.label}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
