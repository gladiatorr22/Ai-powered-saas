"use client";

import React, { useState } from "react";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode: "signin" | "signup";
}

export default function AuthModal({ isOpen, onClose, initialMode }: AuthModalProps) {
    const [mode, setMode] = useState<"signin" | "signup">(initialMode);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [pendingVerification, setPendingVerification] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { signIn, isLoaded: signInLoaded, setActive: setSignInActive } = useSignIn();
    const { signUp, isLoaded: signUpLoaded, setActive: setSignUpActive } = useSignUp();
    const router = useRouter();

    // Reset state when modal opens or mode changes externally
    React.useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setError("");
            setPendingVerification(false);
            setIsLoading(false);
        }
    }, [isOpen, initialMode]);

    if (!isOpen) return null;

    const handleGoogleAuth = async () => {
        setIsLoading(true);
        try {
            if (mode === "signin") {
                if (!signInLoaded) return;
                signIn.authenticateWithRedirect({
                    strategy: "oauth_google",
                    redirectUrl: "/sso-callback",
                    redirectUrlComplete: "/dashboard",
                });
            } else {
                if (!signUpLoaded) return;
                signUp.authenticateWithRedirect({
                    strategy: "oauth_google",
                    redirectUrl: "/sso-callback",
                    redirectUrlComplete: "/dashboard",
                });
            }
        } catch (err) {
            setIsLoading(false);
            setError("Failed to connect with Google");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            if (mode === "signin") {
                if (!signInLoaded) return;
                const result = await signIn.create({
                    identifier: email,
                    password,
                });

                if (result.status === "complete") {
                    await setSignInActive({ session: result.createdSessionId });
                    router.push("/dashboard");
                    onClose();
                } else {
                    console.log(result);
                    setError("Login incomplete. Please verify your account.");
                }
            } else {
                if (!signUpLoaded) return;
                await signUp.create({
                    emailAddress: email,
                    password,
                });

                await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
                setPendingVerification(true);
            }
        } catch (err: unknown) {
            const clerkError = err as { errors?: { message?: string }[] };
            setError(clerkError.errors?.[0]?.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        if (!signUpLoaded) return;

        try {
            const result = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (result.status === "complete") {
                await setSignUpActive({ session: result.createdSessionId });
                router.push("/dashboard");
                onClose();
            } else {
                setError("Invalid code.");
            }
        } catch (err: unknown) {
            const clerkError = err as { errors?: { message?: string }[] };
            setError(clerkError.errors?.[0]?.message || "Verification failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative w-full max-w-md glass-panel-dark border border-white/10 rounded-3xl p-8 shadow-2xl animate-scale-in overflow-hidden">

                {/* Glow effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-white/10 blur-[50px] rounded-full pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-0 right-0 p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>

                    <h2 className="text-2xl font-bold text-white mb-2">
                        {pendingVerification ? "Verify Email" : (mode === "signin" ? "Welcome Back" : "Create Account")}
                    </h2>
                    <p className="text-sm text-gray-400 mb-6">
                        {pendingVerification
                            ? `Enter code sent to ${email}`
                            : "Access your AI workspace"}
                    </p>

                    {pendingVerification ? (
                        <form onSubmit={handleVerify} className="w-full flex flex-col gap-4">
                            <input
                                type="text"
                                placeholder="Verification Code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-white/30 focus:outline-none transition-colors"
                                required
                            />
                            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Verify Account
                            </button>
                        </form>
                    ) : (
                        <>
                            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-white/30 focus:outline-none transition-colors"
                                    required
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-white/30 focus:outline-none transition-colors"
                                    required
                                />
                                {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {mode === "signin" ? "Sign In" : "Sign Up"}
                                </button>
                            </form>

                            <div className="w-full flex items-center gap-4 my-6">
                                <div className="h-px bg-white/10 flex-1"></div>
                                <span className="text-xs text-gray-500 uppercase">Or continue with</span>
                                <div className="h-px bg-white/10 flex-1"></div>
                            </div>

                            <button
                                onClick={handleGoogleAuth}
                                disabled={isLoading}
                                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                )}
                                Google
                            </button>

                            <div className="mt-6 text-sm text-gray-400">
                                {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    onClick={() => {
                                        setMode(mode === "signin" ? "signup" : "signin");
                                        setError("");
                                    }}
                                    className="text-white hover:underline font-medium"
                                >
                                    {mode === "signin" ? "Sign up" : "Sign in"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
