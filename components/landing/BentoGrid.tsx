import React from "react";
import Link from "next/link";

function BentoGrid() {
    return (
        <section id="features" className="py-20 px-4 relative">
            <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: 'url(/assets/bento_bg.png)', backgroundSize: 'cover' }}>
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-block px-3 py-1 mb-4 rounded-full glass-panel text-xs font-medium tracking-wider text-gray-400 uppercase">
                        Efficiency First
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Designed for Speed</h2>
                </div>

                {/* 2x2 Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Card 1: Neural Processing */}
                    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group h-[200px]">
                        <div className="absolute inset-0 opacity-10">
                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M0 50 Q 50 0 100 50 T 200 50" stroke="white" strokeWidth="0.5" fill="none" />
                                <path d="M0 70 Q 50 20 100 70 T 200 70" stroke="white" strokeWidth="0.5" fill="none" opacity="0.5" />
                            </svg>
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-end">
                            <h3 className="text-lg font-bold text-white mb-1">Neural Processing</h3>
                            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
                                AI-driven compression.
                            </p>
                        </div>
                    </div>

                    {/* Card 2: Instant Share */}
                    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group h-[200px]">
                        <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-end">
                            <h3 className="text-lg font-bold text-white mb-1">Instant Share</h3>
                            <p className="text-xs text-gray-500">
                                Formatted for all platforms.
                            </p>
                        </div>
                    </div>

                    {/* Card 3: Smart Limits */}
                    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group h-[200px]">
                        <div className="absolute -right-10 -top-10 w-32 h-32 border border-white/5 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="text-3xl font-mono text-white/20 font-bold">70MB</div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Smart Limits</h3>
                                <p className="text-xs text-gray-500">
                                    Micro-content optimized.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Dashboard Link */}
                    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between group h-[200px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="z-10">
                            <h3 className="text-lg font-bold text-white mb-1">Clean Dashboard</h3>
                            <p className="text-xs text-gray-500">Manage efficiently.</p>
                        </div>
                        <div className="flex justify-end">
                            <Link href="/home" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white text-black transition-colors">
                                <svg className="w-4 h-4 text-white group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

export default BentoGrid;
