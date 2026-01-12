"use client";

import React from "react";
import Link from "next/link";

interface HeroProps {
    onOpenAuth: (mode: "signin" | "signup") => void;
}

function Hero({ onOpenAuth }: HeroProps) {
    const items = [
        { type: "image", src: "/assets/videos/bolt_cam.gif" },
        { type: "image", src: "/assets/videos/roll_transition.gif" },
        { type: "image", src: "/assets/videos/fast_motion.gif" },
        { type: "image", src: "/assets/videos/slow_motion.gif" },
        { type: "image", src: "/assets/videos/video_90s.gif" },
        { type: "image", src: "/assets/videos/echo_print.gif" },
    ];

    return (
        <section className="relative min-h-[110vh] flex flex-col justify-center items-center overflow-hidden pt-32 pb-20">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white rounded-full opacity-5 blur-[120px] pointer-events-none"></div>

            {/* Text Content */}
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mb-16">
                <div className="inline-block px-3 py-1 mb-6 rounded-full glass-panel text-xs font-medium tracking-wider text-gray-400 uppercase">
                    AI-Powered Video Clarity
                </div>
                <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
                    Master Your <br /> Video Content.
                </h1>
                <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto mb-8 font-light leading-relaxed">
                    Transform, optimize, and share your video assets with next-generation AI processing. Minimalist workflow, maximum impact.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => onOpenAuth("signup")}
                        className="bg-white text-black px-8 py-3.5 rounded-full text-base font-bold hover:bg-gray-200 transition-transform hover:scale-105 active:scale-95 duration-200"
                    >
                        Get Started
                    </button>
                    <a href="#demo" className="glass-button px-8 py-3.5 rounded-full text-base font-medium flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        Watch Demo
                    </a>
                </div>
            </div>

            {/* Infinite Straight Scroller */}
            <div className="relative w-full overflow-hidden py-10">
                <div className="flex gap-6 w-max animate-scroll-x">
                    {/* Duplicate list exactly once for 2 sets. Scroll to -50% creates seamless loop. */}
                    {[...items, ...items].map((item, i) => (
                        <div key={i} className="relative w-[250px] md:w-[350px] aspect-video flex-shrink-0 glass-panel border-0 rounded-3xl overflow-hidden">
                            <img
                                src={item.src}
                                alt={`Visual ${i}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>
                {/* Gradients to fade edges */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-lumina-black to-transparent z-10 pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-lumina-black to-transparent z-10 pointer-events-none"></div>
            </div>
        </section>
    );
}

export default Hero;
